// 国际版分享 OG 预览（Vercel Serverless，无需 Supabase JWT）
// IM 爬虫读取 og:* meta；真人浏览器跳转到 H5 落地页。
// 与 supabase/functions/global-share-og/index.ts 逻辑保持一致。

const LANDING_BASE =
  'https://global.haloutongxue.com/h5/global/index.html';
const STATIC_ILLUSTRATION_BASE =
  'https://global.haloutongxue.com/h5/global/';
const DEFAULT_OG_IMAGE =
  'https://global.haloutongxue.com/h5/global/default-og.webp';

function resolveStaticIllustrationUrl(fileName) {
  const normalized = fileName.replace(/\.png$/i, '.webp');
  if (!/^[\w.-]+\.webp$/i.test(normalized)) {
    return DEFAULT_OG_IMAGE;
  }
  return `${STATIC_ILLUSTRATION_BASE}${normalized}`;
}

function resolveOgImage(params) {
  const explicit = (params.ogImage || '').trim();
  if (explicit) {
    if (/\/h5\/global\//i.test(explicit)) {
      return explicit.replace(/\.png(\?|#|$)/i, '.webp$1');
    }
    return explicit;
  }

  const img = (params.img || '').trim();
  if (img) {
    return resolveStaticIllustrationUrl(img);
  }

  return DEFAULT_OG_IMAGE;
}

function escapeHtml(raw) {
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildLandingUrl(params) {
  const qs = new URLSearchParams(params).toString();
  return qs ? `${LANDING_BASE}?${qs}` : LANDING_BASE;
}

function buildOgHtml(params) {
  const title = (params.title || '').trim() || 'Plan Together';
  const mainText = (params.mainText || '').trim() || '';
  const ogImage = resolveOgImage(params);
  const landingUrl = buildLandingUrl(params);

  const ogTitle = mainText ? `${title} · ${mainText}` : title;
  const ogDescription = 'Tap to join this plan in Plan Together';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(ogTitle)}</title>
  <meta name="description" content="${escapeHtml(ogDescription)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Plan Together">
  <meta property="og:title" content="${escapeHtml(ogTitle)}">
  <meta property="og:description" content="${escapeHtml(ogDescription)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta property="og:url" content="${escapeHtml(landingUrl)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}">
  <meta name="twitter:description" content="${escapeHtml(ogDescription)}">
  <meta name="twitter:image" content="${escapeHtml(ogImage)}">
  <meta http-equiv="refresh" content="0;url=${escapeHtml(landingUrl)}">
  <script>window.location.replace(${JSON.stringify(landingUrl)});</script>
</head>
<body>
  <p>Redirecting… <a href="${escapeHtml(landingUrl)}">Open plan</a></p>
</body>
</html>`;
}

module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'authorization, x-client-info, apikey, content-type',
    );
    res.status(200).send('ok');
    return;
  }

  const html = buildOgHtml(req.query || {});

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.status(200).send(html);
};
