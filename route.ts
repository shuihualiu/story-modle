import { NextRequest, NextResponse } from 'next/server';

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(`[wechat-js-sdk-signature] Missing required env var: ${name}`);
  }
  return v.trim();
}

function mask(s: string, left = 4, right = 4): string {
  if (s.length <= left + right) return '***';
  return `${s.slice(0, left)}***${s.slice(-right)}`;
}

/** 服务号配置：用于 JS-SDK 签名（wx.config），与开放标签中的「移动应用 AppID」不同。见 WECHAT_SETUP.md §11.2 */
function getWechatConfig() {
  const WECHAT_MP_APP_ID =
    process.env.WECHAT_MP_APP_ID != null && process.env.WECHAT_MP_APP_ID.trim() !== ''
      ? process.env.WECHAT_MP_APP_ID.trim()
      : 'wx220fe61035e87546';
  const WECHAT_MP_APP_SECRET =
    process.env.WECHAT_MP_APP_SECRET != null && process.env.WECHAT_MP_APP_SECRET.trim() !== ''
      ? process.env.WECHAT_MP_APP_SECRET.trim()
      : '318c50022dbacdae94cd3cda2134b49f';

  return {
    WECHAT_MP_APP_ID,
    WECHAT_MP_APP_SECRET,
  };
}

// 简单内存缓存，减少对微信服务器的调用（在同一 Node 进程内共享）
let cachedAccessToken: string | null = null;
let cachedAccessTokenExpireAt = 0;

let cachedJsapiTicket: string | null = null;
let cachedJsapiTicketExpireAt = 0;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedAccessToken && now < cachedAccessTokenExpireAt) {
    return cachedAccessToken;
  }

  const { WECHAT_MP_APP_ID, WECHAT_MP_APP_SECRET } = getWechatConfig();

  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_MP_APP_ID}&secret=${WECHAT_MP_APP_SECRET}`;
  console.log('[wechat-js-sdk-signature] Fetching access_token, appid:', mask(WECHAT_MP_APP_ID));

  const res = await fetch(url);
  const data = await res.json();
  console.log('[wechat-js-sdk-signature] access_token response:', res.status, data);

  if (!res.ok || (data as any).errcode) {
    throw new Error(
      `WeChat getAccessToken error (${(data as any)?.errcode ?? res.status}): ${
        (data as any)?.errmsg || res.statusText
      }`,
    );
  }

  const expiresIn = ((data as any).expires_in ?? 7200) as number;
  cachedAccessToken = (data as any).access_token as string;
  // 提前 5 分钟过期
  cachedAccessTokenExpireAt = now + (expiresIn - 300) * 1000;

  return cachedAccessToken!;
}

async function getJsapiTicket(): Promise<string> {
  const now = Date.now();
  if (cachedJsapiTicket && now < cachedJsapiTicketExpireAt) {
    return cachedJsapiTicket;
  }

  const accessToken = await getAccessToken();
  const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=${accessToken}`;
  console.log('[wechat-js-sdk-signature] Fetching jsapi_ticket');

  const res = await fetch(url);
  const data = await res.json();
  console.log('[wechat-js-sdk-signature] jsapi_ticket response:', res.status, data);

  if (!res.ok || (data as any).errcode !== 0) {
    throw new Error(
      `WeChat getJsapiTicket error (${(data as any)?.errcode ?? res.status}): ${
        (data as any)?.errmsg || res.statusText
      }`,
    );
  }

  const expiresIn = ((data as any).expires_in ?? 7200) as number;
  cachedJsapiTicket = (data as any).ticket as string;
  cachedJsapiTicketExpireAt = now + (expiresIn - 300) * 1000;

  return cachedJsapiTicket!;
}

async function sha1Hex(input: string): Promise<string> {
  // 使用 Web Crypto（Next.js Node runtime 也提供了兼容的 crypto.subtle）
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function createNonceStr(length = 16): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let str = '';
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

function createTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

async function createSignature(url: string) {
  const jsapiTicket = await getJsapiTicket();
  const { WECHAT_MP_APP_ID } = getWechatConfig();
  const nonceStr = createNonceStr();
  const timestamp = createTimestamp();

  // 按微信文档要求的格式拼接待签名字符串
  const stringToSign = `jsapi_ticket=${jsapiTicket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;

  const signature = await sha1Hex(stringToSign);

  return {
    appId: WECHAT_MP_APP_ID,
    nonceStr,
    timestamp,
    signature,
  };
}

function buildCorsHeaders(req: NextRequest): Record<string, string> {
  // 尽量按请求回显，减少浏览器/微信内置浏览器的兼容问题
  const origin = req.headers.get('origin') ?? '*';
  const reqHeaders = req.headers.get('access-control-request-headers') ?? 'Content-Type';

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': reqHeaders,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function jsonResponse(req: NextRequest, body: unknown, status = 200): NextResponse {
  const cors = buildCorsHeaders(req);
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...cors,
    },
  });
}

function emptyResponse(req: NextRequest, status: number): NextResponse {
  const cors = buildCorsHeaders(req);
  return new NextResponse(null, {
    status,
    headers: cors,
  });
}

export async function OPTIONS(req: NextRequest) {
  const log = (msg: string, ...args: unknown[]) =>
    console.log(
      `[wechat-js-sdk-signature] ${new Date().toISOString()} ${msg}`,
      ...args,
    );

  log(
    'OPTIONS request, url:',
    req.url,
    'origin:',
    req.headers.get('origin'),
    'acr-headers:',
    req.headers.get('access-control-request-headers'),
  );

  return emptyResponse(req, 204);
}

export async function POST(req: NextRequest) {
  const log = (msg: string, ...args: unknown[]) =>
    console.log(
      `[wechat-js-sdk-signature] ${new Date().toISOString()} ${msg}`,
      ...args,
    );

  try {
    log(
      'POST request, url:',
      req.url,
      'origin:',
      req.headers.get('origin'),
      'ua:',
      req.headers.get('user-agent'),
    );

    const body = (await req.json().catch((e) => {
      log('JSON parse error:', e);
      return {};
    })) as any;

    const url = (body?.url ?? '').toString().trim();

    log('Request body.url:', url || '(empty)');

    if (!url) {
      log('Missing url, return 400');
      return jsonResponse(req, { error: 'Missing url' }, 400);
    }

    log('Creating signature for url:', url);
    const sign = await createSignature(url);
    log('Signature created, appId:', sign.appId, 'timestamp:', sign.timestamp);

    return jsonResponse(req, sign, 200);
  } catch (error) {
    console.error('[wechat-js-sdk-signature] Error:', error);
    return jsonResponse(
      req,
      { error: (error as Error).message ?? 'Internal error' },
      500,
    );
  }
}

