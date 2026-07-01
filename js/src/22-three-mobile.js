// ── Mobile 3D renderer (Three.js) — kart menu showcase + 3D race ───────────
const THREE_MENU_SCENES = ['kartmenu', 'kartselect', 'kartlobby', 'kartcup'];
const THREE_RACE_SCENES = ['kart'];

let threeCtx = null;

function threeMobileCanUse() {
  return typeof isTouchDevice === 'function' && isTouchDevice() && typeof THREE !== 'undefined';
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

function threeEnsure() {
  if (threeCtx) return threeCtx;
  const el = document.getElementById('three-c');
  if (!el) return null;
  const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a1420, 40, 220);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 500);
  threeCtx = {
    el, renderer, scene, camera,
    mode: null,
    trackGroup: null,
    kartMeshes: [],
    menuGroup: null,
    menuT: 0,
    lights: [],
    resize: () => {
      const w = el.clientWidth || window.innerWidth;
      const h = el.clientHeight || window.innerHeight;
      if (w < 2 || h < 2) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
  };
  threeCtx.resize();
  return threeCtx;
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

function threeAddLights(scene) {
  const amb = new THREE.AmbientLight(0x6070a0, 0.65);
  const sun = new THREE.DirectionalLight(0xfff4d0, 1.15);
  sun.position.set(40, 80, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  const rim = new THREE.DirectionalLight(0x80b0ff, 0.35);
  rim.position.set(-30, 20, -40);
  scene.add(amb, sun, rim);
  return [amb, sun, rim];
}

function threeMkWheel() {
  const geo = new THREE.CylinderGeometry(0.55, 0.55, 0.35, 12);
  geo.rotateZ(Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.2, roughness: 0.8 });
  return new THREE.Mesh(geo, mat);
}

function threeMkKartMesh(color) {
  const g = new THREE.Group();
  const col = threeHexColor(color);
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 1.35, 2.3),
    new THREE.MeshStandardMaterial({ color: col, metalness: 0.45, roughness: 0.32 })
  );
  body.position.y = 1.15;
  body.castShadow = true;
  g.add(body);
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.9, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x1a2030, metalness: 0.5, roughness: 0.4 })
  );
  cabin.position.set(-0.3, 1.85, 0);
  cabin.castShadow = true;
  g.add(cabin);
  const wing = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.7, 2.8),
    new THREE.MeshStandardMaterial({ color: col, metalness: 0.5, roughness: 0.3 })
  );
  wing.position.set(-2.2, 1.55, 0);
  g.add(wing);
  const wheelPos = [[1.5, 0.55, 1.05], [1.5, 0.55, -1.05], [-1.35, 0.55, 1.05], [-1.35, 0.55, -1.05]];
  for (const [x, y, z] of wheelPos) {
    const w = threeMkWheel();
    w.position.set(x, y, z);
    w.castShadow = true;
    g.add(w);
  }
  return g;
}

function threeBuildTrackMesh(tr) {
  const group = new THREE.Group();
  const pts = [];
  const segs = tr.huge ? 180 : 120;
  for (let i = 0; i <= segs; i++) {
    const p = kartPathSample(tr, i / segs);
    const w = threeGameToWorld(p.x, p.y, 0, tr);
    pts.push(new THREE.Vector3(w.x, w.y + 0.05, w.z));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.35);
  const roadW = Math.max(3.8, (tr.roadWidth || 100) * threeTrackScale(tr).sc * 0.55);
  const roadGeo = new THREE.TubeGeometry(curve, segs, roadW * 0.5, 8, true);
  const roadMat = new THREE.MeshStandardMaterial({
    color: threeHexColor(tr.asphalt?.[1] || '#5a5e66'),
    metalness: 0.15,
    roughness: 0.75,
  });
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.receiveShadow = true;
  group.add(road);

  const kerbGeo = new THREE.TubeGeometry(curve, segs, roadW * 0.58, 6, true);
  const kerbMat = new THREE.MeshStandardMaterial({
    color: threeHexColor(tr.kerb?.[0] || '#e03030'),
    metalness: 0.1,
    roughness: 0.85,
  });
  const kerb = new THREE.Mesh(kerbGeo, kerbMat);
  kerb.position.y = -0.02;
  kerb.receiveShadow = true;
  group.add(kerb);

  const b = kartTrackBounds(tr);
  const { sc, tcx, tcy } = threeTrackScale(tr);
  const gw = (b.maxX - b.minX) * sc + 30;
  const gh = (b.maxY - b.minY) * sc + 30;
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(gw, gh),
    new THREE.MeshStandardMaterial({ color: threeHexColor(tr.grass?.[0] || '#2a5820'), roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.08, 0);
  ground.receiveShadow = true;
  group.add(ground);

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(180, 24, 16),
    new THREE.MeshBasicMaterial({ color: threeHexColor(tr.bg?.[0] || '#1a4080'), side: THREE.BackSide })
  );
  group.add(sky);

  for (const box of tr.items || []) {
    if (box.taken) continue;
    const w = threeGameToWorld(box.x, box.y, 0, tr);
    const item = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.4, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xff66ff, emissive: 0x660066, metalness: 0.3, roughness: 0.4 })
    );
    item.position.set(w.x, 1.2, w.z);
    item.castShadow = true;
    group.add(item);
  }
  return group;
}

function threeBuildMenuScene(ctx) {
  threeClearGroup(ctx.scene);
  ctx.lights = threeAddLights(ctx.scene);
  ctx.scene.background = new THREE.Color(0x0a1020);
  ctx.scene.fog = new THREE.Fog(0x0a1020, 30, 160);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(42, 48),
    new THREE.MeshStandardMaterial({ color: 0x1a2840, metalness: 0.2, roughness: 0.85 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  ctx.scene.add(floor);

  const ringPts = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    ringPts.push(new THREE.Vector3(Math.cos(a) * 18, 0.12, Math.sin(a) * 18));
  }
  const ringCurve = new THREE.CatmullRomCurve3(ringPts, true);
  const ring = new THREE.Mesh(
    new THREE.TubeGeometry(ringCurve, 80, 1.8, 6, true),
    new THREE.MeshStandardMaterial({ color: 0x4a5878, metalness: 0.35, roughness: 0.55 })
  );
  ctx.scene.add(ring);

  const grid = new THREE.GridHelper(80, 20, 0x3a5080, 0x1a2848);
  grid.position.y = 0.02;
  ctx.scene.add(grid);

  const menuGroup = new THREE.Group();
  const driver = typeof kartSelectDriver !== 'undefined' ? kartSelectDriver : (gs.character || 0);
  const ch = (typeof CHARACTERS !== 'undefined' && CHARACTERS[driver]) ? CHARACTERS[driver] : null;
  const kart = threeMkKartMesh(ch?.color || '#ffd700');
  kart.position.y = 0.2;
  menuGroup.add(kart);

  const podium = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5.8, 1.2, 6),
    new THREE.MeshStandardMaterial({ color: 0x2a3860, metalness: 0.4, roughness: 0.5 })
  );
  podium.position.y = 0.6;
  menuGroup.add(podium);

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 2.2, 4),
      new THREE.MeshStandardMaterial({
        color: i % 2 ? 0xff3030 : 0xf0f0f0,
        emissive: i % 2 ? 0x330000 : 0x111111,
      })
    );
    cone.position.set(Math.cos(a) * 20, 1.1, Math.sin(a) * 20);
    cone.rotation.y = -a;
    menuGroup.add(cone);
  }

  ctx.scene.add(menuGroup);
  ctx.menuGroup = menuGroup;
  ctx.menuT = 0;
  ctx.trackGroup = null;
  ctx.kartMeshes = [];
  ctx.camera.position.set(0, 16, 28);
  ctx.camera.lookAt(0, 2, 0);
}

function threeBuildRaceScene(ctx, tr) {
  threeClearGroup(ctx.scene);
  ctx.lights = threeAddLights(ctx.scene);
  ctx.scene.background = new THREE.Color(threeHexColor(tr.bg?.[0] || 0x0a1420));
  ctx.scene.fog = new THREE.Fog(threeHexColor(tr.bg?.[0] || 0x0a1420), 50, 240);
  ctx.trackGroup = threeBuildTrackMesh(tr);
  ctx.scene.add(ctx.trackGroup);
  ctx.menuGroup = null;
  ctx.kartMeshes = (race?.karts || []).map(k => {
    const mesh = threeMkKartMesh(k.color);
    ctx.scene.add(mesh);
    return { mesh, kart: k };
  });
}

function threeSyncRaceKarts(ctx, tr) {
  if (!race) return;
  const local = race.karts[kartLocalIdx()];
  for (const entry of ctx.kartMeshes) {
    const k = entry.kart;
    if (!k) continue;
    const w = threeGameToWorld(k.x, k.y, k.z, tr);
    entry.mesh.position.set(w.x, w.y + 0.2, w.z);
    entry.mesh.rotation.y = -k.angle + Math.PI / 2;
  }
  if (local) {
    const w = threeGameToWorld(local.x, local.y, local.z, tr);
    const ca = race.camAngle || local.angle || 0;
    const dist = 14 + (race.camZoom || 1) * 4;
    const h = 7 + Math.min(6, (local.z || 0) * 0.04);
    const cx = w.x - Math.cos(ca) * dist;
    const cz = w.z - Math.sin(ca) * dist;
    ctx.camera.position.lerp(new THREE.Vector3(cx, w.y + h, cz), 0.12);
    ctx.camera.lookAt(w.x, w.y + 2.5, w.z);
  }
}

function threeUpdateMenu(ctx, dt, t) {
  ctx.menuT += dt;
  if (ctx.menuGroup) {
    ctx.menuGroup.rotation.y += dt * 0.45;
    const bob = Math.sin(t * 2.2) * 0.15;
    ctx.menuGroup.children[0].position.y = 0.2 + bob;
  }
  const orbit = t * 0.18;
  ctx.camera.position.set(Math.sin(orbit) * 30, 14 + Math.sin(t * 0.7) * 2, Math.cos(orbit) * 30);
  ctx.camera.lookAt(0, 2.2, 0);
}

function threeMobileSceneKind(scene) {
  if (THREE_RACE_SCENES.includes(scene)) return 'race';
  if (THREE_MENU_SCENES.includes(scene)) return 'menu';
  return null;
}

function threeMobileSync(scene, dt, t) {
  const can = threeMobileCanUse();
  document.body.classList.toggle('three-on', !!can && !!threeMobileSceneKind(scene));
  document.body.classList.toggle('three-menu', !!can && threeMobileSceneKind(scene) === 'menu');
  document.body.classList.toggle('three-race', !!can && threeMobileSceneKind(scene) === 'race');

  if (!can) {
    if (threeCtx) {
      threeCtx.mode = null;
      threeCtx.el.style.display = 'none';
    }
    return false;
  }

  const kind = threeMobileSceneKind(scene);
  if (!kind) {
    if (threeCtx) {
      threeCtx.mode = null;
      threeCtx.el.style.display = 'none';
    }
    return false;
  }

  const ctx = threeEnsure();
  if (!ctx) return false;
  ctx.el.style.display = 'block';
  ctx.resize();

  if (kind === 'menu' && ctx.mode !== 'menu') {
    threeBuildMenuScene(ctx);
    ctx.mode = 'menu';
  }
  if (kind === 'race' && race?.track) {
    if (ctx.mode !== 'race' || ctx.raceTrackId !== race.track.name) {
      threeBuildRaceScene(ctx, race.track);
      ctx.mode = 'race';
      ctx.raceTrackId = race.track.name;
    }
    threeSyncRaceKarts(ctx, race.track);
  }

  if (ctx.mode === 'menu') threeUpdateMenu(ctx, dt, t);
  ctx.renderer.render(ctx.scene, ctx.camera);
  return true;
}

function threeMobileHudOnly() {
  return threeMobileCanUse() && gs.scene === 'kart' && threeCtx?.mode === 'race';
}
