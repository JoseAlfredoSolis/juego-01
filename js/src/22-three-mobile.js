// ── Mobile 3D renderer (Three.js) — main menu, kart menus, 3D race ─────────
const THREE_KART_MENU_SCENES = ['kartmenu', 'kartselect', 'kartlobby', 'kartcup'];
const THREE_MAIN_MENU_SCENES = ['menu'];
const THREE_RACE_SCENES = ['kart'];
const THREE_GAMEPLAY_SCENES = ['gameplay'];
const THREE_GP_SCALE = 0.045;

const threeTexCache = {};

function threeCanUse() {
  return typeof THREE !== 'undefined';
}

function gameView3dEnabled() {
  if (!threeCanUse() || gs.viewMode !== '3d') return false;
  // 3D en vertical móvil dejaba la pista invisible (solo HUD) — forzar 2D al jugar.
  if (typeof mobTouchPortrait === 'function' && mobTouchPortrait()) return false;
  return true;
}

function gameViewModeLabel() {
  return gameView3dEnabled() ? '3D' : '2D';
}

function threeDisable() {
  if (!threeCtx) return;
  threeCtx.mode = null;
  threeCtx.el.style.display = 'none';
  document.body.classList.remove('three-on', 'three-menu', 'three-race', 'three-gameplay', 'three-main-menu', 'three-play');
}

function threeMobileCanUse() {
  return threeCanUse();
}

function threeTrackScale(tr) {
  const b = kartTrackBounds(tr);
  const span = Math.max(b.maxX - b.minX, b.maxY - b.minY, 1);
  const tcx = (b.minX + b.maxX) / 2;
  const tcy = (b.minY + b.maxY) / 2;
  return { sc: 92 / span, tcx, tcy };
}

function threeGameToWorld(gx, gy, y, tr) {
  const { sc, tcx, tcy } = threeTrackScale(tr);
  return {
    x: (gx - tcx) * sc,
    y: (y || 0) * 0.045,
    z: (gy - tcy) * sc,
  };
}

function threeHexColor(c) {
  if (!c) return 0xffffff;
  if (typeof c === 'number') return c;
  const s = String(c).replace('#', '');
  return parseInt(s.length === 3
    ? s.split('').map(ch => ch + ch).join('')
    : s.slice(0, 6), 16);
}

function threeProcTex(key, w, h, drawFn, repeat) {
  if (threeTexCache[key]) return threeTexCache[key];
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  drawFn(g, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  if (repeat) tex.repeat.set(repeat[0], repeat[1]);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  threeTexCache[key] = tex;
  return tex;
}

function threeTexAsphalt() {
  return threeProcTex('asphalt', 128, 128, (g, w, h) => {
    g.fillStyle = '#4a4e56';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) {
      g.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`;
      g.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
    g.strokeStyle = 'rgba(255,255,255,0.35)';
    g.lineWidth = 2;
    g.setLineDash([10, 14]);
    g.beginPath();
    g.moveTo(w / 2, 0); g.lineTo(w / 2, h);
    g.stroke();
  }, [8, 8]);
}

function threeTexGrass(col) {
  const hex = '#' + threeHexColor(col).toString(16).padStart(6, '0');
  return threeProcTex('grass_' + hex, 128, 128, (g, w, h) => {
    g.fillStyle = hex;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 500; i++) {
      const v = 20 + Math.random() * 30;
      g.fillStyle = `rgba(${v},${80 + Math.random() * 40},${v},0.35)`;
      g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
  }, [12, 12]);
}

function threeTexKerb() {
  return threeProcTex('kerb', 64, 64, (g, w, h) => {
    const sz = 16;
    for (let y = 0; y < h; y += sz) {
      for (let x = 0; x < w; x += sz) {
        g.fillStyle = ((x / sz + y / sz) % 2) ? '#f0f0f0' : '#e03030';
        g.fillRect(x, y, sz, sz);
      }
    }
  }, [4, 1]);
}

function threeTexMetal() {
  return threeProcTex('metal', 64, 64, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, '#8898b0');
    grd.addColorStop(0.5, '#c8d4e8');
    grd.addColorStop(1, '#6a7a90');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
  }, [2, 2]);
}

function threeTexChecker() {
  return threeProcTex('checker', 64, 64, (g, w, h) => {
    const sz = 8;
    for (let y = 0; y < h; y += sz) {
      for (let x = 0; x < w; x += sz) {
        g.fillStyle = ((x / sz + y / sz) % 2) ? '#2a3860' : '#1a2848';
        g.fillRect(x, y, sz, sz);
      }
    }
  }, [6, 6]);
}

function threeTexSky(top, bottom) {
  const key = 'sky_' + top + '_' + bottom;
  return threeProcTex(key, 4, 256, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, top);
    grd.addColorStop(1, bottom);
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
  }, [1, 1]);
}

function threeEnhanceRenderer(renderer) {
  if (renderer.toneMapping !== undefined) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
  }
}

function threeAddSkyDome(scene, topHex, bottomHex) {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(260, 40, 24),
    new THREE.MeshBasicMaterial({
      map: threeTexSky('#' + threeHexColor(topHex).toString(16).padStart(6, '0'),
        '#' + threeHexColor(bottomHex).toString(16).padStart(6, '0')),
      side: THREE.BackSide,
    })
  );
  scene.add(sky);
  return sky;
}

function threeAddStarfield(scene, count, spread) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = spread * (0.4 + Math.random() * 0.6);
    const y = 8 + Math.random() * spread * 0.8;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(a) * r;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.35, transparent: true, opacity: 0.75, depthWrite: false,
  }));
  scene.add(stars);
  return stars;
}

function threeEnsure() {
  if (threeCtx) return threeCtx;
  const el = document.getElementById('three-c');
  if (!el || typeof THREE === 'undefined') return null;
  try {
  const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (renderer.outputColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;
  threeEnhanceRenderer(renderer);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a1420, 40, 220);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 500);
  threeCtx = {
    el, renderer, scene, camera,
    mode: null, menuVariant: null,
    trackGroup: null, kartMeshes: [],
    menuGroup: null, decorGroup: null,
    menuT: 0, lights: [],
    resize: () => {
      const w = el.clientWidth || window.innerWidth;
      const h = el.clientHeight || window.innerHeight;
      if (w < 2 || h < 2) return;
      renderer.setSize(w, h, false);
      const activeCam = threeCtx.camera;
      if (activeCam?.isOrthographicCamera) {
        const viewH = threeCtx.gpViewH || 36;
        const aspect = w / h;
        const viewW = viewH * aspect;
        activeCam.left = -viewW / 2;
        activeCam.right = viewW / 2;
        activeCam.top = viewH / 2;
        activeCam.bottom = -viewH / 2;
        activeCam.updateProjectionMatrix();
      } else if (activeCam) {
        activeCam.aspect = w / h;
        activeCam.updateProjectionMatrix();
      }
    },
  };
  threeCtx.resize();
  return threeCtx;
  } catch (_) {
    return null;
  }
}

function threeClearGroup(g) {
  if (!g) return;
  while (g.children.length) {
    const ch = g.children[0];
    g.remove(ch);
    ch.traverse?.(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
  }
}

function threeClearScene(ctx) {
  threeClearGroup(ctx.scene);
  ctx.menuGroup = null;
  ctx.decorGroup = null;
  ctx.trackGroup = null;
  ctx.gameGroup = null;
  ctx.playerMesh = null;
  ctx.entityGroup = null;
  ctx.itemMeshes = [];
  ctx.enemyMeshes = [];
  ctx.kartMeshes = [];
  ctx._itemsRef = null;
  ctx._enemiesRef = null;
  ctx.gpCamFocus = null;
}

function threeRestorePerspectiveCamera(ctx) {
  if (!ctx._perspCam) return;
  ctx.camera = ctx._perspCam;
  ctx.gpCamOrtho = false;
  ctx.gpCamFocus = null;
  ctx.resize();
}

function threeSetupGameplayCamera(ctx) {
  if (!ctx._perspCam) ctx._perspCam = ctx.camera;
  if (ctx.gpCamOrtho) {
    ctx.camera = ctx._perspCam;
    ctx.gpCamOrtho = false;
  }
  ctx.gpCamFocus = null;
  ctx.camera.fov = 50;
  ctx.camera.near = 0.1;
  ctx.camera.far = 400;
  ctx.resize();
}

function threeAddLights(scene, warm) {
  const hemi = new THREE.HemisphereLight(
    warm ? 0x88c8ff : 0x9ab8e8,
    warm ? 0x3a6838 : 0x2a3048,
    0.55
  );
  const amb = new THREE.AmbientLight(warm ? 0x608050 : 0x6070a0, 0.42);
  const sun = new THREE.DirectionalLight(warm ? 0xfff0c8 : 0xfff4d0, 1.35);
  sun.position.set(40, 90, 35);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
  sun.shadow.camera.near = 5;
  sun.shadow.camera.far = 200;
  sun.shadow.camera.left = -70;
  sun.shadow.camera.right = 70;
  sun.shadow.camera.top = 70;
  sun.shadow.camera.bottom = -70;
  sun.shadow.bias = -0.0008;
  const rim = new THREE.DirectionalLight(warm ? 0xa0d080 : 0x80b0ff, 0.45);
  rim.position.set(-35, 25, -45);
  scene.add(hemi, amb, sun, rim);
  return [hemi, amb, sun, rim];
}

function threeMkWheel() {
  const geo = new THREE.CylinderGeometry(0.55, 0.55, 0.38, 14);
  geo.rotateZ(Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, metalness: 0.15, roughness: 0.9,
    map: threeTexMetal(),
  });
  return new THREE.Mesh(geo, mat);
}

function threeMkKartMesh(color, name) {
  const g = new THREE.Group();
  const col = threeHexColor(color);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: col, metalness: 0.55, roughness: 0.28,
    emissive: col, emissiveIntensity: 0.06,
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.25, 2.35), bodyMat);
  body.position.y = 1.12;
  body.castShadow = true;
  g.add(body);
  const nose = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.7, 2.1),
    bodyMat
  );
  nose.position.set(2.7, 1.0, 0);
  nose.castShadow = true;
  g.add(nose);
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.85, 1.55),
    new THREE.MeshStandardMaterial({ color: 0x141c28, metalness: 0.6, roughness: 0.35 })
  );
  cabin.position.set(-0.2, 1.82, 0);
  cabin.castShadow = true;
  g.add(cabin);
  const wing = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.65, 2.9),
    bodyMat
  );
  wing.position.set(-2.25, 1.5, 0);
  g.add(wing);
  for (const side of [-1, 1]) {
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffcc, emissive: 0xffaa44, emissiveIntensity: 0.8 })
    );
    lamp.position.set(2.95, 1.05, side * 0.75);
    g.add(lamp);
  }
  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 10, 10),
    new THREE.MeshStandardMaterial({ color: col, metalness: 0.3, roughness: 0.5 })
  );
  helmet.position.set(0.1, 2.35, 0);
  g.add(helmet);
  const wheelMeshes = [];
  const wheelPos = [[1.55, 0.52, 1.08], [1.55, 0.52, -1.08], [-1.4, 0.52, 1.08], [-1.4, 0.52, -1.08]];
  for (const [x, y, z] of wheelPos) {
    const w = threeMkWheel();
    w.position.set(x, y, z);
    w.castShadow = true;
    g.add(w);
    wheelMeshes.push(w);
  }
  g.userData.wheels = wheelMeshes;
  const exhaust = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 0.2, transparent: true, opacity: 0.7 })
  );
  exhaust.position.set(-2.5, 1.0, 0);
  exhaust.visible = false;
  g.add(exhaust);
  g.userData.exhaust = exhaust;
  if (name) g.userData.name = name;
  return g;
}

function threeMkTree(x, z, scale) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35 * scale, 0.5 * scale, 2.5 * scale, 8),
    new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 1 })
  );
  trunk.position.y = 1.25 * scale;
  trunk.castShadow = true;
  g.add(trunk);
  for (let i = 0; i < 3; i++) {
    const leaves = new THREE.Mesh(
      new THREE.ConeGeometry((1.8 - i * 0.35) * scale, (2.6 - i * 0.3) * scale, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e6828 + i * 0x081008, roughness: 0.88 })
    );
    leaves.position.y = (3.2 + i * 1.5) * scale;
    leaves.castShadow = true;
    g.add(leaves);
  }
  g.position.set(x, 0, z);
  return g;
}

function threeMkBear(color) {
  const g = new THREE.Group();
  const col = threeHexColor(color || '#c87830');
  const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.85 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.8, 1.4), mat);
  body.position.y = 2.2;
  body.castShadow = true;
  g.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 1.5), mat);
  head.position.set(0, 3.8, 0.1);
  head.castShadow = true;
  g.add(head);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.35), mat);
    ear.position.set(side * 0.75, 4.55, 0);
    g.add(ear);
  }
  const snout = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.55, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x9a6040, roughness: 0.9 })
  );
  snout.position.set(0, 3.55, 0.85);
  g.add(snout);
  return g;
}

function threeAddTrackDecor(group, tr, curve) {
  const decor = tr.decor || 'palm';
  const segs = tr.huge ? 24 : 14;
  for (let i = 0; i < segs; i++) {
    const u = i / segs;
    const p = kartPathSample(tr, u);
    const tg = kartPathTangent(tr, u);
    const nx = -Math.sin(tg.angle), ny = Math.cos(tg.angle);
    const side = i % 2 ? 1 : -1;
    const off = (tr.roadWidth || 100) * threeTrackScale(tr).sc * 0.95;
    const wx = p.x + nx * off * side;
    const wy = p.y + ny * off * side;
    const w = threeGameToWorld(wx, wy, 0, tr);
    const groundY = threeTrackHeightAt(tr, wx, wy, curve);
    let mesh;
    if (decor === 'palm') {
      mesh = threeMkTree(0, 0, 0.55);
    } else if (decor === 'rock') {
      mesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.2 + Math.random() * 0.8, 0),
        new THREE.MeshStandardMaterial({ color: 0x6a6a70, roughness: 0.95 })
      );
      mesh.position.y = groundY + 0.8;
    } else if (decor === 'city') {
      const h = 3 + Math.random() * 8;
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, h, 2.5),
        new THREE.MeshStandardMaterial({
          color: 0x384058 + Math.floor(Math.random() * 0x101010),
          metalness: 0.35, roughness: 0.55,
        })
      );
      mesh.position.y = groundY + h / 2;
    } else {
      const h = 2.5;
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(8, h, 3),
        new THREE.MeshStandardMaterial({ color: 0x505868, roughness: 0.8 })
      );
      mesh.position.y = groundY + h / 2;
    }
    mesh.position.x += w.x;
    mesh.position.z += w.z;
    if (decor === 'palm') mesh.position.y = groundY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
}

function threeTrackElevation(u, tr) {
  const w1 = Math.sin(u * Math.PI * 2 * 2.2) * 2.4;
  const w2 = Math.sin(u * Math.PI * 2 * 5.1 + 1.2) * 1.0;
  const w3 = Math.cos(u * Math.PI * 2 * 3.8) * 0.65;
  const scale = tr.huge ? 1.4 : 1.05;
  return (w1 + w2 + w3) * scale;
}

function threeTrackPathPoint(p, u, tr) {
  const { sc, tcy } = threeTrackScale(tr);
  const w = threeGameToWorld(p.x, p.y, 0, tr);
  const layoutH = (tcy - p.y) * sc * 0.24;
  const elev = layoutH + threeTrackElevation(u, tr);
  return new THREE.Vector3(w.x, elev + 0.1, w.z);
}

function threeTrackHeightAt(tr, gx, gy, curve) {
  if (!curve) return 0.1;
  const near = kartNearestPath(tr, gx, gy);
  return curve.getPointAt(near.u).y;
}

function threeBuildRollingGround(tr, b, sc) {
  const gw = (b.maxX - b.minX) * sc + 55;
  const gh = (b.maxY - b.minY) * sc + 55;
  const geo = new THREE.PlaneGeometry(gw, gh, 36, 36);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const h = Math.sin(x * 0.065) * 2.2 + Math.cos(z * 0.055) * 1.6
      + Math.sin((x + z) * 0.038) * 0.9 - 1.8;
    pos.setY(i, h);
  }
  geo.computeVertexNormals();
  return geo;
}

function threeBuildPathRibbon(curve, divisions, halfWidth, yOffset) {
  const positions = [];
  const uvs = [];
  const indices = [];
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3();
  const tan = new THREE.Vector3();

  for (let i = 0; i <= divisions; i++) {
    const u = i / divisions;
    const pos = curve.getPointAt(u);
    curve.getTangentAt(u, tan).normalize();
    right.crossVectors(tan, up);
    if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
    else right.normalize();

    positions.push(
      pos.x - right.x * halfWidth, pos.y + yOffset, pos.z - right.z * halfWidth,
      pos.x + right.x * halfWidth, pos.y + yOffset, pos.z + right.z * halfWidth
    );
    const vu = u * 32;
    uvs.push(0, vu, 1, vu);
  }

  for (let i = 0; i < divisions; i++) {
    const a = i * 2;
    const b = a + 1;
    const ni = (i + 1) % (divisions + 1);
    const c = ni * 2;
    const d = ni * 2 + 1;
    indices.push(a, c, b, b, c, d);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function threeBuildKerbStrip(curve, divisions, roadHalf, kerbW, side, yOffset) {
  const positions = [];
  const uvs = [];
  const indices = [];
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3();
  const tan = new THREE.Vector3();
  const inner = roadHalf;
  const outer = roadHalf + kerbW;

  for (let i = 0; i <= divisions; i++) {
    const u = i / divisions;
    const pos = curve.getPointAt(u);
    curve.getTangentAt(u, tan).normalize();
    right.crossVectors(tan, up);
    if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
    else right.normalize();

    const inOff = side < 0 ? -inner : inner;
    const outOff = side < 0 ? -outer : outer;
    positions.push(
      pos.x + right.x * inOff, pos.y + yOffset, pos.z + right.z * inOff,
      pos.x + right.x * outOff, pos.y + yOffset, pos.z + right.z * outOff
    );
    const vu = u * 16;
    uvs.push(0, vu, 1, vu);
  }

  for (let i = 0; i < divisions; i++) {
    const a = i * 2;
    const b = a + 1;
    const ni = (i + 1) % (divisions + 1);
    const c = ni * 2;
    const d = ni * 2 + 1;
    indices.push(a, c, b, b, c, d);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function threeAddBoostPads(group, tr, curve) {
  if (!tr.boostPads?.length) return;
  const roadW = Math.max(5.4, (tr.roadWidth || 100) * threeTrackScale(tr).sc * 0.78);
  const padW = roadW * 0.52;
  const accent = threeHexColor(tr.accent || '#00d4ff');
  for (const pad of tr.boostPads) {
    const p = kartPathSample(tr, pad.u);
    const tg = kartPathTangent(tr, pad.u);
    const w = threeGameToWorld(p.x, p.y, 0, tr);
    const h = threeTrackHeightAt(tr, p.x, p.y, curve) + 0.1;
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(padW, 0.1, 1.7),
      new THREE.MeshStandardMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 0.55,
        transparent: true,
        opacity: 0.92,
        roughness: 0.35,
        metalness: 0.25,
      })
    );
    stripe.position.set(w.x, h, w.z);
    stripe.rotation.y = -tg.angle + Math.PI / 2;
    stripe.userData.boostPad = true;
    stripe.userData.padU = pad.u;
    stripe.receiveShadow = true;
    group.add(stripe);
    const glow = new THREE.PointLight(accent, 0.5, 12);
    glow.position.set(w.x, h + 0.6, w.z);
    glow.userData.boostPad = true;
    group.add(glow);
  }
}

function threeAddJumpRamps(group, tr, curve) {
  if (!tr.jumpRamps?.length) return;
  const accent = threeHexColor(tr.accent || '#ffcc40');
  for (const ramp of tr.jumpRamps) {
    const p = kartPathSample(tr, ramp.u);
    const tg = kartPathTangent(tr, ramp.u);
    const w = threeGameToWorld(p.x, p.y, 0, tr);
    const h = threeTrackHeightAt(tr, p.x, p.y, curve) + 0.15;
    const mesh = new THREE.Mesh(
      new THREE.ConeGeometry(1.8, 1.2, 3),
      new THREE.MeshStandardMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 0.4,
        roughness: 0.5,
      })
    );
    mesh.position.set(w.x, h + 0.5, w.z);
    mesh.rotation.y = -tg.angle + Math.PI / 2;
    mesh.rotation.x = Math.PI;
    mesh.castShadow = true;
    mesh.userData.jumpRamp = true;
    group.add(mesh);
  }
}

function threeAddTrackObstacles(group, tr, curve) {
  if (!tr.obstacleSpots?.length) return;
  for (const spot of tr.obstacleSpots) {
    const p = kartPathSample(tr, spot.u);
    const w = threeGameToWorld(p.x, p.y, 0, tr);
    const h = threeTrackHeightAt(tr, p.x, p.y, curve) + 0.8;
    const isCrab = spot.kind === 'crab';
    const mesh = isCrab
      ? new THREE.Mesh(
        new THREE.SphereGeometry(1.1, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xff4040, emissive: 0x660000, emissiveIntensity: 0.35, roughness: 0.6 })
      )
      : new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.4, 0),
        new THREE.MeshStandardMaterial({ color: 0x707880, emissive: 0x222830, emissiveIntensity: 0.2, roughness: 0.85, metalness: 0.15 })
      );
    mesh.position.set(w.x, h + (isCrab ? 0.6 : 1.0), w.z);
    mesh.castShadow = true;
    mesh.userData.obstacleU = spot.u;
    mesh.userData.obstacleKind = spot.kind;
    group.add(mesh);
  }
}

function threeBuildTrackMesh(tr) {
  const group = new THREE.Group();
  const pts = [];
  const segs = tr.mega ? 280 : tr.huge ? 180 : 120;
  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    const p = kartPathSample(tr, u);
    pts.push(threeTrackPathPoint(p, u, tr));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.35);
  const roadW = Math.max(5.4, (tr.roadWidth || 100) * threeTrackScale(tr).sc * 0.78);
  const halfRoad = roadW * 0.5;
  const asphaltTex = threeTexAsphalt();

  const roadGeo = threeBuildPathRibbon(curve, segs, halfRoad, 0.08);
  const road = new THREE.Mesh(roadGeo, new THREE.MeshStandardMaterial({
    map: asphaltTex, metalness: 0.2, roughness: 0.78,
    color: threeHexColor(tr.asphalt?.[1] || '#5a5e66'),
    side: THREE.DoubleSide,
  }));
  road.receiveShadow = true;
  group.add(road);

  const kerbMat = new THREE.MeshStandardMaterial({
    map: threeTexKerb(), metalness: 0.05, roughness: 0.9, side: THREE.DoubleSide,
  });
  const kerbW = 0.62;
  group.add(new THREE.Mesh(threeBuildKerbStrip(curve, segs, halfRoad, kerbW, -1, 0.06), kerbMat));
  group.add(new THREE.Mesh(threeBuildKerbStrip(curve, segs, halfRoad, kerbW, 1, 0.06), kerbMat));

  const shoulderMat = new THREE.MeshStandardMaterial({
    map: threeTexGrass(tr.grass?.[0] || '#2a5820'),
    roughness: 1, metalness: 0, side: THREE.DoubleSide,
  });
  const shoulderW = 4.8;
  group.add(new THREE.Mesh(threeBuildKerbStrip(curve, segs, halfRoad + kerbW, shoulderW, -1, 0.02), shoulderMat));
  group.add(new THREE.Mesh(threeBuildKerbStrip(curve, segs, halfRoad + kerbW, shoulderW, 1, 0.02), shoulderMat));

  const lineGeo = threeBuildPathRibbon(curve, segs, 0.16, 0.11);
  const centerLine = new THREE.Mesh(lineGeo, new THREE.MeshStandardMaterial({
    color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.25,
    side: THREE.DoubleSide,
  }));
  group.add(centerLine);

  const st = tr.starts?.[0];
  if (st) {
    const sw = threeGameToWorld(st.x, st.y, 0, tr);
    const startH = curve.getPointAt(0).y + 2.2;
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(roadW * 0.55, 0.35, 8, 24, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xaaccff, emissiveIntensity: 0.35, metalness: 0.4 })
    );
    arch.position.set(sw.x, startH, sw.z);
    arch.rotation.y = -st.a + Math.PI / 2;
    arch.rotation.z = Math.PI / 2;
    group.add(arch);
  }

  const b = kartTrackBounds(tr);
  const sc = threeTrackScale(tr).sc;
  const ground = new THREE.Mesh(
    threeBuildRollingGround(tr, b, sc),
    new THREE.MeshStandardMaterial({
      map: threeTexGrass(tr.grass?.[0] || '#2a5820'),
      roughness: 1, metalness: 0,
    })
  );
  ground.receiveShadow = true;
  group.add(ground);

  group.userData.raceCurve = curve;

  threeAddSkyDome(group, tr.bg?.[1] || tr.bg?.[0] || '#70b8f0', tr.bg?.[0] || '#1a4080');

  threeAddTrackDecor(group, tr, curve);
  threeAddBoostPads(group, tr, curve);
  threeAddJumpRamps(group, tr, curve);
  threeAddTrackObstacles(group, tr, curve);

  for (const box of tr.items || []) {
    if (box.taken) continue;
    const w = threeGameToWorld(box.x, box.y, 0, tr);
    const itemH = threeTrackHeightAt(tr, box.x, box.y, curve) + 1.3;
    const item = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.MeshStandardMaterial({
        color: 0xff66ff, emissive: 0xaa22aa, emissiveIntensity: 0.55,
        metalness: 0.4, roughness: 0.35,
      })
    );
    item.position.set(w.x, itemH, w.z);
    item.userData.baseY = itemH;
    item.castShadow = true;
    group.add(item);
    const glow = new THREE.PointLight(0xff66ff, 0.6, 8);
    glow.position.set(w.x, itemH + 0.5, w.z);
    group.add(glow);
  }
  return group;
}

function threeAddMenuFloor(ctx, radius, texKey) {
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 64),
    new THREE.MeshStandardMaterial({
      map: texKey === 'checker' ? threeTexChecker() : threeTexMetal(),
      metalness: 0.25, roughness: 0.8, color: texKey === 'checker' ? 0x8898b0 : 0x1a2840,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  ctx.scene.add(floor);
}

function threeBuildMainMenuScene(ctx) {
  threeRestorePerspectiveCamera(ctx);
  threeClearScene(ctx);
  ctx.lights = threeAddLights(ctx.scene, true);
  ctx.scene.background = new THREE.Color(0x1a4828);
  ctx.scene.fog = new THREE.FogExp2(0x1a4828, 0.012);
  threeAddSkyDome(ctx.scene, '#5ab0e8', '#1a4828');
  ctx.starfield = threeAddStarfield(ctx.scene, 120, 55);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120),
    new THREE.MeshStandardMaterial({ map: threeTexGrass('#2a6838'), roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  ground.receiveShadow = true;
  ctx.scene.add(ground);

  const hill = new THREE.Mesh(
    new THREE.SphereGeometry(22, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2.2),
    new THREE.MeshStandardMaterial({ map: threeTexGrass('#3a8848'), roughness: 1 })
  );
  hill.position.y = -2;
  ctx.scene.add(hill);

  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const r = 28 + (i % 3) * 4;
    ctx.scene.add(threeMkTree(Math.cos(a) * r, Math.sin(a) * r, 0.7 + (i % 4) * 0.15));
  }

  const menuGroup = new THREE.Group();
  const ch = (typeof CHARACTERS !== 'undefined' && CHARACTERS[gs.character]) ? CHARACTERS[gs.character] : null;
  const bear = threeMkBear(ch?.color || '#c87830');
  bear.position.y = 0.2;
  menuGroup.add(bear);

  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(6, 7, 1.4, 8),
    new THREE.MeshStandardMaterial({ map: threeTexChecker(), metalness: 0.3, roughness: 0.6 })
  );
  platform.position.y = 0.7;
  platform.receiveShadow = true;
  menuGroup.add(platform);

  for (let i = 0; i < 6; i++) {
    const coin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 0.15, 16),
      new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xaa8800, emissiveIntensity: 0.35, metalness: 0.7 })
    );
    coin.rotation.x = Math.PI / 2;
    const a = (i / 6) * Math.PI * 2;
    coin.position.set(Math.cos(a) * 9, 2.2 + Math.sin(i) * 0.5, Math.sin(a) * 9);
    coin.userData.orbit = a;
    menuGroup.add(coin);
  }

  for (let w = 0; w < 5; w++) {
    const island = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 3, 1.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x3a6848, roughness: 0.9 })
    );
    const a = (w / 5) * Math.PI * 2 + 0.4;
    island.position.set(Math.cos(a) * 16, 3 + w * 0.8, Math.sin(a) * 16);
    island.castShadow = true;
    menuGroup.add(island);
  }

  ctx.scene.add(menuGroup);
  ctx.menuGroup = menuGroup;
  ctx.menuVariant = 'main';
  ctx.menuT = 0;
  ctx.camera.position.set(0, 14, 26);
  ctx.camera.lookAt(0, 3, 0);
}

function threeBuildKartMenuScene(ctx) {
  threeRestorePerspectiveCamera(ctx);
  threeClearScene(ctx);
  ctx.lights = threeAddLights(ctx.scene, false);
  ctx.scene.background = new THREE.Color(0x0a1020);
  ctx.scene.fog = new THREE.FogExp2(0x0a1020, 0.014);
  threeAddSkyDome(ctx.scene, '#283858', '#0a1020');
  threeAddMenuFloor(ctx, 42, 'metal');

  const water = new THREE.Mesh(
    new THREE.CircleGeometry(50, 48),
    new THREE.MeshStandardMaterial({
      color: 0x1a3868, metalness: 0.85, roughness: 0.15,
      emissive: 0x0a2040, emissiveIntensity: 0.2,
    })
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.02;
  ctx.scene.add(water);
  ctx.starfield = threeAddStarfield(ctx.scene, 80, 45);

  const ringPts = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    ringPts.push(new THREE.Vector3(Math.cos(a) * 18, 0.12, Math.sin(a) * 18));
  }
  const ring = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ringPts, true), 80, 1.8, 8, true),
    new THREE.MeshStandardMaterial({ map: threeTexAsphalt(), metalness: 0.3, roughness: 0.7 })
  );
  ctx.scene.add(ring);

  const menuGroup = new THREE.Group();
  const driver = typeof kartSelectDriver !== 'undefined' ? kartSelectDriver : (gs.character || 0);
  const ch = (typeof CHARACTERS !== 'undefined' && CHARACTERS[driver]) ? CHARACTERS[driver] : null;
  const kart = threeMkKartMesh(ch?.color || '#ffd700', ch?.name);
  kart.position.y = 0.2;
  menuGroup.add(kart);

  const podium = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5.8, 1.2, 8),
    new THREE.MeshStandardMaterial({ map: threeTexChecker(), metalness: 0.45, roughness: 0.45 })
  );
  podium.position.y = 0.6;
  menuGroup.add(podium);

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 2.2, 4),
      new THREE.MeshStandardMaterial({
        color: i % 2 ? 0xff3030 : 0xf0f0f0,
        emissive: i % 2 ? 0x440000 : 0x111111,
      })
    );
    cone.position.set(Math.cos(a) * 20, 1.1, Math.sin(a) * 20);
    cone.rotation.y = -a;
    menuGroup.add(cone);
  }

  ctx.scene.add(menuGroup);
  ctx.menuGroup = menuGroup;
  ctx.menuVariant = 'kart';
  ctx.menuT = 0;
  ctx.camera.position.set(0, 16, 28);
  ctx.camera.lookAt(0, 2, 0);
}

function threeBuildRaceScene(ctx, tr) {
  threeRestorePerspectiveCamera(ctx);
  threeClearScene(ctx);
  ctx.lights = threeAddLights(ctx.scene, false);
  ctx.scene.background = new THREE.Color(threeHexColor(tr.bg?.[0] || 0x0a1420));
  ctx.scene.fog = new THREE.Fog(threeHexColor(tr.bg?.[0] || 0x0a1420), 40, tr.mega ? 420 : tr.huge ? 300 : 240);
  ctx.trackGroup = threeBuildTrackMesh(tr);
  ctx.scene.add(ctx.trackGroup);
  ctx.menuVariant = null;
  ctx.kartMeshes = (race?.karts || []).map(k => {
    const mesh = threeMkKartMesh(k.color, k.name);
    ctx.scene.add(mesh);
    return { mesh, kart: k };
  });
}

function threeSyncRaceKarts(ctx, tr, t) {
  if (!race) return;
  const local = race.karts[kartLocalIdx()];
  for (const entry of ctx.kartMeshes) {
    const k = entry.kart;
    if (!k) continue;
    const w = threeGameToWorld(k.x, k.y, k.z, tr);
    const curve = ctx.trackGroup?.userData?.raceCurve;
    const roadH = threeTrackHeightAt(tr, k.x, k.y, curve);
    entry.mesh.position.set(w.x, roadH + w.y + 0.15, w.z);
    entry.mesh.rotation.y = -k.angle + Math.PI / 2;
    const wheels = entry.mesh.userData.wheels;
    if (wheels) {
      const spin = (k.speed || 0) * 0.015;
      wheels.forEach(wheel => { wheel.rotation.x += spin; });
    }
    if (k.boost > 50) {
      entry.mesh.traverse(obj => {
        if (obj.material?.emissive) obj.material.emissiveIntensity = 0.15 + Math.sin((t || 0) * 12) * 0.08;
      });
      const ex = entry.mesh.userData.exhaust;
      if (ex) {
        ex.visible = true;
        ex.material.emissiveIntensity = 0.5 + Math.sin((t || 0) * 18) * 0.3;
      }
    } else if (entry.mesh.userData.exhaust) {
      entry.mesh.userData.exhaust.visible = false;
    }
  }
  if (local) {
    const w = threeGameToWorld(local.x, local.y, local.z, tr);
    const curve = ctx.trackGroup?.userData?.raceCurve;
    const roadH = threeTrackHeightAt(tr, local.x, local.y, curve);
    const ca = (race.camAngle || local.angle || 0) + camOrbit.yaw * 0.35;
    const speedFactor = Math.min(1, Math.abs(local.speed || 0) / 380);
    const dist = 16 + (race.camZoom || 1) * 4 + speedFactor * 8 + camOrbit.dist * 0.35;
    const h = 8.5 + Math.min(7, (local.z || 0) * 0.045) + speedFactor * 2 + camOrbit.pitch * 12;
    const cx = w.x - Math.cos(ca) * dist;
    const cz = w.z - Math.sin(ca) * dist;
    const lookH = 2.2 + Math.min(2, (local.speed || 0) * 0.003);
    const camLerp = 0.12 + speedFactor * 0.06;
    ctx.camera.position.lerp(new THREE.Vector3(cx, roadH + w.y + h, cz), camLerp);
    ctx.camera.lookAt(w.x + Math.cos(ca) * 3, roadH + w.y + lookH, w.z + Math.sin(ca) * 3);
    ctx.camera.fov = lerp(ctx.camera.fov, 58 + (local.speed || 0) * 0.01, 0.09);
    ctx.camera.updateProjectionMatrix();
  }
  if (ctx.trackGroup) {
    ctx.trackGroup.children.forEach(ch => {
      if (ch.userData?.boostPad && ch.material?.emissive) {
        ch.material.emissiveIntensity = 0.4 + Math.sin((t || 0) * 8 + (ch.userData.padU || 0) * 18) * 0.28;
        return;
      }
      if (ch.isPointLight) return;
      if (ch.geometry?.type === 'BoxGeometry' && ch.material?.emissive) {
        ch.rotation.y = (t || 0) * 2.5;
        const base = ch.userData.baseY ?? ch.position.y;
        ch.position.y = base + Math.sin((t || 0) * 3 + ch.position.x) * 0.15;
      }
    });
  }
}

function threeUpdateMainMenu(ctx, dt, t) {
  ctx.menuT += dt;
  if (ctx.menuGroup) {
    const bear = ctx.menuGroup.children[0];
    if (bear) {
      bear.position.y = 0.2 + Math.sin(t * 2) * 0.12;
      bear.rotation.y = Math.sin(t * 0.4) * 0.15;
    }
    ctx.menuGroup.children.forEach(ch => {
      if (ch.userData?.orbit !== undefined) {
        const a = ch.userData.orbit + t * 0.5;
        ch.position.x = Math.cos(a) * 9;
        ch.position.z = Math.sin(a) * 9;
        ch.rotation.y = t * 2;
      }
    });
  }
  if (ctx.starfield?.material) {
    ctx.starfield.rotation.y = t * 0.025;
    ctx.starfield.material.opacity = 0.62 + Math.sin(t * 1.8) * 0.12;
  }
  const orbit = t * 0.12;
  ctx.camera.position.set(Math.sin(orbit) * 32, 13 + Math.sin(t * 0.5) * 2, Math.cos(orbit) * 32);
  ctx.camera.lookAt(0, 3.5, 0);
}

function threeUpdateKartMenu(ctx, dt, t) {
  ctx.menuT += dt;
  if (ctx.menuGroup) {
    ctx.menuGroup.rotation.y += dt * 0.45;
    const kart = ctx.menuGroup.children[0];
    if (kart) kart.position.y = 0.2 + Math.sin(t * 2.2) * 0.15;
  }
  if (ctx.starfield?.material) {
    ctx.starfield.rotation.y = -t * 0.03;
    ctx.starfield.material.opacity = 0.58 + Math.sin(t * 2.2) * 0.14;
  }
  const orbit = t * 0.18;
  ctx.camera.position.set(Math.sin(orbit) * 30, 14 + Math.sin(t * 0.7) * 2, Math.cos(orbit) * 30);
  ctx.camera.lookAt(0, 2.2, 0);
}

const THREE_WORLD_COLS = [
  ['#3d7a2a', '#2d5a1b'], ['#4a3520', '#2d1f0f'], ['#b0c8e0', '#8aaac0'],
  ['#8a3320', '#5a1e10'], ['#dfeaf6', '#a9c4e0'], ['#d4b860', '#9a7830'],
  ['#2a8a9a', '#145a70'], ['#d4a850', '#a07828'], ['#9a60e0', '#5a28a0'], ['#4a5080', '#1a2048'],
  ['#ffd4a8', '#e89050'],
];

function threeGpPos(gx, gy, gz) {
  return { x: gx * THREE_GP_SCALE, y: -gy * THREE_GP_SCALE, z: gz || 0 };
}

function threeBuildGameplayScene(ctx, ld, world) {
  threeClearScene(ctx);
  threeSetupGameplayCamera(ctx);
  ctx.lights = threeAddLights(ctx.scene, world < 3);
  const bg = threeHexColor(ld.bg?.[0] || '#1a3a1a');
  ctx.scene.background = new THREE.Color(bg);
  ctx.scene.fog = new THREE.Fog(bg, 80, 280);
  threeAddSkyDome(ctx.scene, ld.bg?.[1] || ld.bg?.[0] || '#2d5a1b', ld.bg?.[0] || '#1a3a1a');

  const [topCol, sideCol] = THREE_WORLD_COLS[world] || THREE_WORLD_COLS[0];
  const topMat = new THREE.MeshStandardMaterial({ color: threeHexColor(topCol), roughness: 0.88 });
  const sideMat = new THREE.MeshStandardMaterial({ color: threeHexColor(sideCol), roughness: 0.92 });

  ctx.gameGroup = new THREE.Group();
  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(ld.levelW * THREE_GP_SCALE + 20, 1.2, 24),
    new THREE.MeshStandardMaterial({ map: threeTexGrass(sideCol), roughness: 1 })
  );
  ground.position.set(ld.levelW * THREE_GP_SCALE * 0.5, 0.6, 0);
  ground.receiveShadow = true;
  ctx.gameGroup.add(ground);

  for (let i = 0; i < 6; i++) {
    const hx = (i + 0.5) * ld.levelW / 6;
    const hill = new THREE.Mesh(
      new THREE.ConeGeometry(8 + (i % 3) * 3, 14 + (i % 4) * 4, 6),
      new THREE.MeshStandardMaterial({
        color: threeHexColor(sideCol), roughness: 1, transparent: true, opacity: 0.35,
      })
    );
    const hp = threeGpPos(hx, 520);
    hill.position.set(hp.x, hp.y + 6, -10 - (i % 2) * 4);
    ctx.gameGroup.add(hill);
  }

  for (const [px, py, pw, ph] of ld.platforms) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(pw * THREE_GP_SCALE, ph * THREE_GP_SCALE, 3.2),
      ph > 24 ? sideMat : topMat
    );
    const c = threeGpPos(px + pw / 2, py + ph / 2);
    mesh.position.set(c.x, c.y, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    ctx.gameGroup.add(mesh);
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(pw * THREE_GP_SCALE, Math.min(0.35, ph * THREE_GP_SCALE * 0.12), 3.4),
      topMat
    );
    cap.position.set(c.x, -py * THREE_GP_SCALE, 0.05);
    ctx.gameGroup.add(cap);
  }
  ctx.scene.add(ctx.gameGroup);

  const ch = (typeof CHARACTERS !== 'undefined' && CHARACTERS[gs.character]) ? CHARACTERS[gs.character] : null;
  ctx.playerMesh = threeMkBear(ch?.color || '#c87830');
  ctx.playerMesh.scale.set(0.55, 0.55, 0.55);
  ctx.scene.add(ctx.playerMesh);

  ctx.entityGroup = new THREE.Group();
  ctx.scene.add(ctx.entityGroup);
  ctx.itemMeshes = [];
  ctx.enemyMeshes = [];
  ctx._itemsRef = items;
  ctx._enemiesRef = enemies;
  threeRebuildGameplayEntities(ctx);
  ctx.mode = 'gameplay';
  ctx.gameLevelKey = gs.world + '-' + gs.level;
}

function threeRebuildGameplayEntities(ctx) {
  threeClearGroup(ctx.entityGroup);
  ctx.itemMeshes = [];
  ctx.enemyMeshes = [];

  if (typeof goalPos !== 'undefined' && goalPos) {
    const g = threeGpPos(goalPos[0] + 20, goalPos[1] + 39);
    const goal = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 5.5, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x39d353, emissive: 0x1a8030, emissiveIntensity: 0.35 })
    );
    goal.position.set(g.x, g.y, 0.8);
    goal.castShadow = true;
    ctx.entityGroup.add(goal);
    const flag = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 2.8, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x2a9d4a, emissive: 0x1a6030, emissiveIntensity: 0.2 })
    );
    flag.position.set(g.x + 1.2, g.y - 1.2, 1.6);
    flag.userData.isFlag = true;
    ctx.entityGroup.add(flag);
  }

  if (typeof items !== 'undefined') {
    for (const it of items) {
      let mesh;
      if (it.type === 'coin') {
        mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.45, 0.45, 0.12, 12),
          new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xaa8800, emissiveIntensity: 0.3, metalness: 0.7 })
        );
        mesh.rotation.x = Math.PI / 2;
      } else if (it.type === 'star') {
        mesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.65, 0),
          new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffaa00, emissiveIntensity: 0.45 })
        );
      } else {
        mesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 0.9, 0.9),
          new THREE.MeshStandardMaterial({ color: 0x3ecf6e, emissive: 0x1a8040, emissiveIntensity: 0.25 })
        );
      }
      mesh.castShadow = true;
      ctx.entityGroup.add(mesh);
      ctx.itemMeshes.push({ it, mesh });
    }
  }

  if (typeof enemies !== 'undefined') {
    for (const e of enemies) {
      const col = e.type === 'boss' ? 0x8b0000 : e.type === 'flyer' ? 0x6a3db0 : 0x2aa84a;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(e.w * THREE_GP_SCALE, e.h * THREE_GP_SCALE, 1.8),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.75 })
      );
      mesh.castShadow = true;
      ctx.entityGroup.add(mesh);
      ctx.enemyMeshes.push({ e, mesh });
    }
  }

  ctx.hazardMeshes = [];
  if (typeof checkpoints !== 'undefined') {
    for (const c of checkpoints) {
      const cp = threeGpPos(c.x, c.y);
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 2.8, 6),
        new THREE.MeshStandardMaterial({ color: 0x6a5640, roughness: 0.9 })
      );
      pole.position.set(cp.x, cp.y + 1.4, 0.6);
      ctx.entityGroup.add(pole);
      const flag = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.9, 0.08),
        new THREE.MeshStandardMaterial({
          color: c.reached ? 0x39d353 : 0x888888,
          emissive: c.reached ? 0x1a8030 : 0x222222,
          emissiveIntensity: c.reached ? 0.4 : 0.1,
        })
      );
      flag.position.set(cp.x + 0.8, cp.y + 2.2, 0.9);
      flag.userData.isCpFlag = true;
      ctx.entityGroup.add(flag);
      ctx.hazardMeshes.push({ kind: 'cp', c, mesh: flag });
    }
  }
  if (typeof hazards !== 'undefined') {
    for (const h of hazards) {
      let mesh;
      if (h.type === 'saw') {
        mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.9, 0.9, 0.25, 10),
          new THREE.MeshStandardMaterial({ color: 0x9aa3ad, metalness: 0.5, roughness: 0.4 })
        );
        mesh.rotation.x = Math.PI / 2;
      } else if (h.type === 'beam') {
        mesh = new THREE.Mesh(
          new THREE.BoxGeometry(h.w * THREE_GP_SCALE, 0.35, 0.5),
          new THREE.MeshStandardMaterial({ color: 0xff66ff, emissive: 0xaa22aa, emissiveIntensity: 0.6 })
        );
      } else if (h.type === 'spikes' || h.type === 'coral') {
        mesh = new THREE.Mesh(
          new THREE.BoxGeometry(h.w * THREE_GP_SCALE, 0.5, 1.2),
          new THREE.MeshStandardMaterial({ color: h.type === 'coral' ? 0xff6b8a : 0xaab3bd, roughness: 0.85 })
        );
      } else {
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.7, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0x6a5040, roughness: 0.8 })
        );
      }
      const hp = threeGpPos(h.x + (h.w || 0) / 2, h.y + (h.h || 0) / 2);
      mesh.position.set(hp.x, hp.y, 0.5);
      mesh.castShadow = true;
      ctx.entityGroup.add(mesh);
      ctx.hazardMeshes.push({ kind: 'haz', h, mesh });
    }
  }
}

function threeSyncGameplay(ctx, t) {
  if (!player || !levelData) return;
  const ld = levelData;
  const key = gs.world + '-' + gs.level;
  if (ctx.gameLevelKey !== key) threeBuildGameplayScene(ctx, ld, gs.world);
  if (ctx._itemsRef !== items || ctx._enemiesRef !== enemies || ctx._hazardsRef !== hazards) {
    ctx._itemsRef = items;
    ctx._enemiesRef = enemies;
    ctx._hazardsRef = hazards;
    threeRebuildGameplayEntities(ctx);
  }

  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;
  const pp = threeGpPos(px, py);
  ctx.playerMesh.position.set(pp.x, pp.y + 1.2, 0.6);
  const sc = 0.55;
  ctx.playerMesh.rotation.y = 0;
  ctx.playerMesh.scale.set(sc * player.facing, sc, sc);

  for (const { it, mesh } of ctx.itemMeshes) {
    mesh.visible = !it.taken;
    if (!it.taken) {
      const bob = Math.sin(t * 3 + (it.bob || 0)) * 5;
      const p = threeGpPos(it.x + it.w / 2, it.y + it.h / 2 + bob);
      mesh.position.set(p.x, p.y, 0.8);
      mesh.rotation.y = t * 2;
    }
  }

  for (const { e, mesh } of ctx.enemyMeshes) {
    mesh.visible = e.active !== false;
    if (e.active !== false) {
      const p = threeGpPos(e.x + e.w / 2, e.y + e.h / 2);
      mesh.position.set(p.x, p.y, 0.5);
    }
  }

  for (const entry of ctx.hazardMeshes || []) {
    if (entry.kind === 'haz') {
      const h = entry.h, mesh = entry.mesh;
      const hp = threeGpPos(h.x + (h.w || 0) / 2, h.y + (h.h || 0) / 2);
      mesh.position.set(hp.x, hp.y, 0.5);
      if (h.type === 'saw' || h.type === 'meteor') mesh.rotation.z = h.rot || 0;
    } else if (entry.kind === 'cp' && entry.mesh?.material) {
      entry.mesh.material.color.setHex(entry.c.reached ? 0x39d353 : 0x888888);
      entry.mesh.material.emissiveIntensity = entry.c.reached ? 0.4 : 0.1;
    }
  }

  const velX = player.vx || 0;
  const velY = player.vy || 0;
  const lookX = pp.x;
  const lookY = pp.y + 1.6;
  const lookZ = 0;
  let baseDist = player.onGround ? 30 : (velY < -120 ? 26 : velY > 140 ? 34 : 29);
  baseDist += Math.min(4, Math.abs(velX) * 0.008);
  const baseH = player.onGround ? 8.5 : (velY < -120 ? 6 : velY > 140 ? 10.5 : 8);
  const orbitPos = camOrbit3DPosition(lookX, lookY, lookZ, baseDist, baseH);

  if (!ctx.gpCamFocus) ctx.gpCamFocus = { x: orbitPos.x, y: orbitPos.y, z: orbitPos.z };
  const orbiting = typeof camOrbitDragging === 'function' && camOrbitDragging();
  const lx = orbiting ? 0.55 : (Math.abs(velX) > 100 ? 0.28 : 0.22);
  const ly = orbiting ? 0.55 : (player.onGround ? 0.2 : 0.26);
  const lz = orbiting ? 0.5 : 0.18;
  ctx.gpCamFocus.x = lerp(ctx.gpCamFocus.x, orbitPos.x, lx);
  ctx.gpCamFocus.y = lerp(ctx.gpCamFocus.y, orbitPos.y, ly);
  ctx.gpCamFocus.z = lerp(ctx.gpCamFocus.z, orbitPos.z, lz);
  ctx.camera.position.set(ctx.gpCamFocus.x, ctx.gpCamFocus.y, ctx.gpCamFocus.z);
  ctx.camera.lookAt(lookX, lookY, lookZ);
  if (ctx.entityGroup) {
    ctx.entityGroup.children.forEach(ch => {
      if (ch.userData?.isFlag) ch.rotation.z = Math.sin(t * 3) * 0.35;
    });
  }
}

function threeSceneKind(scene) {
  if (THREE_RACE_SCENES.includes(scene)) return 'race';
  if (THREE_GAMEPLAY_SCENES.includes(scene)) return 'gameplay';
  if (THREE_MAIN_MENU_SCENES.includes(scene)) return 'mainmenu';
  if (THREE_KART_MENU_SCENES.includes(scene)) return 'kartmenu';
  return null;
}

function threeMobileSceneKind(scene) {
  return threeSceneKind(scene);
}

function threeMobileSync(scene, dt, t) {
  const can = gameView3dEnabled();
  const kind = can ? threeSceneKind(scene) : null;
  const play3d = kind === 'gameplay' || kind === 'race';
  document.body.classList.toggle('three-on', !!kind);
  document.body.classList.toggle('three-menu', kind === 'mainmenu' || kind === 'kartmenu');
  document.body.classList.toggle('three-race', kind === 'race');
  document.body.classList.toggle('three-gameplay', kind === 'gameplay');
  document.body.classList.toggle('three-main-menu', kind === 'mainmenu');
  document.body.classList.toggle('three-play', play3d);

  if (!can || !kind) {
    if (threeCtx) {
      threeDisable();
    }
    return false;
  }

  const ctx = threeEnsure();
  if (!ctx) return false;
  ctx.el.style.display = 'block';
  ctx.resize();

  if (kind === 'mainmenu' && (ctx.mode !== 'menu' || ctx.menuVariant !== 'main')) {
    threeBuildMainMenuScene(ctx);
    ctx.mode = 'menu';
  } else if (kind === 'kartmenu' && (ctx.mode !== 'menu' || ctx.menuVariant !== 'kart')) {
    threeBuildKartMenuScene(ctx);
    ctx.mode = 'menu';
  } else if (kind === 'gameplay' && levelData) {
    const gk = gs.world + '-' + gs.level;
    if (ctx.mode !== 'gameplay' || ctx.gameLevelKey !== gk) {
      threeBuildGameplayScene(ctx, levelData, gs.world);
    }
    threeSyncGameplay(ctx, t);
  } else if (kind === 'race' && race?.track) {
    if (ctx.mode !== 'race' || ctx.raceTrackId !== race.track.name) {
      threeBuildRaceScene(ctx, race.track);
      ctx.mode = 'race';
      ctx.raceTrackId = race.track.name;
    }
    threeSyncRaceKarts(ctx, race.track, t);
  }

  if (ctx.mode === 'menu' && ctx.menuVariant === 'main') threeUpdateMainMenu(ctx, dt, t);
  if (ctx.mode === 'menu' && ctx.menuVariant === 'kart') threeUpdateKartMenu(ctx, dt, t);
  ctx.renderer.render(ctx.scene, ctx.camera);
  return true;
}

function threeGameplayHudOnly() {
  return gameView3dEnabled() && gs.scene === 'gameplay' && threeCtx && threeCtx.mode === 'gameplay';
}

function threeKartHudOnly() {
  return gameView3dEnabled() && gs.scene === 'kart' && threeCtx && threeCtx.mode === 'race';
}

function threeMobileHudOnly() {
  return threeKartHudOnly();
}
