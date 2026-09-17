/* ═══════════════════════════════════════════════════════════════
   CTM-FX — 코딩더메이커 가상실험실 공통 효과 모듈
   순수 WebAudio 합성 사운드 + 캔버스 컨페티. 외부 파일 의존 없음.

   자동 기능 (스크립트 로드만 하면 됨):
     · 모든 <button> 클릭음 (이벤트 위임)
     · .badge 요소의 in/out 클래스 감지 → 성공 팡파레+컨페티 / 실패음
     · 🔊 음소거 토글 버튼 자동 주입 (localStorage 저장)

   수동 API:
     CtmFX.success()          성공 팡파레 + 컨페티
     CtmFX.fail()             실패음 (부드럽게)
     CtmFX.launch()           발사/휙 소리
     CtmFX.tick()             자동실험 스텝음
     CtmFX.pop()              짧은 팝
     CtmFX.cheer()            환호 (박수 느낌 노이즈)
     CtmFX.confetti(xr, yr)   컨페티만 (0~1 비율 좌표, 생략시 중앙 상단)
     CtmFX.fanfare()          큰 팡파레 (미션 완수급)
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.CtmFX) return;

  var MUTE_KEY = 'ctmfx-mute';
  var muted = false;
  try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch (e) {}

  /* ── AudioContext (첫 사용자 제스처에서 resume — 태블릿 대응) ── */
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null;
  function ac() {
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, function () { ac(); }, { once: true, passive: true });
  });

  /* ── 합성 프리미티브 ── */
  function tone(freq, dur, opts) {
    var c = ac(); if (!c || muted) return;
    opts = opts || {};
    var t0 = c.currentTime + (opts.delay || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = opts.type || 'triangle';
    o.frequency.setValueAtTime(freq, t0);
    if (opts.glide) o.frequency.exponentialRampToValueAtTime(opts.glide, t0 + dur);
    var v = opts.vol != null ? opts.vol : 0.14;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(v, t0 + (opts.attack || 0.008));
    g.gain.exponentialRampToValueAtTime(0.0006, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(dur, opts) {
    var c = ac(); if (!c || muted) return;
    opts = opts || {};
    var t0 = c.currentTime + (opts.delay || 0);
    var n = Math.floor(c.sampleRate * dur);
    var buf = c.createBuffer(1, n, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = c.createBufferSource(); src.buffer = buf;
    var f = c.createBiquadFilter();
    f.type = opts.filter || 'bandpass';
    f.frequency.setValueAtTime(opts.freq || 1800, t0);
    if (opts.glide) f.frequency.exponentialRampToValueAtTime(opts.glide, t0 + dur);
    f.Q.value = opts.q || 0.9;
    var g = c.createGain();
    g.gain.setValueAtTime(opts.vol != null ? opts.vol : 0.12, t0);
    g.gain.exponentialRampToValueAtTime(0.0006, t0 + dur);
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start(t0);
  }

  /* ── 사운드 세트 ── */
  var sounds = {
    click:  function () { tone(1400, 0.045, { type: 'square', vol: 0.028, attack: 0.002 }); },
    tick:   function () { tone(950, 0.05, { type: 'square', vol: 0.05, attack: 0.002 }); },
    pop:    function () { tone(520, 0.09, { type: 'sine', glide: 900, vol: 0.12 }); },
    launch: function () {
      noise(0.28, { freq: 900, glide: 3400, vol: 0.14, q: 1.4 });
      tone(220, 0.25, { type: 'sawtooth', glide: 660, vol: 0.05 });
    },
    success: function () {
      [523, 659, 784, 1047].forEach(function (f, i) {
        tone(f, 0.32, { delay: i * 0.09, vol: 0.13 });
        tone(f * 2, 0.22, { delay: i * 0.09, vol: 0.035, type: 'sine' });
      });
      noise(0.5, { delay: 0.32, freq: 6000, vol: 0.03, filter: 'highpass' }); // 반짝이
    },
    fanfare: function () {
      var seq = [523, 523, 523, 659, 784, 659, 784, 1047];
      seq.forEach(function (f, i) {
        tone(f, i === seq.length - 1 ? 0.6 : 0.16, { delay: i * 0.11, vol: 0.14 });
        tone(f / 2, i === seq.length - 1 ? 0.6 : 0.16, { delay: i * 0.11, vol: 0.06, type: 'sine' });
      });
    },
    fail: function () {
      tone(392, 0.22, { type: 'triangle', vol: 0.1 });
      tone(311, 0.34, { type: 'triangle', vol: 0.1, delay: 0.16 });
    },
    cheer: function () {
      for (var i = 0; i < 9; i++)
        noise(0.09, { delay: i * 0.055 + Math.random() * 0.02, freq: 2400 + Math.random() * 1800, vol: 0.05, q: 2.5 });
    }
  };

  /* ── 컨페티 ── */
  var cvs = null, cctx = null, parts = [], rafId = 0;
  var COLORS = ['#ff5a52', '#ffb02e', '#2ee06f', '#4da3ff', '#c792ea', '#ff9046', '#ffd23e'];
  function ensureCanvas() {
    if (cvs) return;
    cvs = document.createElement('canvas');
    cvs.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999';
    document.body.appendChild(cvs);
  }
  function burst(xr, yr, n) {
    ensureCanvas();
    var W = cvs.width = innerWidth, H = cvs.height = innerHeight;
    var x = W * (xr != null ? xr : 0.5), y = H * (yr != null ? yr : 0.32);
    for (var i = 0; i < (n || 90); i++) {
      var a = Math.random() * Math.PI * 2, sp = 3 + Math.random() * 8.5;
      parts.push({
        x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 4.5,
        w: 5 + Math.random() * 6, h: 3 + Math.random() * 4,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        col: COLORS[(Math.random() * COLORS.length) | 0], life: 90 + Math.random() * 50
      });
    }
    if (!rafId) rafId = requestAnimationFrame(step);
  }
  function step() {
    cctx = cctx || cvs.getContext('2d');
    if (cvs.width !== innerWidth) cvs.width = innerWidth;
    if (cvs.height !== innerHeight) cvs.height = innerHeight;
    cctx.clearRect(0, 0, cvs.width, cvs.height);
    parts = parts.filter(function (p) { return p.life > 0 && p.y < cvs.height + 30; });
    parts.forEach(function (p) {
      p.vy += 0.22; p.vx *= 0.988; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      cctx.save();
      cctx.translate(p.x, p.y); cctx.rotate(p.rot);
      cctx.globalAlpha = Math.min(1, p.life / 40);
      cctx.fillStyle = p.col;
      cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cctx.restore();
    });
    if (parts.length) rafId = requestAnimationFrame(step);
    else { rafId = 0; cctx.clearRect(0, 0, cvs.width, cvs.height); }
  }

  /* ── 성공/실패 (디바운스 — 배지 깜빡임 중복 방지) ── */
  var lastFx = 0;
  function guarded(fn) {
    return function () {
      var now = Date.now();
      if (now - lastFx < 400) return;
      lastFx = now;
      fn.apply(null, arguments);
    };
  }
  var success = guarded(function (xr, yr) { sounds.success(); sounds.cheer(); burst(xr, yr); });
  var fail = guarded(function () { sounds.fail(); });

  /* ── 배지 자동 감지 (.badge 클래스 전환 → 카테고리 매핑) ──
     시뮬마다 성공/실패 클래스 어휘가 달라 기본 사전 + CtmFX.badgeMap() 오버라이드 지원 */
  var MAP = {
    success: ['in', 'same', 'ok', 'good', 'go', 'gold', 'best', 'win'],
    fail:    ['out', 'fall', 'bad', 'fail', 'crash', 'no', 'stuck'],
    pop:     []
  };
  var FANFARE_RE = /만점|클리어|미션 (완료|성공)|완주|정복|전부|박사|최고야/;
  function category(cl) {
    for (var k in MAP) for (var i = 0; i < MAP[k].length; i++)
      if (cl.contains(MAP[k][i])) return k;
    return null;
  }
  function wasCat(oldCls) {
    var toks = (oldCls || '').split(/\s+/);
    for (var k in MAP) for (var i = 0; i < MAP[k].length; i++)
      if (toks.indexOf(MAP[k][i]) >= 0) return k;
    return null;
  }
  var mo = new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      var el = muts[i].target;
      if (!el.classList || !el.classList.contains('badge')) continue;
      var now = category(el.classList), was = wasCat(muts[i].oldValue);
      if (now === was || !now) continue;
      if (now === 'success') {
        if (FANFARE_RE.test(el.textContent)) { sounds.fanfare(); sounds.cheer(); burst(0.3); burst(0.7); lastFx = Date.now(); }
        else success();
      }
      else if (now === 'fail') fail();
      else if (now === 'pop') sounds.pop();
    }
  });
  function watchBadges() {
    document.querySelectorAll('.badge').forEach(function (el) {
      mo.observe(el, { attributes: true, attributeFilter: ['class'], attributeOldValue: true });
    });
  }

  /* ── 버튼 클릭음 (위임) ── */
  document.addEventListener('pointerdown', function (e) {
    if (!e.target.closest) return;
    var b = e.target.closest('button');
    if (!b) return;
    if (b.classList.contains('primary')) sounds.launch();   // 주 실행(발사) 버튼
    else sounds.click();
  }, { passive: true });

  /* ── 음소거 토글 ── */
  function makeMuteBtn() {
    var b = document.createElement('button');
    b.id = 'ctmfxMute';
    b.title = '효과음 켜기/끄기';
    b.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:9998;width:38px;height:38px;' +
      'border-radius:50%;border:1px solid rgba(120,150,200,.35);background:rgba(10,16,28,.8);' +
      'color:#e8eef7;font-size:17px;cursor:pointer;backdrop-filter:blur(4px);line-height:1;padding:0';
    function paint() { b.textContent = muted ? '🔇' : '🔊'; b.style.opacity = muted ? 0.55 : 1; }
    b.onclick = function () {
      muted = !muted;
      try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (e) {}
      paint();
      if (!muted) sounds.pop();
    };
    paint();
    document.body.appendChild(b);
  }

  /* ── 결과표 크게 보기 (수업 발표용) ──
     자체 확대(cursor:zoom-in)가 없는 모든 표에 클릭 확대를 붙인다.
     열려 있는 동안 0.5초마다 원본을 다시 복제 → 자동 실험이 큰 화면에서 라이브로 채워진다. */
  var tblOv = null, tblBox = null, tblTitle = null, tblSrc = null, tblTimer = 0;
  function ensureTblOv() {
    if (tblOv) return;
    tblOv = document.createElement('div');
    tblOv.id = 'ctmfxTblOv';
    tblOv.style.cssText = 'display:none;position:fixed;inset:0;z-index:9997;background:rgba(4,8,16,.92);' +
      'backdrop-filter:blur(3px);flex-direction:column;align-items:center;justify-content:center;' +
      'cursor:zoom-out;padding:3vh 3vw;gap:14px';
    tblTitle = document.createElement('div');
    tblTitle.style.cssText = 'font-size:clamp(18px,2.6vw,28px);font-weight:800;color:#e8eef7;text-align:center';
    tblBox = document.createElement('div');
    tblBox.style.cssText = 'overflow:auto;max-width:94vw;max-height:80vh';
    var hint = document.createElement('div');
    hint.textContent = '화면을 클릭하면 닫힙니다';
    hint.style.cssText = 'font-size:13px;color:#8b98ad';
    tblOv.appendChild(tblTitle); tblOv.appendChild(tblBox); tblOv.appendChild(hint);
    tblOv.addEventListener('click', closeTblOv);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeTblOv(); });
    document.body.appendChild(tblOv);
  }
  function tblHeading(t) {
    // 표 직전의 h3/summary 제목을 오버레이 타이틀로
    var el = t.previousElementSibling, hops = 0;
    while (el && hops++ < 4) {
      if (/^(H[1-4]|SUMMARY)$/.test(el.tagName)) return el.textContent.trim();
      el = el.previousElementSibling;
    }
    var d = t.closest('details');
    if (d) { var s = d.querySelector('summary'); if (s) return s.textContent.trim(); }
    return '📋 결과표';
  }
  function renderTblOv() {
    if (!tblSrc || !document.contains(tblSrc)) { closeTblOv(); return; }
    var clone = tblSrc.cloneNode(true);
    clone.removeAttribute('id');
    clone.style.cursor = 'default';
    var w = tblSrc.offsetWidth || 300, h = tblSrc.offsetHeight || 150;
    // 원본 픽셀 크기로 고정 — width:100% 표가 오버레이 폭 기준으로 다시 늘어나 깨지는 것 방지
    clone.style.width = w + 'px';
    clone.style.height = h + 'px';
    clone.style.maxWidth = 'none';
    var k = Math.min(innerWidth * 0.92 / w, innerHeight * 0.76 / h, 3);
    if (k < 1) k = 1;
    clone.style.transform = 'scale(' + k + ')';
    clone.style.transformOrigin = 'top left';
    var wrap = document.createElement('div');
    wrap.style.cssText = 'width:' + (w * k) + 'px;height:' + (h * k) + 'px';
    wrap.appendChild(clone);
    tblBox.innerHTML = '';
    tblBox.appendChild(wrap);
  }
  function openTblOv(t) {
    ensureTblOv();
    tblSrc = t;
    tblTitle.textContent = tblHeading(t);
    renderTblOv();
    tblOv.style.display = 'flex';
    clearInterval(tblTimer);
    tblTimer = setInterval(renderTblOv, 500);
  }
  function closeTblOv() {
    if (!tblOv) return;
    tblOv.style.display = 'none';
    tblSrc = null;
    clearInterval(tblTimer);
  }
  function tagTables() {
    document.querySelectorAll('table').forEach(function (t) {
      if (t.dataset.ctmzoom) return;
      if (t.closest('#ctmfxTblOv')) return;
      if (t.closest('#theory, .theory-box')) return;                      // 원리 탭은 이미 큰 화면
      if (getComputedStyle(t).cursor === 'zoom-in') { t.dataset.ctmzoom = 'self'; return; }  // 자체 확대 보유
      t.dataset.ctmzoom = '1';
      t.style.cursor = 'zoom-in';
      t.title = '클릭하면 크게 보기';
    });
  }
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var t = e.target.closest('table[data-ctmzoom="1"]');
    if (t) openTblOv(t);
  });

  function init() { watchBadges(); makeMuteBtn(); tagTables(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* ── 공개 API ── */
  window.CtmFX = {
    success: success,
    fail: fail,
    launch: function () { sounds.launch(); },
    tick: function () { sounds.tick(); },
    pop: function () { sounds.pop(); },
    click: function () { sounds.click(); },
    cheer: function () { sounds.cheer(); },
    fanfare: guarded(function () { sounds.fanfare(); sounds.cheer(); burst(0.3); burst(0.7); }),
    confetti: function (xr, yr, n) { burst(xr, yr, n); },
    rewatch: function () { watchBadges(); tagTables(); },   // 배지·표를 동적 생성하는 시뮬용
    badgeMap: function (m) {        // 시뮬별 클래스 어휘 오버라이드 (지정 키만 교체)
      for (var k in m) if (MAP[k]) MAP[k] = m[k];
    },
    get muted() { return muted; }
  };
})();
