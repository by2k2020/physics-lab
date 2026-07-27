/* ═══════════════════════════════════════════════════════════════
   CTM-3D — 가상실험실 공용 three.js 키트
   free-throw · ski-slope에서 검증된 패턴 추출.
   사용: <script type="module"> import * as THREE from 'three';
        import { makeRenderer, ... } from '../vendor/ctm-3d.js';
   ═══════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';

export const DPR = Math.min(window.devicePixelRatio || 1, 2);

/* ── 렌더러 ── */
export function makeRenderer(cv) {
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
  r.setPixelRatio(DPR);
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.outputColorSpace = THREE.SRGBColorSpace;
  return r;
}

/* 스테이지 크기에 맞춰 렌더러·카메라 갱신 (매 프레임 호출해도 저렴) */
export function fitStage(renderer, camera, stage) {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return false;
  const cv = renderer.domElement;
  if (cv.width !== Math.round(w * DPR) || cv.height !== Math.round(h * DPR)) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  return true;
}

/* ── 씬 + 하늘 ── */
export const SKY = {
  day:    { bg: 0x8fc0ec, fog: 0xaacdec, fogNear: 60, fogFar: 400 },   // 맑은 낮 (스키슬로프)
  sunset: { bg: 0xd98a5c, fog: 0xc98a66, fogNear: 50, fogFar: 300 },
  night:  { bg: 0x151c2c, fog: 0x151c2c, fogNear: 12, fogFar: 60 },    // 실내/밤 (자유투)
  indoor: { bg: 0x1a2234, fog: 0x1a2234, fogNear: 14, fogFar: 70 },
};
export function makeScene(kind = 'day', fogNear, fogFar) {
  const k = SKY[kind] || SKY.day;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(k.bg);
  scene.fog = new THREE.Fog(k.fog, fogNear != null ? fogNear : k.fogNear, fogFar != null ? fogFar : k.fogFar);
  return scene;
}

/* ── 조명 (한낮 태양 + 하늘 반사) ── */
export function stdLights(scene, opts = {}) {
  const dark = opts.dark;
  scene.add(new THREE.HemisphereLight(dark ? 0xcfe0ff : 0xdfeeff, dark ? 0x2a3550 : 0x9aa7b8, dark ? 0.85 : 0.9));
  scene.add(new THREE.AmbientLight(0xffffff, dark ? 0.28 : 0.35));
  const sun = new THREE.DirectionalLight(dark ? 0xfff2d8 : 0xfff4e0, dark ? 1.5 : 1.7);
  sun.position.set(...(opts.pos || [-4, 8, 5]));
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const s = opts.shadowArea || 10;
  sun.shadow.camera.left = -s; sun.shadow.camera.right = s;
  sun.shadow.camera.top = s; sun.shadow.camera.bottom = -s;
  scene.add(sun);
  return sun;
}

/* ── 카메라 + 컨트롤 ── */
export function makeCamera(cv, opts = {}) {
  const camera = new THREE.PerspectiveCamera(opts.fov || 46, 2, 0.05, opts.far || 800);
  const controls = new OrbitControls(camera, cv);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.minDistance = opts.minD || 1.5;
  controls.maxDistance = opts.maxD || 60;
  return { camera, controls };
}
/* 카메라 프리셋 버튼 배선: presets = { btnId: {pos:[x,y,z], target:[x,y,z]} } */
export function camPresets(camera, controls, presets, defKey) {
  const btns = {};
  const apply = key => {
    const p = presets[key];
    if (!p) return;
    camera.position.set(...p.pos);
    controls.target.set(...p.target);
    controls.update();
    Object.values(btns).forEach(b => b.classList.remove('on'));
    if (btns[key]) btns[key].classList.add('on');
  };
  for (const key in presets) {
    const b = document.getElementById(key);
    if (!b) continue;
    btns[key] = b;
    b.addEventListener('click', () => apply(key));
  }
  if (defKey) apply(defKey);
  return apply;
}

/* ── 캔버스 텍스처 헬퍼 ── */
export function canvasTex(w, h, draw, repeat) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(repeat[0], repeat[1]); }
  return tex;
}

/* ── 텍스트 스프라이트 (자유투 검증판) ── */
export function textSprite(text, opts = {}) {
  const size = opts.size || 42, color = opts.color || '#ffffff';
  const cv = document.createElement('canvas'), c = cv.getContext('2d');
  c.font = `bold ${size}px 'Malgun Gothic', sans-serif`;
  const w = Math.ceil(c.measureText(text).width) + 24, h = size + 22;
  cv.width = w; cv.height = h;
  c.font = `bold ${size}px 'Malgun Gothic', sans-serif`;
  c.textAlign = 'center'; c.textBaseline = 'middle';
  if (opts.bg) { c.fillStyle = opts.bg; c.beginPath(); c.roundRect(0, 0, w, h, 12); c.fill(); }
  c.fillStyle = color; c.fillText(text, w / 2, h / 2 + 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const k = opts.scale || 0.0045;
  if (opts.plane) {
    return new THREE.Mesh(new THREE.PlaneGeometry(w * k, h * k),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: opts.double ? THREE.DoubleSide : THREE.FrontSide }));
  }
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sp.scale.set(w * k, h * k, 1);
  return sp;
}

/* ── 잔디 대지 (야외 기본 바닥) ── */
export function grassGround(scene, opts = {}) {
  const size = opts.size || 60;
  const tex = canvasTex(256, 256, (c) => {
    c.fillStyle = opts.base || '#79a852'; c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      const x = (i * 97) % 256, y = (i * 61 + ((i * i) % 13)) % 256;
      c.fillStyle = ['#6d9c49', '#84b25c', '#719f4e', '#8bba63'][i % 4];
      c.fillRect(x, y, 2, 3);
    }
  }, [size / 6, size / 6]);
  const g = new THREE.Mesh(new THREE.BoxGeometry(size, 0.2, size),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
  g.position.set(opts.x || 0, -0.1, opts.z || 0);
  g.receiveShadow = true;
  scene.add(g);
  return g;
}

/* ── 흙길 스트립 (주행 코스) ── */
export function dirtTrack(scene, opts = {}) {
  const len = opts.len || 20, w = opts.w || 2.2;
  const tex = canvasTex(512, 128, (c) => {
    c.fillStyle = opts.base || '#b39268'; c.fillRect(0, 0, 512, 128);
    for (let i = 0; i < 320; i++) {
      const x = (i * 131) % 512, y = (i * 47) % 128;
      c.fillStyle = ['#a5865c', '#bd9c72', '#99794f', '#c4a67e'][i % 4];
      c.beginPath(); c.arc(x, y, 1.5 + (i % 3), 0, 7); c.fill();
    }
  }, [len / 4, 1]);
  const t = new THREE.Mesh(new THREE.BoxGeometry(len, 0.22, w),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }));
  t.position.set(opts.x != null ? opts.x : len / 2 - 2, -0.09, opts.z || 0);
  t.receiveShadow = true;
  scene.add(t);
  return t;
}

/* ── 거리 눈금 (기둥 + 숫자, x축 방향) ── */
export function distanceRuler(scene, opts = {}) {
  const from = opts.from || 0, to = opts.to || 8, step = opts.step || 1;
  const z = opts.z != null ? opts.z : -1.4, y = opts.y || 0;
  const toX = opts.toX || (d => d);
  const unit = opts.unit || '';
  for (let d = from; d <= to + 1e-9; d += step) {
    const x = toX(d);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.03),
      new THREE.MeshStandardMaterial({ color: opts.postCol || 0x5b6c8c }));
    post.position.set(x, y + 0.07, z); scene.add(post);
    const lab = textSprite((Math.round(d * 10) / 10) + unit, { size: 34, color: opts.labCol || '#ffffff', scale: 0.004, bg: 'rgba(8,12,22,.55)' });
    lab.position.set(x, y + 0.26, z); scene.add(lab);
  }
}

/* ── 레고풍 자동차 — {group, wheels[], body} · 바퀴 회전은 wheels.forEach(w=>w.rotation.z -= dist/r) ── */
export function makeCar(opts = {}) {
  const bodyCol = opts.body || 0x2e6fe0, roofCol = opts.roof || 0x9fc4ff, dark = 0x18233c;
  const gp = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.45 });
  const L = opts.len || 0.62, W = opts.wid || 0.34, H = opts.hgt || 0.16;
  const body = new THREE.Mesh(new THREE.BoxGeometry(L, H, W), bodyMat);
  body.position.y = 0.16; body.castShadow = true; gp.add(body);
  // 스터드
  const studMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.4 });
  for (let i = -1; i <= 1; i++) {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 12), studMat);
    st.position.set(i * L * 0.28, 0.16 + H / 2 + 0.015, 0); gp.add(st);
  }
  // 캐빈 (앞유리 느낌)
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(L * 0.42, 0.13, W * 0.82),
    new THREE.MeshStandardMaterial({ color: roofCol, roughness: 0.2, metalness: 0.1 }));
  cabin.position.set(-L * 0.12, 0.16 + H / 2 + 0.075, 0); cabin.castShadow = true; gp.add(cabin);
  // 바퀴 4개 (+휠캡)
  const wheels = [];
  const wR = opts.wheelR || 0.11;
  const tyreMat = new THREE.MeshStandardMaterial({ color: 0x20242c, roughness: 0.85 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0xaab4c8, roughness: 0.35 });
  [[-L * 0.32, W / 2 + 0.03], [L * 0.32, W / 2 + 0.03], [-L * 0.32, -W / 2 - 0.03], [L * 0.32, -W / 2 - 0.03]].forEach(([x, z]) => {
    const w = new THREE.Group();
    const tyre = new THREE.Mesh(new THREE.CylinderGeometry(wR, wR, 0.06, 20), tyreMat);
    tyre.rotation.x = Math.PI / 2; tyre.castShadow = true; w.add(tyre);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(wR * 0.55, wR * 0.55, 0.062, 12), capMat);
    cap.rotation.x = Math.PI / 2; w.add(cap);
    // 휠 마커(회전 확인용)
    const mk = new THREE.Mesh(new THREE.BoxGeometry(wR * 0.7, 0.012, 0.064), new THREE.MeshBasicMaterial({ color: 0xffd23e }));
    w.add(mk);
    w.position.set(x, wR, z);
    gp.add(w); wheels.push(w);
  });
  gp.userData = { wheels, wheelR: wR, body };
  return gp;
}

/* ── 레고 미니피겨 (자유투 슈터 간이판) — {group, body(상체), arms} ── */
export function makeMinifig(opts = {}) {
  const shirtCol = opts.shirt || 0xff8a3d, pantsCol = opts.pants || 0x22304c;
  const gp = new THREE.Group();
  const shirt = new THREE.MeshStandardMaterial({ color: shirtCol, roughness: 0.5 });
  const pants = new THREE.MeshStandardMaterial({ color: pantsCol, roughness: 0.6 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xffd23e, roughness: 0.5 });
  // 다리
  const legs = new THREE.Group(); gp.add(legs);
  [-0.07, 0.07].forEach(z => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.24, 0.095), pants);
    leg.position.set(0, 0.12, z); leg.castShadow = true; legs.add(leg);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.05, 0.095), pants);
    foot.position.set(0.02, 0.025, z); legs.add(foot);
  });
  // 상체
  const body = new THREE.Group(); body.position.y = 0.24; gp.add(body);
  const hip = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.07, 0.19), pants);
  hip.position.y = 0.035; body.add(hip);
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.1, 0.24, 4, 1), shirt);
  torso.rotation.y = Math.PI / 4; torso.scale.z = 0.74; torso.position.y = 0.19; torso.castShadow = true; body.add(torso);
  // 머리 + 얼굴
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.1, 20), skin);
  head.position.y = 0.38; head.castShadow = true; body.add(head);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
  [-0.026, 0.026].forEach(z => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), eyeMat);
    e.position.set(0.055, 0.395, z); body.add(e);
  });
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.021, 0.005, 6, 12, Math.PI * 0.8), eyeMat);
  smile.position.set(0.055, 0.365, 0); smile.rotation.y = Math.PI / 2; smile.rotation.z = Math.PI + 0.35; body.add(smile);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({ color: opts.hair || 0x2e2018, roughness: 0.8 }));
  hair.position.y = 0.43; body.add(hair);
  // 양팔 (어깨 그룹 — 회전 애니메이션용)
  const arms = new THREE.Group(); arms.position.y = 0.3; body.add(arms);
  [-0.13, 0.13].forEach(z => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.2, 0.055), shirt);
    arm.position.set(0, -0.07, z); arm.castShadow = true; arms.add(arm);
    const hand = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.03, 10), skin);
    hand.rotation.x = Math.PI / 2; hand.position.set(0, -0.18, z); arms.add(hand);
  });
  gp.userData = { body, arms, legs };
  return gp;
}

/* ── 소품: 나무 · 구름 · 바위 ── */
export function makeTree(scale = 1) {
  const gp = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * scale, 0.08 * scale, 0.5 * scale, 8),
    new THREE.MeshStandardMaterial({ color: 0x6b4a2c, roughness: 0.9 }));
  trunk.position.y = 0.25 * scale; trunk.castShadow = true; gp.add(trunk);
  [0.62, 0.95, 1.24].forEach((y, i) => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry((0.42 - i * 0.1) * scale, 0.5 * scale, 10),
      new THREE.MeshStandardMaterial({ color: [0x2f7a3a, 0x35863f, 0x3d9448][i], roughness: 0.85 }));
    cone.position.y = y * scale; cone.castShadow = true; gp.add(cone);
  });
  return gp;
}
export function makeCloud(scale = 1) {
  const gp = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.92 });
  [[0, 0, 0, 0.5], [0.45, 0.08, 0.1, 0.36], [-0.42, 0.05, -0.08, 0.4], [0.1, 0.16, -0.12, 0.3]].forEach(([x, y, z, r]) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(r * scale, 10, 8), mat);
    s.position.set(x * scale, y * scale, z * scale); gp.add(s);
  });
  return gp;
}
export function makeRock(scale = 1) {
  const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16 * scale, 0),
    new THREE.MeshStandardMaterial({ color: 0x8b8f98, roughness: 0.9 }));
  r.position.y = 0.1 * scale; r.castShadow = true;
  return r;
}

/* ── 목표 깃발 ── */
export function makeFlag(text, color = 0x2ee06f) {
  const gp = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.9, 8),
    new THREE.MeshStandardMaterial({ color: 0xaab4c8, roughness: 0.4 }));
  pole.position.y = 0.45; pole.castShadow = true; gp.add(pole);
  const flag = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.02),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6 }));
  flag.position.set(0.16, 0.78, 0); gp.add(flag);
  if (text) {
    const lab = textSprite(text, { size: 36, color: '#ffffff', bg: 'rgba(8,12,22,.7)', scale: 0.004 });
    lab.position.set(0, 1.05, 0); gp.add(lab);
  }
  return gp;
}
