/* ============ Helpers ============ */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const h = (tag, attrs = {}, ...children) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') el.innerHTML = v;
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
};
const ic = (name, size = 18, color = '#9A9A9A') => {
  const img = document.createElement('img');
  img.src = `https://api.iconify.design/${name}.svg?color=${encodeURIComponent(color)}`;
  img.width = size; img.height = size; img.alt = '';
  img.style.display = 'inline-block'; img.style.flexShrink = '0';
  return img;
};

/* ============ Theme ============ */
function initTheme() {
  const stored = localStorage.getItem('theme');
  const dark = stored ? stored === 'dark'
    : window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', dark);
}
initTheme();
function toggleTheme(btn) {
  const dark = !document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark', dark);
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  renderThemeIcon(btn);
}
function renderThemeIcon(btn) {
  const dark = document.documentElement.classList.contains('dark');
  btn.innerHTML = '';
  const span = h('span', { style: {
    position: 'absolute', inset: '0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'themeSpin .22s cubic-bezier(.2,.7,.2,1) both',
  }});
  span.append(ic(dark ? 'solar:sun-bold-duotone' : 'solar:moon-bold-duotone', 17, dark ? '#FFD66E' : '#2079FF'));
  btn.append(span);
  btn.title = dark ? 'Светлая тема' : 'Тёмная тема';
}

/* ============ State ============ */
const USER = { nick: 'PlayerOne', steamId: '76561199634589620', balance: 4.95 };
const LANGS = [
  { code: 'RU', label: 'Русский', cc: 'ru' },
  { code: 'EN', label: 'English', cc: 'gb' },
  { code: 'UA', label: 'Українська', cc: 'ua' },
  { code: 'KZ', label: 'Қазақша', cc: 'kz' },
];
const SERVERS = ['Любой', 'PUBLIC RUST #1 X2', 'PUBLIC RUST #2 X5', 'PUBLIC RUST #3 Vanilla'];

function loadHistory() {
  const raw = localStorage.getItem('history');
  if (raw) try { return JSON.parse(raw); } catch {}
  return [
    { id: 'A-2451', name: 'HV 5.56 Rifle Ammo', img: 'https://cdn.gamestores.app/img/games/rust/1712070256.webp',
      qty: 12, price: 12.5, server: 'PUBLIC RUST #1 X2', date: '12.05.2026', time: '18:42', status: 'Выдано' },
    { id: 'A-2398', name: 'Burlap Trousers', img: 'https://cdn.gamestores.app/img/games/rust/blueprintbase.png',
      qty: 1, price: 49.9, server: 'PUBLIC RUST #2 X5', date: '08.05.2026', time: '21:15', status: 'Выдано' },
    { id: 'A-2301', name: 'Wood', img: 'https://cdn.gamestores.app/img/games/rust/wood.png',
      qty: 1000, price: 1, server: 'PUBLIC RUST #3 Vanilla', date: '01.05.2026', time: '13:08', status: 'Выдано' },
  ];
}
function saveHistory(arr) { localStorage.setItem('history', JSON.stringify(arr)); }
let orderCounter = 2452;
function addOrder(item) {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  const order = {
    id: `A-${orderCounter++}`,
    name: item.name, img: item.img, qty: item.qty ?? 1, price: item.price,
    server: item.server ?? 'Любой',
    date: `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    status: 'Выдано',
  };
  const arr = [order, ...loadHistory()];
  saveHistory(arr);
}

/* ============ Toasts ============ */
let toastContainer;
function ensureToasts() {
  if (toastContainer) return toastContainer;
  toastContainer = h('div', { class: 'toasts' });
  document.body.append(toastContainer);
  return toastContainer;
}
const recent = new Map();
function notify({ type = 'info', title, text = '' }) {
  const key = `${type}|${title}|${text}`;
  const now = Date.now();
  if (now - (recent.get(key) || 0) < 1500) return;
  recent.set(key, now);
  const root = ensureToasts();
  if (root.children.length >= 3) root.firstChild.remove();
  const meta = type === 'success' ? { i: 'solar:check-circle-bold-duotone', c: '#5D9EFF' }
            : type === 'error'   ? { i: 'solar:close-circle-bold-duotone', c: '#ff4d61' }
            :                       { i: 'solar:info-circle-bold-duotone',  c: '#2079FF' };
  const t = h('div', { class: 'toast' },
    h('div', { style: { paddingTop: '2px' } }, ic(meta.i, 20, meta.c)),
    h('div', { style: { flex: '1', minWidth: '0' } },
      h('div', { class: 'toast-title' }, title),
      text ? h('div', { class: 'toast-text' }, text) : null,
    ),
    h('button', { class: 'toast-close', 'aria-label': 'Закрыть',
      onClick: () => dismiss(t) }, ic('solar:close-circle-bold-duotone', 14, '#9A9A9A')),
  );
  function dismiss(el) {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 350);
  }
  root.append(t);
  setTimeout(() => dismiss(t), 4000);
}

/* ============ Header / shell ============ */
function buildHeader(activePage) {
  const flag = (cc, sz = 22) => h('img', {
    src: `https://hatscripts.github.io/circle-flags/flags/${cc}.svg`,
    width: sz, height: sz, alt: '', class: sz === 22 ? 'flag-sm' : 'flag',
    style: { width: sz + 'px', height: sz + 'px' },
  });

  let lang = LANGS[0];
  // Language dropdown
  const langPill = h('button', { class: 'pill', 'aria-label': 'Язык' });
  const langArrow = ic('solar:alt-arrow-down-bold-duotone', 12, '#9A9A9A');
  const langDD = h('div', { class: 'dropdown' });
  function renderLangPill() {
    langPill.innerHTML = '';
    langPill.append(flag(lang.cc, 26), document.createTextNode(' ' + lang.code), langArrow);
  }
  function renderLangDD() {
    langDD.innerHTML = '';
    LANGS.forEach(l => {
      const active = l.code === lang.code;
      const item = h('button', {
        class: 'menu-item' + (active ? ' active' : ''),
        onClick: () => { lang = l; renderLangPill(); renderLangDD(); langWrap.classList.remove('open-parent'); langDD.classList.remove('open'); },
      }, flag(l.cc, 22), h('span', { class: 'menu-label' }, l.label),
         h('span', { class: 'menu-sub' }, l.code),
         active ? ic('solar:check-circle-bold-duotone', 14, '#2079FF') : null);
      langDD.append(item);
    });
  }
  renderLangPill(); renderLangDD();
  langPill.addEventListener('click', e => { e.stopPropagation(); langDD.classList.toggle('open'); userDD.classList.remove('open'); });
  const langWrap = h('div', { class: 'dropdown-wrap', 'data-stop': '1' }, langPill, langDD);

  // Wallet button
  const wallet = h('button', { class: 'pill', style: { display: window.innerWidth >= 640 ? 'inline-flex' : 'none' },
    onClick: () => notify({ type: 'info', title: 'Пополнение', text: 'Открываем форму пополнения' }) },
    ic('solar:wallet-bold-duotone', 16, '#2079FF'),
    h('span', { class: 'tabular' }, USER.balance.toFixed(2)),
    h('span', { class: 'muted-xs' }, 'RUB'));

  // User dropdown
  const userTrigger = h('button', { class: 'pill', style: { paddingLeft: '4px' } },
    h('span', { class: 'avatar' }, USER.nick[0].toUpperCase()),
    h('span', { class: 'user-name' }, USER.nick),
    ic('solar:alt-arrow-down-bold-duotone', 14, '#9A9A9A'));
  const userDD = h('div', { class: 'dropdown' },
    h('a', { href: 'profile.html', class: 'menu-item' },
      ic('solar:user-circle-bold-duotone', 18), h('span', { class: 'menu-label' }, 'Профиль')),
    h('a', { href: 'history.html', class: 'menu-item' },
      ic('solar:history-bold-duotone', 18), h('span', { class: 'menu-label' }, 'История')),
    h('div', { class: 'menu-divider' }),
    h('button', { class: 'menu-item danger',
      onClick: () => { userDD.classList.remove('open'); notify({ type: 'success', title: 'Вы вышли из аккаунта' }); } },
      ic('solar:logout-3-bold-duotone', 18, '#e5484d'), h('span', { class: 'menu-label' }, 'Выход')),
  );
  userTrigger.addEventListener('click', e => { e.stopPropagation(); userDD.classList.toggle('open'); langDD.classList.remove('open'); });
  const userWrap = h('div', { class: 'dropdown-wrap', 'data-stop': '1' }, userTrigger, userDD);

  // Theme toggle
  const themeBtn = h('button', { class: 'icon-btn', 'aria-label': 'Сменить тему',
    onClick: () => toggleTheme(themeBtn) });
  renderThemeIcon(themeBtn);

  document.addEventListener('click', () => {
    langDD.classList.remove('open');
    userDD.classList.remove('open');
  });

  return h('header', { class: 'header' },
    h('div', { class: 'container header-inner' },
      h('a', { href: 'index.html', class: 'logo' },
        h('span', { class: 'logo-dot' }), h('span', { class: 'logo-text' }, 'PUBLIC RUST')),
      h('nav', { class: 'nav' },
        h('a', { href: 'index.html', class: activePage === 'shop' ? 'active' : '' }, 'Магазин'),
        h('a', { style: { cursor: 'pointer' } }, 'Поддержка'),
      ),
      h('div', { class: 'spacer' }),
      h('div', { class: 'toolbar' }, langWrap, wallet, userWrap, themeBtn),
    ),
  );
}

function buildFooter() {
  return h('footer', { class: 'footer' },
    h('div', { class: 'container footer-inner' },
      h('p', { style: { marginBottom: '12px' } },
        'Размещенная на настоящем сайте информация носит исключительно информационный характер и ни при каких условиях не является публичной офертой.'),
      h('div', { class: 'footer-links' },
        h('a', {}, 'Пользовательское соглашение'),
        h('a', {}, 'Политика конфиденциальности'),
        h('a', {}, 'help@gamestores.ru'),
      ),
      h('p', { style: { marginTop: '16px', fontSize: '11px' } },
        'Сайт создан в системе ', h('span', { class: 'accent-text', style: { fontWeight: '600' } }, 'GameStores')),
    ));
}

function mountPage(activePage, content) {
  document.body.innerHTML = '';
  const page = h('div', { class: 'page' },
    buildHeader(activePage),
    h('main', { class: 'container' }, content),
    buildFooter(),
  );
  document.body.append(page);
  ensureToasts();
}

/* ============ Data ============ */
const CATEGORIES = [
  { name: 'Все', icon: 'solar:widget-5-bold-duotone' },
  { name: 'Ресурсы', img: 'assets/cat-resources.png' },
  { name: 'Боеприпасы', img: 'assets/cat-ammo.png' },
  { name: 'Одежда', img: 'assets/cat-clothes.png' },
  { name: 'Инструменты', img: 'assets/cat-tools.png' },
  { name: 'Медикаменты', img: 'assets/cat-meds.png' },
];
const IMG_POOL = [
  'https://cdn.gamestores.app/img/games/gamestores.png',
  'https://cdn.gamestores.app/img/games/rust/1712070256.webp',
  'https://cdn.gamestores.app/img/games/rust/1992974553.webp',
  'https://cdn.gamestores.app/img/games/rust/blueprintbase.png',
  'https://cdn.gamestores.app/img/noimage.png',
];
const pick = i => IMG_POOL[i % IMG_POOL.length];
const KIT_ITEM_NAMES = [
  'Wood','Stone','Metal Frag','Sulfur','HQM','Cloth',
  'Gear','Spring','Tech Trash','Rope','Sewing Kit','Rifle Body',
  'AK-47','M249','L96','Bolt Rifle','MP5','Thompson',
  'Hazmat Suit','Metal Armor','Road Sign','Coffee Can',
  '5.56 Ammo','HV 5.56','Pistol Ammo','Shotgun Shell',
  'Jackhammer','Chainsaw','Salvaged Axe','Salvaged Pickaxe',
  'Medical Syringe','Bandage','Large Med Kit',
];
const sectionItems = (start, n, qmin, qmax) => Array.from({ length: n }, (_, i) => ({
  name: KIT_ITEM_NAMES[(start + i) % KIT_ITEM_NAMES.length],
  img: pick(start + i),
  qty: Math.round(qmin + ((i * 97) % 100) / 99 * (qmax - qmin)),
}));
function makeKit(id, name, price, oldPrice, accent, tag) {
  return {
    id, name, price, oldPrice,
    discount: Math.round((1 - price / oldPrice) * 100),
    category: 'Ресурсы', img: pick(id), tag,
    kind: 'kit', accent,
    sections: [
      { id: 'res', name: 'Ресурсы', icon: 'solar:box-minimalistic-linear', items: sectionItems(0, 18, 500, 12000) },
      { id: 'comp', name: 'Компоненты', icon: 'solar:cpu-bolt-linear', items: sectionItems(6, 14, 5, 80) },
      { id: 'eq1', name: 'Снаряжение #1', icon: 'solar:shield-keyhole-linear', items: sectionItems(12, 22, 1, 400) },
      { id: 'eq2', name: 'Снаряжение #2', icon: 'solar:shield-star-linear', items: sectionItems(15, 26, 1, 600) },
      { id: 'tools', name: 'Инструменты', icon: 'solar:tuning-2-linear', items: sectionItems(26, 12, 1, 5) },
    ],
  };
}
const PRODUCTS = [
  makeKit(999, 'VIP Набор «Старт»', 499, 690, '#2079FF', 'new'),
  makeKit(998, 'PRO Набор «Лес»', 1299, 1990, '#85FF62', 'hot'),
  makeKit(997, 'ELITE Набор «Океан»', 2499, 3490, '#42FFD2'),
  makeKit(996, 'GOLD Набор «Король»', 3990, 5990, '#FFE86E', 'hot'),
  { id: 1, name: 'Wood', price: 1, count: 12, category: 'Ресурсы', img: pick(0) },
  { id: 2, name: '5.56 Rifle Ammo', price: 160.05, oldPrice: 165, discount: 3, count: 11, category: 'Боеприпасы', img: pick(1), tag: 'hot' },
  { id: 3, name: 'Hammer', price: 25, count: 5, category: 'Инструменты', img: pick(2) },
  { id: 4, name: 'Burlap Trousers', price: 49.9, oldPrice: 60, discount: 17, count: 3, category: 'Одежда', img: pick(3), tag: 'new' },
  { id: 5, name: 'Medical Syringe', price: 8, count: 20, category: 'Медикаменты', img: pick(4) },
  { id: 6, name: 'Large Wood Box', price: 199, count: 1, category: 'Инструменты', img: pick(5) },
  { id: 7, name: 'Metal Fragments', price: 12.5, count: 50, category: 'Ресурсы', img: pick(6), tag: 'hot' },
  { id: 8, name: 'Pistol Ammo', price: 320, oldPrice: 400, discount: 20, count: 2, category: 'Боеприпасы', img: pick(7) },
];

/* ============ Color helpers ============ */
function fgFor(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  return (r*299+g*587+b*114)/1000 >= 165 ? '#111111' : '#ffffff';
}
function withAlpha(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ============ Hero ============ */
function buildHero() {
  const items = Array.from({ length: 32 }, (_, i) => i);
  const cols = [items.slice(0,8), items.slice(8,16), items.slice(16,24), items.slice(24,32)];
  const durs = [28, 34, 30, 36];
  const dirs = ['up','down','up','down'];
  const rotor = h('div', { class: 'marquee-rotor' });
  cols.forEach((col, idx) => {
    const loop = [...col, ...col];
    const track = h('div', { class: `marquee-track ${dirs[idx]}`,
      style: { animationDuration: durs[idx] + 's' } });
    loop.forEach((_, i) => {
      const img = h('img', { src: pick(i + idx) });
      img.onerror = () => img.style.visibility = 'hidden';
      track.append(h('div', { class: 'frame' }, img));
    });
    rotor.append(h('div', { class: 'marquee-col' + (idx === 3 ? ' hide-sm' : '') }, track));
  });

  return h('div', { class: 'hero' },
    h('div', { class: 'hero-inner' },
      h('div', { class: 'hero-text' },
        h('h1', {}, 'Магазин предметов ', h('span', { class: 'accent-text' }, 'и услуг')),
        h('p', {}, 'Здесь можно приобрести внутриигровые предметы и услуги. При пополнении счёта от определённой суммы начисляется бонус до 45% от депозита.'),
        h('div', { class: 'hero-actions' },
          h('button', { class: 'btn btn-primary',
            onClick: () => notify({ type: 'success', title: 'Пополнение', text: 'Открываем форму пополнения баланса' }) },
            ic('solar:wallet-bold-duotone', 14, '#ffffff'), 'Пополнить'),
          h('button', { class: 'btn btn-ghost' },
            ic('solar:gift-bold-duotone', 14, '#9A9A9A'), 'Подробнее о бонусах'),
        )),
      h('div', { class: 'hero-marquee' },
        rotor,
        h('div', { class: 'hero-fade-l' }),
        h('div', { class: 'hero-fade-t' }),
        h('div', { class: 'hero-fade-b' }),
      ),
    ));
}

/* ============ Shop ============ */
let activeCat = 'Все';
let query = '';
let gridEl, gridContainer;

function renderCategories() {
  const wrap = h('div', { class: 'cats' });
  CATEGORIES.forEach(c => {
    const isActive = c.name === activeCat;
    const btn = h('button', {
      class: 'cat' + (isActive ? ' active' : ''),
      onClick: () => { activeCat = c.name; refresh(); },
    },
      h('span', { class: 'cat-icon' },
        c.img ? h('img', { src: c.img, alt: c.name, draggable: 'false' })
              : ic(c.icon, 26, isActive ? '#2079FF' : '#9A9A9A')),
      h('span', {}, c.name),
    );
    wrap.append(btn);
  });
  return wrap;
}

function tagEl(kind) {
  if (kind === 'hot') return h('div', { class: 'tag tag-hot' }, ic('solar:fire-bold', 11, '#ffffff'), 'Hot');
  if (kind === 'new') return h('div', { class: 'tag tag-new' }, ic('solar:stars-bold', 11, '#ffffff'), 'New');
  return null;
}

function productCard(p, index) {
  const isKit = p.kind === 'kit';
  const accent = p.accent || '#2079FF';
  const accentFg = isKit ? fgFor(accent) : '#ffffff';
  const card = h('button', {
    class: 'card' + (isKit ? ' kit' : ''),
    onClick: () => isKit ? openKitModal(p) : openProductModal(p),
    style: {
      animationDelay: Math.min(index * 40, 320) + 'ms',
      ...(isKit ? {
        borderColor: withAlpha(accent, 0.4),
        background: `linear-gradient(135deg, ${withAlpha(accent, 0.10)} 0%, ${withAlpha(accent, 0.02)} 60%, transparent 100%)`,
      } : {}),
    },
  },
    h('div', { class: 'card-img' },
      (() => {
        const im = h('img', { src: p.img, alt: p.name });
        im.onerror = () => im.style.visibility = 'hidden';
        return im;
      })(),
      h('div', { class: 'price-pill' },
        h('div', { class: 'price-bubble', style: { color: isKit ? accent : 'var(--accent-from)' } },
          h('span', {}, (Number.isInteger(p.price) ? p.price : p.price.toFixed(2)) + ' ₽'),
          p.oldPrice ? h('span', { class: 'price-old' }, p.oldPrice) : null,
        ),
        p.tag ? tagEl(p.tag) : null,
      ),
      isKit ? h('div', { class: 'corner kit-badge',
        style: { background: accent, color: accentFg, boxShadow: `0 8px 20px -8px ${withAlpha(accent, 0.55)}` } },
        ic('solar:bag-4-bold-duotone', 12, accentFg), 'Набор')
       : p.discount ? h('div', { class: 'corner discount' }, '−' + p.discount + '%')
       : p.count ? h('div', { class: 'corner count' }, '×' + p.count) : null,
    ),
    h('div', { class: 'card-body' },
      h('div', { class: 'card-name' }, p.name),
      isKit ? h('div', { class: 'card-sub' },
        p.sections.reduce((s, x) => s + x.items.length, 0) + ' предметов · ' + p.sections.length + ' разделов') : null,
    ),
  );
  return card;
}

function ghostCard() {
  return h('div', { class: 'ghost', 'aria-hidden': 'true' },
    ic('solar:gallery-add-linear', 22, '#9A9A9A'));
}

function refresh() {
  const items = PRODUCTS.filter(p =>
    (activeCat === 'Все' || p.category === activeCat) &&
    p.name.toLowerCase().includes(query.toLowerCase()));
  gridContainer.innerHTML = '';
  if (items.length === 0) {
    gridContainer.append(h('div', { class: 'empty-text' }, 'Товары не найдены'));
    return;
  }
  const grid = h('div', { class: 'grid' });
  items.forEach((p, i) => grid.append(productCard(p, i)));
  gridContainer.append(grid);
  gridEl = grid;
  // ghost fill
  const updateGhosts = () => {
    grid.querySelectorAll('.ghost').forEach(g => g.remove());
    const cs = getComputedStyle(grid).gridTemplateColumns;
    const cols = cs.split(' ').filter(Boolean).length;
    if (!cols) return;
    const ghosts = (cols - (items.length % cols)) % cols;
    for (let i = 0; i < ghosts; i++) grid.append(ghostCard());
  };
  updateGhosts();
  const ro = new ResizeObserver(updateGhosts);
  ro.observe(grid);
  // re-render category bar (active state)
  catsContainer.innerHTML = '';
  catsContainer.append(renderCategories());
  // update cat-icon color of "Все"
}

// Re-init categories container reference for refresh
let catsContainer;

function shopContent() {
  catsContainer = h('div', {}, renderCategories());
  gridContainer = h('div', {});
  const searchInput = h('input', { placeholder: 'Поиск товара...', value: query });
  searchInput.addEventListener('input', e => { query = e.target.value; refresh(); });
  return h('div', {},
    buildHero(),
    h('section', { class: 'section-stack' },
      h('div', { class: 'search' },
        h('span', { class: 'ic' }, ic('solar:magnifer-linear', 18, '#9A9A9A')),
        searchInput),
      catsContainer,
      gridContainer,
    ));
}

/* ============ Product modal ============ */
let modalEl;
function ensureModal() {
  if (modalEl) return modalEl;
  modalEl = h('div', { class: 'modal-backdrop', onClick: closeModal });
  document.body.append(modalEl);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  return modalEl;
}
function closeModal() {
  if (!modalEl) return;
  modalEl.classList.remove('open');
  setTimeout(() => modalEl.innerHTML = '', 200);
}
function openProductModal(p) {
  const root = ensureModal();
  let count = 1;
  const update = () => {
    qtyVal.textContent = count;
    totalEl.firstChild.textContent = (p.price * count).toFixed(2);
  };
  const qtyVal = h('span', { class: 'qty-val tabular' }, '1');
  const totalEl = h('span', { class: 'pay-amount tabular' }, p.price.toFixed(2), h('span', {}, ' ₽'));
  const inner = h('div', { class: 'modal modal-sm', onClick: e => e.stopPropagation() },
    h('button', { class: 'modal-close', onClick: closeModal, 'aria-label': 'Закрыть' },
      ic('solar:close-circle-linear', 18, '#9A9A9A')),
    h('div', { class: 'm-img' },
      (() => { const im = h('img', { src: p.img, alt: p.name });
        im.onerror = () => im.style.visibility = 'hidden'; return im; })()),
    h('div', { style: { textAlign: 'center', marginBottom: '24px' } },
      h('div', { class: 'modal-cat' }, p.category),
      h('h2', {}, p.name)),
    h('div', { class: 'row-line' },
      h('span', { style: { fontSize: '13px', color: 'var(--muted)' } }, 'Количество'),
      h('div', { class: 'qty' },
        h('button', { 'aria-label': '-', onClick: () => { count = Math.max(1, count - 1); update(); } },
          ic('solar:minus-circle-linear', 20, '#9A9A9A')),
        qtyVal,
        h('button', { 'aria-label': '+', onClick: () => { count++; update(); } },
          ic('solar:add-circle-linear', 20, '#9A9A9A')),
      )),
    h('div', { class: 'row-line', style: { marginBottom: '20px' } },
      h('span', { style: { fontSize: '13px', color: 'var(--muted)' } }, 'К оплате'),
      totalEl),
    h('button', { class: 'btn-buy',
      onClick: () => {
        addOrder({ name: p.name, img: p.img, price: p.price, qty: count, server: 'Любой' });
        notify({ type: 'success', title: 'Покупка совершена',
          text: `${p.name} ×${count} · введите /store в чате` });
        closeModal();
      } },
      'Купить', ic('solar:bag-check-bold-duotone', 18, '#ffffff')),
    h('p', { class: 'modal-hint' }, 'Чтобы забрать товар, введите ',
      h('b', {}, '/store'), ' в чат'),
  );
  root.innerHTML = '';
  root.append(h('div', { class: 'modal-wrap' }, inner));
  root.classList.add('open');
}

/* ============ Kit modal ============ */
function openKitModal(p) {
  const root = ensureModal();
  let tab = 0, count = 1, server = 'Любой';
  const accent = p.accent || '#2079FF';
  const accentFg = fgFor(accent);
  const accentBgStyle = { background: accent, color: accentFg };
  const accentShadow = { boxShadow: `0 10px 26px -10px ${withAlpha(accent, 0.55)}` };

  const tabsRow = h('div', { class: 'kit-tabs' });
  const itemsWrap = h('div', { class: 'kit-items' });
  const totalEl = h('div', { class: 'kit-total', style: { color: accent } },
    h('span', { class: 'tabular' }, (p.price * count).toFixed(2)),
    h('span', {}, '₽'));

  function renderTabs() {
    tabsRow.innerHTML = '';
    p.sections.forEach((s, i) => {
      const isActive = i === tab;
      const b = h('button', {
        class: 'kit-tab' + (isActive ? ' active' : ''),
        style: isActive ? { ...accentBgStyle, ...accentShadow } : {},
        onClick: () => { tab = i; renderTabs(); renderItems(); },
      }, ic(s.icon, 13, isActive ? accentFg : '#9A9A9A'), s.name);
      tabsRow.append(b);
    });
  }
  function renderItems() {
    itemsWrap.innerHTML = '';
    const scroll = h('div', { class: 'kit-items-scroll scroll-thin' });
    const grid = h('div', { class: 'kit-grid', style: { ['--kit-accent']: accent } });
    const items = p.sections[tab].items;
    items.forEach(it => {
      grid.append(h('div', { class: 'kit-cell' },
        h('img', { src: it.img, alt: '' }),
        h('div', { class: 'kit-qty' }, '×' + it.qty)));
    });
    scroll.append(grid);
    itemsWrap.append(scroll);
    requestAnimationFrame(() => {
      const cs = getComputedStyle(grid).gridTemplateColumns;
      const cols = cs.split(' ').filter(Boolean).length;
      if (!cols) return;
      const ghosts = (cols - (items.length % cols)) % cols;
      for (let i = 0; i < ghosts; i++)
        grid.append(h('div', { class: 'kit-ghost-cell', 'aria-hidden': 'true' }));
    });
  }
  function updateTotal() {
    totalEl.firstChild.textContent = (p.price * count).toFixed(2);
  }

  // Server dropdown
  const serverDD = h('div', { class: 'server-dd' });
  const serverName = h('span', { class: 'name' }, server);
  const arr = ic('solar:alt-arrow-down-bold-duotone', 12, '#9A9A9A');
  arr.classList.add('arr');
  const trigger = h('button', { class: 'server-trigger', type: 'button' },
    h('span', { class: 'dot' }), ic('solar:server-square-linear', 14, '#9A9A9A'), serverName, arr);
  const menu = h('div', { class: 'server-menu' });
  function renderMenu() {
    menu.innerHTML = '';
    menu.append(h('div', { class: 'label' }, 'Сервер выдачи'));
    SERVERS.forEach(s => {
      const active = s === server;
      menu.append(h('button', {
        class: 'server-opt' + (active ? ' active' : ''),
        onClick: () => { server = s; serverName.textContent = s; menu.classList.remove('open'); trigger.classList.remove('open'); renderMenu(); },
      }, h('span', { class: 'dot' }),
         ic('solar:server-square-linear', 14, active ? '#2079FF' : '#9A9A9A'),
         h('span', { class: 'name' }, s),
         active ? ic('solar:check-circle-bold-duotone', 14, '#2079FF') : null));
    });
  }
  renderMenu();
  trigger.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.toggle('open'); trigger.classList.toggle('open');
  });
  serverDD.addEventListener('click', e => e.stopPropagation());
  serverDD.append(trigger, menu);

  const qtyVal = h('span', { class: 'tabular', style: { minWidth: '18px', textAlign: 'center', fontSize: '13px', fontWeight: '600' } }, '1');
  const qtyBox = h('div', { style: { display: 'inline-flex', alignItems: 'center', gap: '4px',
    height: '36px', padding: '0 4px', borderRadius: '999px', background: 'var(--bg)',
    border: '1px solid var(--border)' } },
    h('button', { 'aria-label': '-', style: { width: '28px', height: '28px', borderRadius: '999px' },
      onClick: () => { count = Math.max(1, count - 1); qtyVal.textContent = count; updateTotal(); } },
      ic('solar:minus-circle-linear', 16, '#9A9A9A')),
    qtyVal,
    h('button', { 'aria-label': '+', style: { width: '28px', height: '28px', borderRadius: '999px' },
      onClick: () => { count++; qtyVal.textContent = count; updateTotal(); } },
      ic('solar:add-circle-linear', 16, '#9A9A9A')),
  );

  const inner = h('div', { class: 'modal modal-lg', onClick: e => e.stopPropagation(),
    style: { borderColor: withAlpha(accent, 0.25) } },
    h('button', { class: 'modal-close', onClick: closeModal, 'aria-label': 'Закрыть' },
      ic('solar:close-circle-linear', 18, '#9A9A9A')),
    h('div', { class: 'kit-hero',
      style: { background: `linear-gradient(135deg, ${withAlpha(accent, 0.18)} 0%, ${withAlpha(accent, 0.04)} 60%, transparent 100%)` } },
      h('div', { class: 'kit-hero-inner' },
        h('div', { class: 'kit-cover', style: { borderColor: withAlpha(accent, 0.35) } },
          h('img', { src: p.img, alt: p.name }),
          h('div', { style: { position: 'absolute', inset: '0', pointerEvents: 'none',
            background: `linear-gradient(135deg, ${withAlpha(accent, 0.18)}, transparent)` } })),
        h('div', { style: { flex: '1', minWidth: '0' } },
          h('div', { class: 'kit-badge-pill', style: accentBgStyle },
            ic('solar:bag-4-bold-duotone', 11, accentFg), 'Привилегия'),
          h('h2', { class: 'kit-title' }, p.name),
          h('div', { class: 'kit-sub' },
            p.sections.reduce((s, x) => s + x.items.length, 0) + ' предметов в ' + p.sections.length + ' разделах'),
        ))),
    tabsRow,
    itemsWrap,
    h('div', { class: 'kit-footer' },
      serverDD,
      qtyBox,
      totalEl,
      h('button', { class: 'kit-buy', style: { ...accentBgStyle, ...accentShadow },
        onClick: () => {
          addOrder({ name: p.name, img: p.img, price: p.price, qty: count, server });
          notify({ type: 'success', title: 'Покупка совершена',
            text: `${p.name} ×${count} · ${server}` });
          closeModal();
        } },
        ic('solar:bag-check-bold-duotone', 15, accentFg), 'Купить'),
    ),
  );
  renderTabs(); renderItems();
  root.innerHTML = '';
  root.append(h('div', { class: 'modal-wrap' }, inner));
  root.classList.add('open');
  document.addEventListener('click', () => {
    menu.classList.remove('open'); trigger.classList.remove('open');
  }, { once: true });
}

/* ============ Profile content ============ */
function profileContent() {
  let copied = false;
  const copyIcon = ic('solar:copy-bold-duotone', 16, '#9A9A9A');
  const copyBtn = h('button', { class: 'copy-btn', 'aria-label': 'Копировать SteamID',
    onClick: async () => {
      try {
        await navigator.clipboard.writeText(USER.steamId);
        copied = true;
        copyBtn.innerHTML = '';
        copyBtn.append(ic('solar:check-circle-bold-duotone', 16, '#2079FF'));
        notify({ type: 'success', title: 'SteamID скопирован' });
        setTimeout(() => {
          copyBtn.innerHTML = '';
          copyBtn.append(ic('solar:copy-bold-duotone', 16, '#9A9A9A'));
        }, 1500);
      } catch {
        notify({ type: 'error', title: 'Не удалось скопировать' });
      }
    } }, copyIcon);

  const promoInput = h('input', { placeholder: 'Введите промокод' });
  return h('div', { class: 'profile-wrap' },
    h('div', { class: 'page-header' },
      h('div', { class: 'page-header-sub' }, 'Аккаунт'),
      h('h1', {}, 'Профиль')),
    h('div', { class: 'identity' },
      h('div', { class: 'identity-avatar' }, USER.nick[0].toUpperCase()),
      h('div', { class: 'identity-info' },
        h('div', { class: 'identity-name' }, USER.nick),
        h('div', { class: 'identity-role' }, 'Игрок · PUBLIC RUST')),
      h('button', { class: 'btn-pill', style: { display: 'inline-flex' },
        onClick: () => notify({ type: 'info', title: 'Пополнение', text: 'Открываем форму пополнения' }) },
        ic('solar:wallet-bold-duotone', 16, '#ffffff'), 'Пополнить'),
    ),
    h('div', { class: 'section-block' },
      h('div', { class: 'section-title' }, 'Информация'),
      h('div', { class: 'list-card' },
        h('div', { class: 'list-row' },
          h('div', { class: 'list-row-l' },
            ic('solar:gamepad-bold-duotone', 18, '#9A9A9A'),
            h('span', { class: 'label' }, 'SteamID')),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
            h('span', { class: 'steamid' }, USER.steamId), copyBtn)),
        h('div', { class: 'list-row' },
          h('div', { class: 'list-row-l' },
            ic('solar:wallet-bold-duotone', 18, '#9A9A9A'),
            h('span', { class: 'label' }, 'Баланс')),
          h('span', { style: { fontSize: '14px', fontWeight: '600', color: 'var(--accent-from)' } },
            USER.balance.toFixed(2), ' ',
            h('span', { style: { fontSize: '11px', color: 'var(--muted)' } }, 'RUB'))),
      )),
    h('div', { class: 'section-block' },
      h('div', { class: 'section-title' }, 'Использование промокода'),
      h('div', { class: 'promo-card' },
        h('div', { class: 'promo-top' },
          h('div', { class: 'promo-icon' }, ic('solar:ticket-sale-bold-duotone', 20, '#2079FF')),
          h('div', { style: { flex: '1' } },
            h('div', { class: 'promo-title' }, 'Активация промокода'),
            h('div', { class: 'promo-desc' }, 'Введите код, чтобы получить бонус на баланс или скидку на покупку.'))),
        h('div', { class: 'promo-row' },
          promoInput,
          h('button', { class: 'btn-pill',
            onClick: () => {
              const v = promoInput.value.trim();
              if (!v) { notify({ type: 'error', title: 'Промокод', text: 'Введите код' }); return; }
              notify({ type: 'error', title: 'Промокод не найден', text: `Код «${v}» недействителен` });
              promoInput.value = '';
            } }, 'Применить'),
        ))),
  );
}

/* ============ History content ============ */
function historyContent() {
  const orders = loadHistory();
  const total = orders.reduce((s, o) => s + o.price * o.qty, 0).toFixed(2);

  const fieldEl = (icon, label, value, accent) =>
    h('div', { class: 'field' },
      ic(icon, 14, accent ? '#2079FF' : '#9A9A9A'),
      h('div', { style: { minWidth: '0' } },
        h('div', { class: 'field-l' }, label),
        h('div', { class: 'field-v' + (accent ? ' accent' : '') }, value)));

  return h('div', { class: 'history-wrap' },
    h('div', { class: 'history-head' },
      h('div', { class: 'page-header', style: { marginBottom: '0' } },
        h('div', { class: 'page-header-sub' }, 'Аккаунт'),
        h('h1', {}, 'История покупок')),
      h('div', { class: 'history-stats' },
        h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } },
          ic('solar:clipboard-list-bold-duotone', 14, '#9A9A9A'),
          h('span', { class: 'v' }, orders.length)),
        h('span', { class: 'sep' }),
        h('span', { style: { color: 'var(--fg)' } },
          h('span', { class: 'v' }, total),
          h('span', { style: { fontSize: '11px', color: 'var(--muted)', marginLeft: '4px' } }, '₽')))),
    orders.length === 0
      ? h('div', { class: 'history-empty' },
          h('div', { class: 'iconbox' }, ic('solar:bag-cross-bold-duotone', 24, '#9A9A9A')),
          h('div', { class: 'title' }, 'Покупок ещё нет'),
          h('p', {}, 'Загляните в магазин и сделайте первую покупку.'),
          h('a', { href: 'index.html', class: 'btn-pill', style: { textDecoration: 'none' } },
            'Перейти в магазин', ic('solar:arrow-right-linear', 16, '#ffffff')))
      : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
          ...orders.map(o => {
            const im = h('img', { src: o.img, alt: o.name });
            im.onerror = () => im.style.visibility = 'hidden';
            return h('div', { class: 'order' },
              h('div', { class: 'order-inner' },
                h('div', { class: 'order-img' }, im),
                h('div', { class: 'order-body' },
                  h('div', { class: 'order-top' },
                    h('div', { style: { minWidth: '0' } },
                      h('div', { class: 'order-name' }, o.name,
                        h('span', { class: 'qty' }, ' × ' + o.qty)),
                      h('div', { class: 'order-id' }, 'Заказ #' + o.id)),
                    h('span', { class: 'order-price tabular' },
                      (o.price * o.qty).toFixed(2),
                      h('span', { class: 'cur' }, '₽'))),
                  h('div', { class: 'order-grid' },
                    fieldEl('solar:server-bold-duotone', 'Сервер', o.server),
                    fieldEl('solar:calendar-bold-duotone', 'Дата', o.date),
                    fieldEl('solar:clock-circle-bold-duotone', 'Время', o.time),
                    fieldEl('solar:check-circle-bold-duotone', 'Статус', o.status, true),
                  )),
              ));
          })),
  );
}

/* ============ Boot ============ */
const PAGE = document.body.dataset.page || 'shop';
if (PAGE === 'shop') {
  mountPage('shop', shopContent());
  refresh();
} else if (PAGE === 'profile') {
  mountPage('profile', profileContent());
} else if (PAGE === 'history') {
  mountPage('history', historyContent());
}
