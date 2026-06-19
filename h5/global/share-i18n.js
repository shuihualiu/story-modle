/**
 * 海外版分享 H5 文案：国家码 → 语言 → 日常 / 习惯 / 纪念日模板文案。
 * 与 App [LanguageManager.overseasCountryLanguageCodes] 对齐（28 种语言）。
 *
 * 中文原文（设计稿）：
 * - daily:    重要事项 | 共享提醒 | 加入事项
 * - habit:    与更好相遇 | 一起吧 | 加入习惯
 * - memorial: 加入我们的美好 | 加入忆站
 */
(function (global) {
  var COUNTRY_TO_LANG = {
    CN: 'zh', IN: 'hi', HK: 'zh', MO: 'zh', JP: 'ja', KR: 'ko', PK: 'ur', BD: 'bn',
    TH: 'th', SG: 'en', MY: 'ms', ID: 'id', PH: 'fil', VN: 'vi', AE: 'ar', SA: 'ar',
    AU: 'en', NZ: 'en', GB: 'en', CH: 'de', SE: 'sv', NO: 'nb', DK: 'da', PL: 'pl',
    RU: 'ru', TR: 'tr', UA: 'uk', US: 'en', CA: 'en', MX: 'es', BR: 'pt', AR: 'es',
    CL: 'es', CO: 'es', PE: 'es', DE: 'de', FR: 'fr', IT: 'it', ES: 'es', PT: 'pt',
    NL: 'nl', BE: 'nl', LU: 'fr', AT: 'de', FI: 'fi', IE: 'en', GR: 'el'
  };

  var TEXT = {
    zh: {
      daily: { left: '重要事项', right: '共享提醒', btn: '加入事项' },
      habit: { left: '与更好相遇', right: '一起吧', btn: '加入习惯' },
      memorial: { center: '加入我们的美好', btn: '加入忆站' },
      hint: '正在打开 App… 若无响应，请前往商店安装。',
      ogDesc: '点击加入 Plan Together 中的计划'
    },
    en: {
      daily: { left: 'Important matters', right: 'Shared reminders', btn: 'Join item' },
      habit: { left: 'Meet something better', right: "Let's go together", btn: 'Join habit' },
      memorial: { center: 'Join our beautiful moments', btn: 'Join Memory Station' },
      hint: 'Opening the app… If nothing happens, install from the store.',
      ogDesc: 'Tap to join this plan in Plan Together'
    },
    ja: {
      daily: { left: '重要な用事', right: '共有リマインダー', btn: '項目に参加' },
      habit: { left: 'より良い出会い', right: '一緒にしよう', btn: '習慣に参加' },
      memorial: { center: '私たちの美好に加わる', btn: '記念ステーションに参加' },
      hint: 'アプリを開いています… 反応がない場合はストアからインストールしてください。',
      ogDesc: 'Plan Together のプランに参加'
    },
    ko: {
      daily: { left: '중요한 일정', right: '공유 알림', btn: '항목 참여' },
      habit: { left: '더 나은 만남', right: '함께해요', btn: '습관 참여' },
      memorial: { center: '우리의 아름다움에 함께', btn: '기억 스테이션 참여' },
      hint: '앱을 여는 중… 반응이 없으면 스토어에서 설치하세요.',
      ogDesc: 'Plan Together 계획에 참여하기'
    },
    fr: {
      daily: { left: 'Affaires importantes', right: 'Rappels partagés', btn: "Rejoindre l'élément" },
      habit: { left: 'Vers le meilleur', right: 'Allons-y', btn: "Rejoindre l'habitude" },
      memorial: { center: 'Rejoignons nos beaux moments', btn: 'Rejoindre la station souvenir' },
      hint: "Ouverture de l'app… Sinon, installez depuis le store.",
      ogDesc: 'Rejoignez ce plan dans Plan Together'
    },
    de: {
      daily: { left: 'Wichtige Termine', right: 'Geteilte Erinnerungen', btn: 'Element beitreten' },
      habit: { left: 'Dem Besseren begegnen', right: 'Los geht\'s', btn: 'Gewohnheit beitreten' },
      memorial: { center: 'Werde Teil unserer schönen Momente', btn: 'Gedenkstation beitreten' },
      hint: 'App wird geöffnet… Falls nichts passiert, im Store installieren.',
      ogDesc: 'Diesem Plan in Plan Together beitreten'
    },
    es: {
      daily: { left: 'Asuntos importantes', right: 'Recordatorios compartidos', btn: 'Unirse al asunto' },
      habit: { left: 'Encuentra lo mejor', right: 'Vamos juntos', btn: 'Unirse al hábito' },
      memorial: { center: 'Únete a nuestra belleza', btn: 'Unirse a la estación de recuerdos' },
      hint: 'Abriendo la app… Si no ocurre nada, instala desde la tienda.',
      ogDesc: 'Únete a este plan en Plan Together'
    },
    ru: {
      daily: { left: 'Важные дела', right: 'Общие напоминания', btn: 'Присоединиться к делу' },
      habit: { left: 'К лучшему', right: 'Вместе', btn: 'Присоединиться к привычке' },
      memorial: { center: 'Присоединяйся к нашей красоте', btn: 'Присоединиться к станции памяти' },
      hint: 'Открываем приложение… Если не сработало, установите из магазина.',
      ogDesc: 'Присоединиться к плану в Plan Together'
    },
    it: {
      daily: { left: 'Cose importanti', right: 'Promemoria condivisi', btn: "Unisciti all'elemento" },
      habit: { left: 'Verso il meglio', right: 'Insieme', btn: "Unisciti all'abitudine" },
      memorial: { center: 'Unisciti ai nostri bei momenti', btn: 'Unisciti alla stazione dei ricordi' },
      hint: "Apertura dell'app… Se non succede nulla, installa dallo store.",
      ogDesc: 'Unisciti a questo piano su Plan Together'
    },
    ar: {
      daily: { left: 'أمور مهمة', right: 'تذكيرات مشتركة', btn: 'انضم للأمر' },
      habit: { left: 'لقاء أفضل', right: 'هيا معًا', btn: 'انضم للعادة' },
      memorial: { center: 'انضم إلى جمالنا', btn: 'انضم لمحطة الذكريات' },
      hint: 'جارٍ فتح التطبيق… إن لم يحدث شيء، ثبّت من المتجر.',
      ogDesc: 'انضم إلى هذه الخطة في Plan Together'
    },
    hi: {
      daily: { left: 'महत्वपूर्ण कार्य', right: 'साझा रिमाइंडर', btn: 'कार्य में शामिल हों' },
      habit: { left: 'बेहतर से मिलें', right: 'चलो साथ चलें', btn: 'आदत में शामिल हों' },
      memorial: { center: 'हमारी खूबसूरती में शामिल हों', btn: 'स्मृति स्टेशन में शामिल हों' },
      hint: 'ऐप खोला जा रहा है… यदि कुछ न हो, तो स्टोर से इंस्टॉल करें।',
      ogDesc: 'Plan Together में इस योजना में शामिल हों'
    },
    ur: {
      daily: { left: 'اہم معاملات', right: 'مشترکہ یاددہانیاں', btn: 'معاملے میں شامل ہوں' },
      habit: { left: 'بہتر سے ملیں', right: 'چلیں ساتھ', btn: 'عادت میں شامل ہوں' },
      memorial: { center: 'ہماری خوبصورتی میں شامل ہوں', btn: 'یادگار اسٹیشن میں شامل ہوں' },
      hint: 'ایپ کھولی جا رہی ہے… اگر کچھ نہ ہو تو اسٹور سے انسٹال کریں۔',
      ogDesc: 'Plan Together میں اس منصوبے میں شامل ہوں'
    },
    bn: {
      daily: { left: 'গুরুত্বপূর্ণ কাজ', right: 'ভাগ করা স্মরণিকা', btn: 'বিষয়ে যোগ দিন' },
      habit: { left: 'আরও ভালোর সাথে', right: 'চলো একসাথে', btn: 'অভ্যাসে যোগ দিন' },
      memorial: { center: 'আমাদের সুন্দর মুহূর্তে যোগ দিন', btn: 'স্মৃতি স্টেশনে যোগ দিন' },
      hint: 'অ্যাপ খোলা হচ্ছে… কিছু না হলে স্টোর থেকে ইনস্টল করুন।',
      ogDesc: 'Plan Together-এ এই পরিকল্পনায় যোগ দিন'
    },
    th: {
      daily: { left: 'เรื่องสำคัญ', right: 'การแจ้งเตือนร่วม', btn: 'เข้าร่วมเรื่อง' },
      habit: { left: 'พบสิ่งที่ดีกว่า', right: 'ไปด้วยกัน', btn: 'เข้าร่วมนิสัย' },
      memorial: { center: 'เข้าร่วมความงามของเรา', btn: 'เข้าร่วมสถานีความทรงจำ' },
      hint: 'กำลังเปิดแอป… หากไม่มีอะไรเกิดขึ้น ให้ติดตั้งจากร้านค้า',
      ogDesc: 'เข้าร่วมแผนนี้ใน Plan Together'
    },
    ms: {
      daily: { left: 'Perkara penting', right: 'Peringatan kongsi', btn: 'Sertai perkara' },
      habit: { left: 'Temui yang lebih baik', right: 'Mari bersama', btn: 'Sertai tabiat' },
      memorial: { center: 'Sertai keindahan kita', btn: 'Sertai stesen kenangan' },
      hint: 'Membuka aplikasi… Jika tiada tindak balas, pasang dari kedai.',
      ogDesc: 'Sertai pelan ini dalam Plan Together'
    },
    id: {
      daily: { left: 'Hal penting', right: 'Pengingat bersama', btn: 'Gabung agenda' },
      habit: { left: 'Temui yang lebih baik', right: 'Yuk bareng', btn: 'Gabung kebiasaan' },
      memorial: { center: 'Gabung keindahan kita', btn: 'Gabung stasiun kenangan' },
      hint: 'Membuka aplikasi… Jika tidak ada respons, instal dari toko.',
      ogDesc: 'Gabung rencana ini di Plan Together'
    },
    vi: {
      daily: { left: 'Việc quan trọng', right: 'Nhắc nhở chung', btn: 'Tham gia việc' },
      habit: { left: 'Gặp điều tốt hơn', right: 'Cùng nhau nhé', btn: 'Tham gia thói quen' },
      memorial: { center: 'Tham gia vẻ đẹp của chúng ta', btn: 'Tham gia trạm kỷ niệm' },
      hint: 'Đang mở ứng dụng… Nếu không phản hồi, hãy cài từ cửa hàng.',
      ogDesc: 'Tham gia kế hoạch này trên Plan Together'
    },
    sv: {
      daily: { left: 'Viktiga saker', right: 'Delade påminnelser', btn: 'Gå med i ärendet' },
      habit: { left: 'Möt det bättre', right: 'Tillsammans', btn: 'Gå med i vanan' },
      memorial: { center: 'Gå med i våra vackra stunder', btn: 'Gå med i minnesstationen' },
      hint: 'Öppnar appen… Om inget händer, installera från butiken.',
      ogDesc: 'Gå med i denna plan i Plan Together'
    },
    nb: {
      daily: { left: 'Viktige ting', right: 'Delte påminnelser', btn: 'Bli med i saken' },
      habit: { left: 'Møt det bedre', right: 'Sammen', btn: 'Bli med i vanen' },
      memorial: { center: 'Bli med i våre vakre øyeblikk', btn: 'Bli med i minnestasjonen' },
      hint: 'Åpner appen… Hvis ingenting skjer, installer fra butikken.',
      ogDesc: 'Bli med i denne planen i Plan Together'
    },
    da: {
      daily: { left: 'Vigtige ting', right: 'Delte påmindelser', btn: 'Deltag i sagen' },
      habit: { left: 'Mød det bedre', right: 'Sammen', btn: 'Deltag i vanen' },
      memorial: { center: 'Deltag i vores smukke øjeblikke', btn: 'Deltag i mindestationen' },
      hint: 'Åbner appen… Hvis intet sker, installer fra butikken.',
      ogDesc: 'Deltag i denne plan i Plan Together'
    },
    pl: {
      daily: { left: 'Ważne sprawy', right: 'Wspólne przypomnienia', btn: 'Dołącz do sprawy' },
      habit: { left: 'Spotkaj to, co lepsze', right: 'Razem', btn: 'Dołącz do nawyku' },
      memorial: { center: 'Dołącz do naszej piękności', btn: 'Dołącz do stacji wspomnień' },
      hint: 'Otwieranie aplikacji… Jeśli nic się nie dzieje, zainstaluj ze sklepu.',
      ogDesc: 'Dołącz do tego planu w Plan Together'
    },
    tr: {
      daily: { left: 'Önemli işler', right: 'Paylaşılan hatırlatıcılar', btn: 'İşe katıl' },
      habit: { left: 'Daha iyisiyle tanış', right: 'Hadi birlikte', btn: 'Alışkanlığa katıl' },
      memorial: { center: 'Güzelliğimize katıl', btn: 'Anı istasyonuna katıl' },
      hint: 'Uygulama açılıyor… Olmazsa mağazadan yükleyin.',
      ogDesc: 'Plan Together\'da bu plana katıl'
    },
    uk: {
      daily: { left: 'Важливі справи', right: 'Спільні нагадування', btn: 'Приєднатися до справи' },
      habit: { left: 'До кращого', right: 'Разом', btn: 'Приєднатися до звички' },
      memorial: { center: 'Приєднуйся до нашої краси', btn: 'Приєднатися до станції пам\'яті' },
      hint: 'Відкриваємо застосунок… Якщо нічого — встановіть з магазину.',
      ogDesc: 'Приєднайтеся до плану в Plan Together'
    },
    pt: {
      daily: { left: 'Assuntos importantes', right: 'Lembretes compartilhados', btn: 'Entrar no assunto' },
      habit: { left: 'Encontre o melhor', right: 'Vamos juntos', btn: 'Entrar no hábito' },
      memorial: { center: 'Junte-se à nossa beleza', btn: 'Entrar na estação de memórias' },
      hint: 'Abrindo o app… Se nada acontecer, instale pela loja.',
      ogDesc: 'Entre neste plano no Plan Together'
    },
    nl: {
      daily: { left: 'Belangrijke zaken', right: 'Gedeelde herinneringen', btn: 'Deelnemen aan item' },
      habit: { left: 'Ontmoet het betere', right: 'Samen', btn: 'Deelnemen aan gewoonte' },
      memorial: { center: 'Deel onze mooie momenten', btn: 'Deelnemen aan herinneringsstation' },
      hint: 'App openen… Gebeurt er niets, installeer via de store.',
      ogDesc: 'Neem deel aan dit plan in Plan Together'
    },
    fi: {
      daily: { left: 'Tärkeät asiat', right: 'Jaetut muistutukset', btn: 'Liity asiaan' },
      habit: { left: 'Kohtaa parempi', right: 'Yhdessä', btn: 'Liity tottumukseen' },
      memorial: { center: 'Liity kauneuteemme', btn: 'Liity muistiasemaan' },
      hint: 'Avataan sovellusta… Jos mitään ei tapahdu, asenna kaupasta.',
      ogDesc: 'Liity tähän suunnitelmaan Plan Togetherissa'
    },
    el: {
      daily: { left: 'Σημαντικά θέματα', right: 'Κοινές υπενθυμίσεις', btn: 'Συμμετοχή στο θέμα' },
      habit: { left: 'Συνάντησε το καλύτερο', right: 'Μαζί', btn: 'Συμμετοχή στη συνήθεια' },
      memorial: { center: 'Γίνε μέρος της ομορφιάς μας', btn: 'Συμμετοχή στον σταθμό μνήμης' },
      hint: 'Άνοιγμα εφαρμογής… Αν δεν γίνει τίποτα, εγκατάστησε από το store.',
      ogDesc: 'Συμμετοχή σε αυτό το πλάνο στο Plan Together'
    },
    fil: {
      daily: { left: 'Mahalagang bagay', right: 'Mga ibinahaging paalala', btn: 'Sumali sa bagay' },
      habit: { left: 'Makipagkita sa mas maganda', right: 'Sabay na tayo', btn: 'Sumali sa kaugalian' },
      memorial: { center: 'Sumali sa ating kagandahan', btn: 'Sumali sa istasyon ng alaala' },
      hint: 'Binubuksan ang app… Kung walang nangyari, i-install mula sa store.',
      ogDesc: 'Sumali sa planong ito sa Plan Together'
    }
  };

  var RTL_LANGS = { ar: true, ur: true };

  function normalizeCountry(code) {
    return (code || '').trim().toUpperCase();
  }

  function normalizeLang(code) {
    return (code || '').trim().toLowerCase().split(/[-_]/)[0];
  }

  /** 优先按国家码映射语言（产品需求），其次 lang 参数，再浏览器语言。 */
  function resolveLang(countryCode, langOverride) {
    var country = normalizeCountry(countryCode);
    if (country && COUNTRY_TO_LANG[country]) {
      return COUNTRY_TO_LANG[country];
    }
    var lang = normalizeLang(langOverride);
    if (lang && TEXT[lang]) return lang;
    var nav = (typeof navigator !== 'undefined' && navigator.language) || 'en';
    var navLang = normalizeLang(nav);
    if (TEXT[navLang]) return navLang;
    return 'en';
  }

  function stringsFor(lang, taskType) {
    var pack = TEXT[lang] || TEXT.en;
    var type = (taskType || 'daily').toLowerCase();
    if (type !== 'habit' && type !== 'memorial') type = 'daily';
    var scene = pack[type] || pack.daily;
    return {
      lang: lang,
      taskType: type,
      isRtl: !!RTL_LANGS[lang],
      headerLeft: scene.left || '',
      headerRight: scene.right || '',
      headerCenter: scene.center || '',
      button: scene.btn || TEXT.en.daily.btn,
      hint: pack.hint || TEXT.en.hint,
      ogDesc: pack.ogDesc || TEXT.en.ogDesc
    };
  }

  global.GlobalShareI18n = {
    COUNTRY_TO_LANG: COUNTRY_TO_LANG,
    TEXT: TEXT,
    resolveLang: resolveLang,
    stringsFor: stringsFor
  };
})(typeof window !== 'undefined' ? window : this);
