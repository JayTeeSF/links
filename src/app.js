(() => {
  'use strict';

  const STORE_KEY = 'jayteesf.link-atlas.library.v1';
  const THEME_KEY = 'jayteesf.link-atlas.theme.v1';
  const PAGE_SIZE = 24;
  const $ = (selector) => document.querySelector(selector);
  const byId = (id) => document.getElementById(id);
  const SAMPLE = [
    {title:'The Public Domain Review',url:'https://publicdomainreview.org/',description:'Curious art, forgotten histories and wonderful things in the public domain.',category:'Inspiration',tags:['art','history','ideas'],addedAt:'2021-07-14'},
    {title:'Internet Archive',url:'https://archive.org/',description:'An extraordinary archive of websites, books, audio and moving images.',category:'Research',tags:['archives','history'],addedAt:'2019-04-08'},
    {title:'Our World in Data',url:'https://ourworldindata.org/',description:'Explore research and data about how the world is changing.',category:'Learning',tags:['data','science'],addedAt:'2022-11-09'},
    {title:'A List Apart',url:'https://alistapart.com/',description:'Thoughtful writing about design, content and the making of the web.',category:'Design',tags:['web','writing'],addedAt:'2020-03-12'},
    {title:'Open Library',url:'https://openlibrary.org/',description:'A catalog of books with millions of editions and reading discoveries.',category:'Reading',tags:['books','library'],addedAt:'2023-01-22'},
    {title:'NASA — Astronomy Picture of the Day',url:'https://apod.nasa.gov/apod/astropix.html',description:'A new photograph or illustration of our universe, with an explanation.',category:'Inspiration',tags:['space','photography'],addedAt:'2020-09-18'},
    {title:'MDN Web Docs',url:'https://developer.mozilla.org/',description:'Reference material for the technologies that make the web work.',category:'Technology',tags:['web','developer'],addedAt:'2018-02-10'},
    {title:'The Stanford Encyclopedia of Philosophy',url:'https://plato.stanford.edu/',description:'A living reference of carefully researched philosophy articles.',category:'Learning',tags:['ideas','reference'],addedAt:'2021-08-03'},
    {title:'Project Gutenberg',url:'https://www.gutenberg.org/',description:'Thousands of free books in the public domain.',category:'Reading',tags:['books','classics'],addedAt:'2018-04-25'},
    {title:'Library of Congress Digital Collections',url:'https://www.loc.gov/collections/',description:'A window into historical photographs, recordings, maps and documents.',category:'Research',tags:['archives','history'],addedAt:'2022-02-13'},
    {title:'MIT OpenCourseWare',url:'https://ocw.mit.edu/',description:'Free course materials from a wide range of MIT subjects.',category:'Learning',tags:['courses','education'],addedAt:'2019-10-29'},
    {title:'Are.na',url:'https://www.are.na/',description:'Connect visual ideas and organize collections of inspiration.',category:'Inspiration',tags:['collections','ideas'],addedAt:'2024-05-06'}
  ];
  const SHELVES = [
    {id:'all', label:'All links', icon:'▤'},
    {id:'due', label:'Rediscover', icon:'✦'},
    {id:'unopened', label:'Never opened', icon:'◌'},
    {id:'favorites', label:'Favorites', icon:'♡'},
    {id:'history', label:'Recently opened', icon:'↶'},
    {id:'archived', label:'Archived', icon:'▱'}
  ];
  const AVATAR_COLORS = [
    ['#ececf9','#6b6496'],['#fdeee7','#ad6854'],['#e3f1ed','#367e71'],
    ['#e7eef9','#5379ab'],['#f8eddd','#af8651'],['#f1e6f7','#8f6e9c']
  ];
  const nowISO = () => new Date().toISOString();
  const id = () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'link-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  const clean = (value, max = 1200) => String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
  const el = (tag, className, content) => { const n = document.createElement(tag); if (className) n.className = className; if (content !== undefined) n.textContent = String(content); return n; };
  const randomInt = (max) => { if (max <= 1) return 0; if (typeof crypto !== 'undefined' && crypto.getRandomValues) { const x = new Uint32Array(1); crypto.getRandomValues(x); return x[0] % max; } return Math.floor(Math.random() * max); };
  const hash = (str) => { let v = 2166136261; for (const ch of str) { v ^= ch.charCodeAt(0); v = Math.imul(v,16777619); } return v >>> 0; };
  const safeUrl = (raw) => {
    let s = String(raw ?? '').trim();
    if (!s || s.length > 4096) return null;
    if (/^\/\//.test(s)) s = 'https:' + s;
    else if (!/^[a-z][a-z\d+.-]*:\/\//i.test(s)) { if (/^[a-z][a-z\d+.-]*:/i.test(s)) return null; s = 'https://' + s; }
    try {
      const u = new URL(s);
      if (!['http:','https:'].includes(u.protocol) || !u.hostname || /\s/.test(u.hostname)) return null;
      return u.href;
    } catch { return null; }
  };
  const keyForUrl = (url) => { try { const u = new URL(url); const path = u.pathname.replace(/\/+$/,'') || '/'; return `${u.protocol}//${u.host}${path}${u.search}${u.hash}`; } catch { return url; } };
  const domain = (url) => { try { return new URL(url).hostname.replace(/^www\./i,''); } catch { return ''; } };
  const fmtDay = (value) => { if (!value) return null; const d = new Date(value); return Number.isFinite(d.getTime()) ? d : null; };
  const dateText = (value) => { const date = fmtDay(value); if (!date) return ''; return date.toLocaleDateString(undefined,{month:'short',year:'numeric'}); };
  const dayAge = (iso) => { if (!iso) return Infinity; const d = fmtDay(iso); return d ? Math.max(0,(Date.now() - d.getTime()) / 86400000) : Infinity; };
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalizeTags = (input) => {
    const a = Array.isArray(input) ? input : String(input ?? '').split(',');
    const found = new Set(), out = [];
    for (const t of a) { const v = clean(t,36); if (v && !found.has(v.toLowerCase())) { found.add(v.toLowerCase()); out.push(v); } if (out.length >= 12) break; }
    return out;
  };
  const normalizeItem = (raw, index = 0, demo = false) => {
    if (!raw || typeof raw !== 'object') return null;
    const url = safeUrl(raw.url || raw.href || raw.canonical_url);
    if (!url) return null;
    const title = clean(raw.title || raw.link_text || raw.name || domain(url),180);
    let when = raw.addedAt || raw.date_added || raw.added_at || raw.dateAdded || nowISO();
    if (typeof when === 'number' || /^\d{10}$/.test(String(when))) when = new Date(Number(when) * 1000).toISOString();
    const addedAt = fmtDay(when) ? new Date(when).toISOString() : nowISO();
    let lastOpened = raw.lastOpened || raw.last_opened || null;
    if (!fmtDay(lastOpened)) lastOpened = null;
    const visits = Math.max(0,Math.min(100000000, Number(raw.visits ?? raw.visitCount ?? 0) || 0));
    return {
      id: clean(raw.id || (demo ? `demo-${index}` : id()),100),
      url, title,
      description:clean(raw.description || raw.snippet || '',1200),
      note:clean(raw.note || raw.notes || raw.reason || raw.why || '',1200),
      category:clean(raw.category || raw.folder || 'Unsorted',60) || 'Unsorted',
      tags:normalizeTags(raw.tags), addedAt, favorite:!!raw.favorite,
      visits:Math.floor(visits),lastOpened,archived:!!raw.archived,
      rating:Number.isFinite(Number(raw.rating)) ? Math.max(0,Math.min(5,Number(raw.rating))) : 0,
      mediaType:clean(raw.mediaType || raw.media_type || '',80),
      platform:clean(raw.platform || '',120),
      dateCreated:clean(raw.dateCreated || raw.date_created || '',80),
      demo:!!demo || !!raw.demo
    };
  };
  const startSample = () => ({version:1,sample:true,items:SAMPLE.map((row,i) => normalizeItem(row,i,true))});
  const readPublishedItems = () => {
    const source = byId('atlasSeedData');
    if (!source) return [];
    try {
      const rows = JSON.parse(source.textContent || '[]');
      if (!Array.isArray(rows)) return [];
      const seen = new Set();
      const items = [];
      for (const [index,row] of rows.entries()) {
        const url = safeUrl(row?.url || row?.href || row?.canonical_url);
        const stableId = row?.id || (url ? `published-${hash(keyForUrl(url)).toString(36)}` : `published-${index}`);
        const item = normalizeItem({...row,id:stableId},index);
        if (!item) continue;
        const key = keyForUrl(item.url);
        if (seen.has(key)) continue;
        seen.add(key);
        items.push(item);
      }
      return items;
    } catch { return []; }
  };
  const PUBLISHED_ITEMS = readPublishedItems();
  const initialStore = () => PUBLISHED_ITEMS.length
    ? {version:1,sample:false,items:PUBLISHED_ITEMS.map(item=>({...item,tags:item.tags.slice()}))}
    : startSample();
  const loadStore = () => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return initialStore();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.items)) return initialStore();
      const seen = new Set(); const items = [];
      for (const row of parsed.items.slice(0,25000)) {
        const x = normalizeItem(row);
        if (!x || seen.has(keyForUrl(x.url))) continue;
        seen.add(keyForUrl(x.url)); items.push(x);
      }
      return {version:1,sample:!!parsed.sample,items};
    } catch { return initialStore(); }
  };
  let store = loadStore();
  let state = {shelf:PUBLISHED_ITEMS.length?'favorites':'all',topic:'',search:'',sort:PUBLISHED_ITEMS.length?'newest':'rediscover',layout:'list',limit:PAGE_SIZE,featuredId:null,menuOpenId:null};
  let pendingImport = null, pendingDelete = null, toastTimer = null;
  const activeItems = () => store.items.filter(x => !x.archived);
  const persist = () => {
    try { localStorage.setItem(STORE_KEY,JSON.stringify(store)); return true; }
    catch { toast('Unable to save browser data. Export a backup before leaving.'); return false; }
  };
  const toast = (message) => {
    const node = byId('toast'); node.textContent = message; node.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove('show'),3100);
  };
  const itemFor = (itemId) => store.items.find(x => x.id === itemId);
  const isDue = (x) => !x.lastOpened || dayAge(x.lastOpened) > 30;
  const rediscoveryScore = (x) => {
    const time = Number.isFinite(dayAge(x.lastOpened)) ? dayAge(x.lastOpened) : 1500;
    const saved = Math.min(dayAge(x.addedAt),2400);
    return Math.min(time,1500) * .25 + saved * .02 + (x.favorite ? 9 : 0) - Math.log2(1+x.visits) * 16;
  };
  const shuffled = (arr) => { const out = arr.slice(); for (let i=out.length-1;i>0;i--) { const j = randomInt(i+1); [out[i],out[j]] = [out[j],out[i]]; } return out; };
  const chooseDaily = () => {
    const pool = activeItems(); if (!pool.length) return null;
    const eligible = pool.filter(x => isDue(x)); const ranked = (eligible.length ? eligible : pool).sort((a,b) => rediscoveryScore(b)-rediscoveryScore(a));
    const dateKey = new Date().toLocaleDateString('en-CA');
    return ranked[hash(dateKey) % Math.min(12,ranked.length)]?.id || null;
  };
  const chooseAnother = () => {
    const all = activeItems();
    if (!all.length) { state.featuredId=null; renderFeatured(); toast('Add a link to start discovering.'); return; }
    const pool = all.filter(x => x.id !== state.featuredId);
    state.featuredId = (pool.length ? pool : all)[randomInt((pool.length ? pool : all).length)].id;
    renderFeatured();
  };
  const markOpened = (itemId) => {
    const item = itemFor(itemId); if (!item) return;
    item.visits = (item.visits || 0) + 1; item.lastOpened = nowISO();
    persist(); renderAll();
  };
  const linkAnchor = (item,text,className='') => {
    const a = el('a',className,text); a.href = item.url; a.target='_blank';a.rel='noopener noreferrer';a.dataset.openId=item.id;
    a.title=`Open ${item.title} in a new tab`;return a;
  };
  const renderFeatured = () => {
    const target = byId('featuredContent'); target.replaceChildren();
    const item = activeItems().find(x => x.id === state.featuredId) || null;
    if (!item) {
      target.append(el('p','featured-empty','Every great collection starts with a link.'));
      target.append(el('p','feature-empty-copy','Import your browser bookmarks or add a favorite site to get your first rediscovery.'));
      byId('featuredReason').textContent = 'There’s always more to find';
      byId('featuredCounter').textContent = 'Your future time capsule'; return;
    }
    const site = el('div','feature-domain');
    site.append(el('span','feature-favicon',domain(item.url).slice(0,1).toUpperCase()));
    site.append(el('span','',domain(item.url)));
    const title = el('h3','feature-title'); title.append(linkAnchor(item,item.title));
    const description = el('p','feature-description',item.note || item.description || 'A site you thought was worth saving. See what you find when you return.');
    const action = linkAnchor(item,'Open this discovery ↗','feature-link');
    target.append(site,title,description,action);
    byId('featuredCounter').textContent = item.visits ? `Opened ${item.visits} ${item.visits===1?'time':'times'}` : 'Waiting to be rediscovered';
    byId('featuredReason').textContent = item.favorite ? '✦ One of your favorites' : item.lastOpened ? `Last explored ${dateText(item.lastOpened)}` : 'A link worth coming back to';
  };
  const shelfCount = (shelf) => {
    const active = activeItems();
    if (shelf === 'all') return active.length;
    if (shelf === 'archived') return store.items.length-active.length;
    if (shelf === 'favorites') return active.filter(x => x.favorite).length;
    if (shelf === 'unopened') return active.filter(x => !x.visits).length;
    if (shelf === 'due') return active.filter(isDue).length;
    if (shelf === 'history') return active.filter(x => x.visits > 0).length;
    return 0;
  };
  const topicColors = (label) => ['#9c87cf','#e6a179','#69acaa','#7d9bcf','#c3a279','#8f91cb'][hash(label)%6];
  const topicCounts = () => {
    const categories = new Map(); for (const x of activeItems()) categories.set(x.category,(categories.get(x.category)||0)+1);
    return [...categories.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  };
  const renderNavigation = () => {
    const sidebar = byId('shelfNav'), mobile = byId('mobileShelves'), topics = byId('topicNav');
    sidebar.replaceChildren(); mobile.replaceChildren(); topics.replaceChildren();
    for (const shelf of SHELVES) {
      const button = el('button','side-button'+(state.shelf===shelf.id?' active':''));
      button.type='button';button.dataset.shelf=shelf.id;button.setAttribute('aria-current', state.shelf===shelf.id?'page':'false');
      button.append(el('span','side-ico',shelf.icon),el('span','',shelf.label),el('span','side-number',shelfCount(shelf.id)));
      sidebar.append(button);
      const chip=el('button','mobile-chip'+(state.shelf===shelf.id?' active':''),shelf.label + ' ' + shelfCount(shelf.id));
      chip.type='button';chip.dataset.shelf=shelf.id;chip.setAttribute('aria-pressed',String(state.shelf===shelf.id)); mobile.append(chip);
    }
    for (const [category,count] of topicCounts().slice(0,16)) {
      const button=el('button','topic-button'+(state.topic===category?' active':''));button.type='button';button.dataset.topic=category;button.setAttribute('aria-pressed',String(state.topic===category));
      const dot=el('span','topic-dot');dot.style.background=topicColors(category);button.append(dot,el('span','',category),el('span','topic-qty',count));topics.append(button);
    }
    if (!topics.children.length) topics.append(el('p','side-label','Topics appear as you add links.'));
  };
  const renderStats = () => {
    const wrap=byId('stats');wrap.replaceChildren();
    const cards=[
      {value:activeItems().length,label:'Links to explore',icon:'▤',tone:''},
      {value:shelfCount('unopened'),label:'Still waiting',icon:'◌',tone:'warm'},
      {value:shelfCount('favorites'),label:'Your favorites',icon:'✦',tone:'teal'},
      {value:shelfCount('history'),label:'Rediscovered',icon:'↶',tone:'blue'}
    ];
    for (const item of cards) { const c=el('div','stat-card'); const icon=el('div','stat-icon '+item.tone,item.icon);const info=el('div','stat-copy');info.append(el('strong','',item.value.toLocaleString()),el('span','',item.label));c.append(icon,info);wrap.append(c); }
  };
  const getVisible = () => {
    let items = store.items.filter(x => state.shelf === 'archived' ? x.archived : !x.archived);
    if (state.shelf === 'favorites') items=items.filter(x=>x.favorite);
    if (state.shelf === 'unopened') items=items.filter(x=>!x.visits);
    if (state.shelf === 'due') items=items.filter(isDue);
    if (state.shelf === 'history') items=items.filter(x=>x.visits>0);
    if (state.topic) items=items.filter(x=>x.category===state.topic);
    const tokens=state.search.toLocaleLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length) items=items.filter(x => {const target=[x.title,x.description,x.note,x.category,domain(x.url),x.url,...x.tags].join(' ').toLocaleLowerCase();return tokens.every(t=>target.includes(t));});
    const sort=state.shelf==='history'?'recent':state.sort;
    const date = (x,key) => fmtDay(x[key])?.getTime()||0;
    if (sort === 'az') items.sort((a,b)=>a.title.localeCompare(b.title));
    else if (sort === 'za') items.sort((a,b)=>b.title.localeCompare(a.title));
    else if (sort === 'rating-high') items.sort((a,b)=>b.rating-a.rating || a.title.localeCompare(b.title));
    else if (sort === 'rating-low') items.sort((a,b)=>a.rating-b.rating || a.title.localeCompare(b.title));
    else if (sort === 'newest') items.sort((a,b)=>date(b,'addedAt')-date(a,'addedAt'));
    else if (sort === 'oldest') items.sort((a,b)=>date(a,'addedAt')-date(b,'addedAt'));
    else if (sort === 'visits') items.sort((a,b)=>a.visits-b.visits || rediscoveryScore(b)-rediscoveryScore(a));
    else if (sort === 'recent') items.sort((a,b)=>date(b,'lastOpened')-date(a,'lastOpened'));
    else items.sort((a,b)=>rediscoveryScore(b)-rediscoveryScore(a));
    return items;
  };
  const createCard = (item) => {
    const card=el('article','link-card'); card.dataset.id=item.id;card.dataset.opened=String(item.visits>0);
    const host=domain(item.url);
    const colors=AVATAR_COLORS[hash(host)%AVATAR_COLORS.length];
    const avatar=el('div','site-avatar',(host.split('.')[0]||'W').slice(0,2).toUpperCase());avatar.setAttribute('aria-hidden','true');avatar.style.setProperty('--avatar-bg',colors[0]);avatar.style.setProperty('--avatar-fg',colors[1]);
    const main=el('div','card-main');main.append(el('div','card-domain',host));
    const title=el('h3','card-title');title.append(linkAnchor(item,item.title));main.append(title);
    if (item.description) main.append(el('p','card-description',item.description));
    if (item.note) main.append(el('p','card-note',item.note));
    const meta=el('div','card-meta');meta.append(el('span','meta-chip cat-chip',item.category));
    if (item.rating>0) meta.append(el('span','meta-chip rating-chip',`★ ${item.rating}/5`));
    for (const t of item.tags.slice(0,3)) meta.append(el('span','meta-chip',`#${t}`));
    if (item.tags.length>3) meta.append(el('span','meta-chip',`+${item.tags.length-3}`));
    if (item.visits>0) meta.append(el('span','meta-date',`Opened ${item.visits}× · ${dateText(item.lastOpened)}`));
    else meta.append(el('span','meta-date',`Saved ${dateText(item.addedAt)}`));
    if (item.archived) meta.append(el('span','meta-chip','Archived'));
    main.append(meta);
    const actions=el('div','card-actions');
    const star=el('button','card-icon-btn'+(item.favorite?' saved':''),item.favorite?'★':'☆');
    star.type='button';star.dataset.action='favorite';star.dataset.id=item.id;star.title=item.favorite?'Remove from favorites':'Add to favorites';star.setAttribute('aria-label',star.title);star.setAttribute('aria-pressed',String(item.favorite));actions.append(star);
    const link=linkAnchor(item,'↗','card-icon-btn open-link');link.setAttribute('aria-label',`Open ${item.title} in new tab`);actions.append(link);
    const wrap=el('div','overflow-wrap');const more=el('button','card-icon-btn','···');more.type='button';more.title='More options';more.dataset.action='menu';more.dataset.id=item.id;more.setAttribute('aria-label',`More options for ${item.title}`);more.setAttribute('aria-expanded',String(state.menuOpenId===item.id));
    const menu=el('div','overflow-menu');menu.hidden=state.menuOpenId!==item.id;
    const choices=[['edit','✎  Edit details'],['copy','⧉  Copy URL'],['archive',item.archived?'↶  Restore':'▱  Archive'],['delete','✕  Remove link']];
    for (const [kind,text] of choices){const b=el('button',kind==='delete'?'menu-danger':'',text);b.type='button';b.dataset.action=kind;b.dataset.id=item.id;menu.append(b);}
    wrap.append(more,menu);actions.append(wrap);card.append(avatar,main,actions);return card;
  };
  const renderEmpty = () => {
    const wrap=el('div','empty-state');wrap.append(el('div','empty-art','✧'));
    let title='Nothing here just yet.', body='A good collection starts with one memorable link.', action='Add your first link';
    if (state.search || state.topic) {title='No matches this time.';body='Try a different word, or clear the search and topic filters.';action='Clear filters';}
    else if (state.shelf==='favorites') {title='Your favorites will shine here.';body='Tap the star beside a link to keep the ones you love close.';action='Browse all links';}
    else if (state.shelf==='history') {title='Your journey starts when you open a link.';body='Links you visit from Link Atlas will appear here automatically.';action='Browse links';}
    else if (state.shelf==='archived') {title='Nothing has been archived.';body='Put links on the quiet shelf without losing them.';action='Browse all links';}
    else if (state.shelf==='due') {title='All caught up!';body='Come back another day, or see the rest of your saved sites.';action='Browse all links';}
    else if (state.shelf==='unopened') {title='You’ve opened every link.';body='A lovely problem to have. Explore your favorites or save something new.';action='Browse all links';}
    wrap.append(el('h3','',title),el('p','',body));
    const btns=el('div','empty-buttons');const primary=el('button','btn btn-primary',action);primary.type='button';primary.dataset.action='empty-main';btns.append(primary);
    if (state.shelf==='all' && !state.search && !state.topic) {const imp=el('button','btn btn-subtle','Import bookmarks');imp.type='button';imp.dataset.action='empty-import';btns.append(imp);}
    wrap.append(btns);return wrap;
  };
  const renderLibrary = () => {
    const visible=getVisible();const shelf=SHELVES.find(x=>x.id===state.shelf)||SHELVES[0];
    const heading=state.topic||shelf.label;
    byId('shelfKicker').textContent = state.shelf==='due'?'A LITTLE SERENDIPITY':state.shelf==='history'?'WHERE YOU’VE BEEN':'YOUR COLLECTION';
    byId('shelfTitle').replaceChildren(document.createTextNode(heading+' '));
    byId('shelfTitle').append(el('span','',`(${visible.length})`));
    const subtitles={all:'Everything worth keeping, in one thoughtfully organized place.',due:'Old discoveries with something more to offer.',unopened:'Saved for a reason. Still waiting for a visit.',favorites:'The sites you never want to lose.',history:'Follow the trail of things you’ve revisited.',archived:'Out of the way, but never forgotten.'};
    byId('shelfSubhead').textContent=subtitles[state.shelf];
    byId('sampleBanner').hidden=!store.sample;
    byId('resultCount').textContent=`Showing ${Math.min(state.limit,visible.length).toLocaleString()} of ${visible.length.toLocaleString()} ${visible.length===1?'link':'links'}`;
    const list=byId('linkList');list.classList.toggle('grid-mode',state.layout==='grid');list.replaceChildren();
    const frag=document.createDocumentFragment();
    if (!visible.length) frag.append(renderEmpty());
    else for (const item of visible.slice(0,state.limit)) frag.append(createCard(item));
    list.append(frag);
    const more=byId('loadMoreWrap');more.hidden=visible.length<=state.limit;
    byId('listView').classList.toggle('active',state.layout==='list');byId('gridView').classList.toggle('active',state.layout==='grid');
    byId('listView').setAttribute('aria-pressed',String(state.layout==='list'));byId('gridView').setAttribute('aria-pressed',String(state.layout==='grid'));
    const filter=byId('activeFilter');filter.replaceChildren();filter.hidden=!state.topic;
    if (state.topic){filter.append(el('span','','Topic: '+state.topic));const remove=el('button','','Clear ×');remove.type='button';remove.dataset.action='clear-topic';filter.append(remove);}
  };
  const renderAll = () => {
    if (!activeItems().some(x=>x.id===state.featuredId)) state.featuredId=chooseDaily();
    renderFeatured();renderStats();renderNavigation();renderLibrary();
  };
  const setShelf = (newShelf) => {state.shelf=newShelf;state.topic='';state.limit=PAGE_SIZE;state.menuOpenId=null;renderAll();};
  const setTopic = (category) => {state.topic=state.topic===category?'':category;state.shelf='all';state.limit=PAGE_SIZE;renderAll();};
  const openDialog = (name) => {const dlg=byId(name);if (!dlg.open) dlg.showModal();};
  const closeDialog = (name) => {const dlg=byId(name);if (dlg.open) dlg.close();};
  const openEditor = (itemId = '') => {
    byId('editForm').reset();byId('formError').hidden=true;
    const x=itemFor(itemId);
    byId('editId').value=x?.id||'';
    byId('editTitle').textContent=x?'Make this link your own.':'Keep something good.';
    byId('editSubmit').textContent=x?'Save changes ↗':'Save link ↗';
    if (x) {
      byId('urlInput').value=x.url;byId('titleInput').value=x.title;
      byId('descriptionInput').value=x.description;byId('noteInput').value=x.note;
      byId('categoryInput').value=x.category==='Unsorted'?'':x.category;
      byId('tagsInput').value=x.tags.join(', ');byId('favoriteInput').checked=x.favorite;
    }
    openDialog('editDialog');byId('urlInput').focus();
  };
  const saveEditor = (event) => {
    event.preventDefault();const url=safeUrl(byId('urlInput').value);
    if (!url) {showFormError('Please enter a valid http:// or https:// URL.');return;}
    const previous=itemFor(byId('editId').value);
    if (store.items.some(x=>x.id!==previous?.id && keyForUrl(x.url)===keyForUrl(url))) {showFormError('That address is already in your library. You can edit the existing entry.');return;}
    const title=clean(byId('titleInput').value,180)||domain(url);
    if (!title){showFormError('Please give this link a name.');return;}
    const row={...(previous||{}),id:previous?.id||id(),url,title,description:clean(byId('descriptionInput').value),note:clean(byId('noteInput').value),category:clean(byId('categoryInput').value,60)||'Unsorted',tags:normalizeTags(byId('tagsInput').value),favorite:byId('favoriteInput').checked,addedAt:previous?.addedAt||nowISO(),lastOpened:previous?.lastOpened||null,visits:previous?.visits||0,archived:previous?.archived||false,demo:previous?.demo||false};
    if (previous) store.items[store.items.findIndex(x=>x.id===previous.id)]=row;else store.items.unshift(row);
    persist();closeDialog('editDialog');state.shelf='all';state.topic='';state.search='';byId('searchInput').value='';state.limit=PAGE_SIZE;renderAll();toast(previous?'Link updated.':'Added to your collection.');
  };
  const showFormError = (msg) => {const e=byId('formError');e.textContent=msg;e.hidden=false;};
  const askConfirm = (heading,text,label,onYes) => {
    byId('confirmTitle').textContent=heading;byId('confirmText').textContent=text;
    byId('confirmYes').textContent=label;pendingDelete=onYes;openDialog('confirmDialog');
  };
  const handleAction = (action,itemId) => {
    const x=itemFor(itemId);
    if (action==='empty-main') {if(state.search || state.topic){state.topic='';state.search='';byId('searchInput').value='';state.shelf='all';renderAll();}else if(state.shelf!=='all')setShelf('all');else openEditor();return;}
    if (action==='empty-import'){showManager('import');return;}
    if (action==='clear-topic'){state.topic='';renderAll();return;}
    if (!x) return;
    if(action==='menu'){state.menuOpenId=state.menuOpenId===itemId?null:itemId;renderLibrary();return;}
    state.menuOpenId=null;
    if(action==='favorite'){x.favorite=!x.favorite;persist();renderAll();toast(x.favorite?'Added to favorites.':'Removed from favorites.');}
    if(action==='edit')openEditor(x.id);
    if(action==='copy')copyText(x.url);
    if(action==='archive'){x.archived=!x.archived;persist();renderAll();toast(x.archived?'Moved to archive.':'Restored to your library.');}
    if(action==='delete')askConfirm('Remove this link?',`“${x.title}” will be removed from this browser’s library.`, 'Remove link',()=>{store.items=store.items.filter(y=>y.id!==x.id);persist();renderAll();toast('Link removed.');});
  };
  const copyText=async(text)=>{
    try{await navigator.clipboard.writeText(text);toast('Link copied to clipboard.');}
    catch{const temp=el('textarea');temp.value=text;temp.style.cssText='position:fixed;left:-1000px;top:0';document.body.append(temp);temp.select();const ok=document.execCommand('copy');temp.remove();toast(ok?'Link copied to clipboard.':'Clipboard unavailable; open and copy the link manually.');}
  };
  const showManager=(tab='import')=>{
    showTab(tab);
    if(!pendingImport){byId('replaceExisting').checked=!!store.sample;byId('importPreview').textContent='No file selected yet.';byId('runImport').disabled=true;}
    openDialog('manageDialog');
  };
  const showTab=(tab)=>{
    const on=tab==='import';byId('importPanel').hidden=!on;byId('exportPanel').hidden=on;
    byId('importTab').classList.toggle('active',on);byId('exportTab').classList.toggle('active',!on);
    byId('importTab').setAttribute('aria-selected',String(on));byId('exportTab').setAttribute('aria-selected',String(!on));
  };
  const parseChromeBookmarks=(obj)=>{
    const results=[];
    function walk(node,folders=[]){if(!node||typeof node!=='object')return;
      if(Array.isArray(node)){node.forEach(n=>walk(n,folders));return;}
      if(node.type==='url'&&node.url){results.push({title:node.name,url:node.url,category:folders.at(-1)||'Unsorted',tags:folders.slice(0,-1)});return;}
      const next=node.name ? [...folders,node.name] : folders;
      if(Array.isArray(node.children))walk(node.children,next);
      if(node.roots)Object.values(node.roots).forEach(n=>walk(n,[]));
    }
    walk(obj);return results;
  };
  const folderForAnchor=(anchor)=>{
    let dl=anchor.closest('dl');
    for(let hops=0;dl&&hops<15;hops++,dl=dl.parentElement?.closest('dl')){
      const prev=dl.previousElementSibling;
      const heading=(prev?.tagName==='DT'?prev.querySelector('h3'):null)||
        (prev?.tagName==='H3'?prev:null)||
        (dl.parentElement?.tagName==='DT'?dl.parentElement.querySelector(':scope > h3'):null);
      if (heading) return clean(heading.textContent,60);
    }
    return 'Unsorted';
  };
  const parseNetscape=(html)=>{
    const doc=new DOMParser().parseFromString(html,'text/html');
    return [...doc.querySelectorAll('a[href]')].map(a=>{
      const when=a.getAttribute('add_date'); const seconds=Number(when);
      return {url:a.getAttribute('href'),title:clean(a.textContent,180),category:folderForAnchor(a),addedAt:seconds>0&&seconds<1e11 ? new Date(seconds*1000).toISOString() : nowISO()};
    });
  };
  const csvRows=(s)=>{
    const out=[];let row=[],value='',quoted=false;
    for(let i=0;i<s.length;i++){
      const c=s[i];
      if(c==='"'){if(quoted&&s[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}
      else if(c===','&&!quoted){row.push(value);value='';}
      else if((c==='\r'||c==='\n')&&!quoted){if(c==='\r'&&s[i+1]==='\n')i++;row.push(value);if(row.some(v=>v.trim()))out.push(row);row=[];value='';}
      else value+=c;
    }
    row.push(value);if(row.some(v=>v.trim()))out.push(row);return out;
  };
  const parseCSV=(csv)=>{
    const rows=csvRows(csv);if(!rows.length)return [];
    const columns=rows[0].map(x=>x.trim().toLowerCase());
    const map=rows.slice(1).map(fields=>Object.fromEntries(columns.map((c,i)=>[c,fields[i]||''])));
    if(!columns.includes('url')&&!columns.includes('href'))throw Error('The CSV needs a column named URL.');
    return map;
  };
  const parseFile=(filename,contents)=>{
    const name=filename.toLowerCase();let rows=[];
    if(name.endsWith('.json')||/^\s*[\[{]/.test(contents)&&!name.endsWith('.html')){
      let obj;try{obj=JSON.parse(contents);}catch{throw Error('The JSON could not be read. Check that it is a valid export.');}
      if(Array.isArray(obj))rows=obj;
      else if(Array.isArray(obj.items))rows=obj.items;
      else if(Array.isArray(obj.links))rows=obj.links;
      else if(obj.roots||Array.isArray(obj.children))rows=parseChromeBookmarks(obj);
      else throw Error('This JSON has no links array or recognized bookmark folders.');
    } else if(name.endsWith('.html')||name.endsWith('.htm')||/<!doctype netscape-bookmark-file/i.test(contents)) rows=parseNetscape(contents);
    else if(name.endsWith('.csv')) rows=parseCSV(contents);
    else rows=contents.split(/\r?\n/).map(line=>{const fields=line.trim().split(/\t+/);return {url:fields[0]||'',title:fields[1]||''};});
    const found=new Set(),items=[];let skipped=0,dupes=0;
    for(const [i,row] of rows.entries()){
      const normalized=normalizeItem(row,i);
      if(!normalized){skipped++;continue;}
      const key=keyForUrl(normalized.url);
      if(found.has(key)){dupes++;continue;}found.add(key);items.push(normalized);
      if(items.length>=25000)break;
    }
    return {items,skipped,dupes,sourceCount:rows.length};
  };
  const importPreview=()=>{
    const target=byId('importPreview');target.replaceChildren();
    if(!pendingImport){target.textContent='No file selected yet.';byId('runImport').disabled=true;return;}
    const {items,skipped,dupes,fileName}=pendingImport;
    const preserve=!byId('replaceExisting').checked;
    const originals=preserve?new Set(store.items.map(x=>keyForUrl(x.url))):new Set();
    const novel=items.filter(x=>!originals.has(keyForUrl(x.url))).length;
    target.append(el('strong','',fileName),el('div','',`${items.length.toLocaleString()} valid unique links found · ${novel.toLocaleString()} new ${preserve?'links to add':'links after replacing'}${skipped?` · ${skipped} invalid skipped`:''}${dupes?` · ${dupes} duplicates collapsed`:''}`));
    const list=el('ul','preview-list');for(const x of items.slice(0,3))list.append(el('li','',x.title));if(items.length>3)list.append(el('li','',`…and ${(items.length-3).toLocaleString()} more`));target.append(list);
    byId('runImport').disabled=!items.length;
  };
  const acceptFile=async(file)=>{
    if(!file)return;
    if(file.size>12_000_000){toast('That file is too large (12 MB limit).');return;}
    try{const text=await file.text();const parsed=parseFile(file.name,text);pendingImport={...parsed,fileName:file.name};importPreview();}
    catch(error){pendingImport=null;byId('importPreview').textContent=`Could not import: ${error.message}`;byId('runImport').disabled=true;}
  };
  const runImport=()=>{
    if(!pendingImport?.items.length)return;
    const replace=byId('replaceExisting').checked;
    const current=replace?[]:store.items.slice();
    const seen=new Set(current.map(x=>keyForUrl(x.url)));
    let added=0;for(const row of pendingImport.items){const key=keyForUrl(row.url);if(seen.has(key))continue;seen.add(key);current.push({...row,demo:false,id:id()});added++;}
    store={version:1,sample:false,items:current};
    persist();pendingImport=null;byId('importFile').value='';closeDialog('manageDialog');
    state.shelf='all';state.topic='';state.search='';state.limit=PAGE_SIZE;byId('searchInput').value='';state.featuredId=null;renderAll();
    toast(`${added.toLocaleString()} ${added===1?'link':'links'} imported${replace?' into a fresh collection':''}.`);
  };
  const downloadText=(content,mime,filename)=>{
    const blob=new Blob([content],{type:mime});const u=URL.createObjectURL(blob);
    const a=el('a');a.href=u;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);
  };
  const exportJSON=()=>{
    const payload={format:'jayteesf-link-atlas',version:1,exportedAt:nowISO(),items:store.items};
    downloadText(JSON.stringify(payload,null,2),'application/json','link-atlas-backup.json');toast('JSON backup downloaded.');
  };
  const exportHTML=()=>{
    const groups=new Map();for(const x of activeItems()){
      const group=x.category||'Unsorted';if(!groups.has(group))groups.set(group,[]);groups.get(group).push(x);
    }
    let content='<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Link Atlas Bookmarks</TITLE>\n<H1>Link Atlas Bookmarks</H1>\n<DL><p>\n';
    for(const [category,rows] of groups){content+=`  <DT><H3>${escapeHtml(category)}</H3>\n  <DL><p>\n`;
      for(const x of rows){const when=Math.floor((fmtDay(x.addedAt)?.getTime()||Date.now())/1000);content+=`    <DT><A HREF="${escapeHtml(x.url)}" ADD_DATE="${when}">${escapeHtml(x.title)}</A>\n`;}
      content+='  </DL><p>\n';
    }
    content+='</DL><p>\n';downloadText(content,'text/html','link-atlas-bookmarks.html');toast('Browser bookmarks exported.');
  };
  const setupAppearance=()=>{
    let choice='';try{choice=localStorage.getItem(THEME_KEY)||'';}catch{}
    const dark=choice ? choice==='dark' : window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme=dark?'dark':'light';updateThemeButton();
  };
  const updateThemeButton=()=>{
    const dark=document.documentElement.dataset.theme==='dark';
    byId('themeToggle').setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
    byId('themeToggle').title=dark?'Light mode':'Dark mode';
    byId('themeToggle').innerHTML=dark?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M20.5 14.4A8.6 8.6 0 0 1 9.6 3.5a8.7 8.7 0 1 0 10.9 10.9Z"/></svg>';
  };
  const toggleTheme=()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;try{localStorage.setItem(THEME_KEY,next);}catch{}updateThemeButton();};

  // Delegate card controls so hundreds of links don't create hundreds of listeners.
  byId('linkList').addEventListener('click',e=>{
    const anchor=e.target.closest('a[data-open-id]');if(anchor){markOpened(anchor.dataset.openId);return;}
    const target=e.target.closest('[data-action]');if(target){e.preventDefault();e.stopPropagation();handleAction(target.dataset.action,target.dataset.id);}
  });
  byId('featuredPanel').addEventListener('click',e=>{const a=e.target.closest('a[data-open-id]');if(a)markOpened(a.dataset.openId);});
  byId('shelfNav').addEventListener('click',e=>{const b=e.target.closest('button[data-shelf]');if(b)setShelf(b.dataset.shelf);});
  byId('mobileShelves').addEventListener('click',e=>{const b=e.target.closest('button[data-shelf]');if(b)setShelf(b.dataset.shelf);});
  byId('topicNav').addEventListener('click',e=>{const b=e.target.closest('button[data-topic]');if(b)setTopic(b.dataset.topic);});
  byId('activeFilter').addEventListener('click',e=>{if(e.target.closest('[data-action="clear-topic"]')){state.topic='';renderAll();}});
  byId('searchInput').addEventListener('input',e=>{state.search=e.target.value.trim();state.limit=PAGE_SIZE;state.menuOpenId=null;renderLibrary();});
  byId('sortSelect').addEventListener('change',e=>{state.sort=e.target.value;state.limit=PAGE_SIZE;renderLibrary();});
  byId('listView').addEventListener('click',()=>{state.layout='list';renderLibrary();});
  byId('gridView').addEventListener('click',()=>{state.layout='grid';renderLibrary();});
  byId('loadMore').addEventListener('click',()=>{state.limit+=PAGE_SIZE;renderLibrary();});
  ['addTop','bottomAdd'].forEach(name=>byId(name).addEventListener('click',()=>openEditor()));
  ['importTop','sampleImport','bottomManage'].forEach(name=>byId(name).addEventListener('click',()=>showManager('import')));
  byId('sampleClear').addEventListener('click',()=>{store.items=store.items.filter(x=>!x.demo);store.sample=false;state.featuredId=null;persist();renderAll();toast('Sample links removed. Your space is ready.');});
  byId('discoverBtn').addEventListener('click',()=>{chooseAnother();byId('featuredPanel').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});});
  byId('nextFeature').addEventListener('click',chooseAnother);
  byId('editForm').addEventListener('submit',saveEditor);
  byId('themeToggle').addEventListener('click',toggleTheme);
  byId('footerExport').addEventListener('click',exportJSON);
  byId('importTab').addEventListener('click',()=>showTab('import'));
  byId('exportTab').addEventListener('click',()=>showTab('export'));
  byId('exportJson').addEventListener('click',exportJSON);
  byId('exportHtml').addEventListener('click',exportHTML);
  byId('importFile').addEventListener('change',e=>acceptFile(e.target.files[0]));
  byId('replaceExisting').addEventListener('change',importPreview);
  byId('runImport').addEventListener('click',runImport);
  byId('eraseLibrary').addEventListener('click',()=>askConfirm('Erase local collection?',`This removes all ${store.items.length} links and their saved notes from this browser. Export a backup first.`, 'Erase collection',()=>{store={version:1,sample:false,items:[]};state.featuredId=null;persist();renderAll();closeDialog('manageDialog');toast('Your local collection has been erased.');}));
  byId('confirmYes').addEventListener('click',()=>{const doIt=pendingDelete;pendingDelete=null;closeDialog('confirmDialog');if(typeof doIt==='function')doIt();});
  document.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click',()=>closeDialog(btn.dataset.close)));
  document.querySelectorAll('dialog').forEach(dlg=>dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close();}));
  document.addEventListener('click',e=>{if(state.menuOpenId && !e.target.closest('.overflow-wrap')){state.menuOpenId=null;renderLibrary();}});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){if(state.menuOpenId){state.menuOpenId=null;renderLibrary();}return;}
    if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,dialog,[contenteditable="true"]'))return;
    if(e.key==='/'){e.preventDefault();byId('searchInput').focus();}
    else if(e.key==='n'){e.preventDefault();openEditor();}
    else if(e.key==='r'){e.preventDefault();chooseAnother();}
  });
  const drop=byId('dropArea');
  ['dragenter','dragover'].forEach(name=>drop.addEventListener(name,e=>{e.preventDefault();drop.classList.add('dragging');}));
  ['dragleave','dragend'].forEach(name=>drop.addEventListener(name,e=>{e.preventDefault();drop.classList.remove('dragging');}));
  drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('dragging');acceptFile(e.dataTransfer.files[0]);});

  byId('sortSelect').value=state.sort;
  setupAppearance();renderAll();
  // Exposes no data except a read-only diagnostic count for local smoke checks.
  window.__LINK_ATLAS_READY__ = true;
})();
