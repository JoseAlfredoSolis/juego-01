// ── Mobile 3D renderer (Three.js) — main menu, kart menus, 3D race ─────────
const THREE_KART_MENU_SCENES = ['kartmenu', 'kartselect', 'kartlobby', 'kartcup'];
const THREE_MAIN_MENU_SCENES = ['menu'];
const THREE_RACE_SCENES = ['kart'];
const THREE_GAMEPLAY_SCENES = ['gameplay'];
const THREE_GP_SCALE = 0.045;

let threeCtx = null;
const threeTexCache = {};

function threeCanUse() {
  return typeof THREE !== 'undefined';
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

function threeEnsure() {
  if (threeCtx) return threeCtx;
  const el = document.getElementById('three-c');
  if (!el) return null;
  const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (renderer.outputColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;
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
}

function threeAddLights(scene, warm) {
  const amb = new THREE.AmbientLight(warm ? 0x608050 : 0x6070a0, 0.62);
  const sun = new THREE.DirectionalLight(warm ? 0xfff0c8 : 0xfff4d0, 1.2);
  sun.position.set(40, 90, 35);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 5;
  sun.shadow.camera.far = 200;
  sun.shadow.camera.left = -60;
  sun.shadow.camera.right = 60;
  sun.shadow.camera.top = 60;
  sun.shadow.camera.bottom = -60;
  const rim = new THREE.DirectionalLight(warm ? 0xa0d080 : 0x80b0ff, 0.38);
  rim.position.set(-35, 25, -45);
  scene.add(amb, sun, rim);
  return [amb, sun, rim];
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
  if (name) {
    g.userData.name = name;
  }
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
  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(1.8 * scale, 4 * scale, 8),
    new THREE.MeshStandardMaterial({ color: 0x2a7830, roughness: 0.9 })
  );
  leaves.position.y = 3.8 * scale;
  leaves.castShadow = true;
  g.add(leaves);
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

function threeAddTrackDecor(group, tr) {
  const decor = tr.decor || 'palm';
  const segs = tr.huge ? 24 : 14;
  for (let i = 0; i < segs; i++) {
    const u = i / segs;
    const p = kartPathSample(tr, u);
    const tg = kartPathTangent(tr, u);
    const nx = -Math.sin(tg.angle), ny = Math.cos(tg.angle);
    const side = i % 2 ? 1 : -1;
    const off = (tr.roadWidth || 100) * threeTrackScale(tr).sc * 0.75;
    const wx = p.x + nx * off * side;
    const wy = p.y + ny * off * side;
    const w = threeGameToWorld(wx, wy, 0, tr);
    let mesh;
    if (decor === 'palm') {
      mesh = threeMkTree(0, 0, 0.55);
    } else if (decor === 'rock') {
      mesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.2 + Math.random() * 0.8, 0),
        new THREE.MeshStandardMaterial({ color: 0x6a6a70, roughness: 0.95 })
      );
      mesh.position.y = 0.8;
    } else if (decor === 'city') {
      const h = 3 + Math.random() * 8;
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, h, 2.5),
        new THREE.MeshStandardMaterial({
          color: 0x384058 + Math.floor(Math.random() * 0x101010),
          metalness: 0.35, roughness: 0.55,
        })
      );
      mesh.position.y = h / 2;
    } else {
      const h = 2.5;
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(8, h, 3),
        new THREE.MeshStandardMaterial({ color: 0x505868, roughness: 0.8 })
      );
      mesh.position.y = h / 2;
    }
    mesh.position.x += w.x;
    mesh.position.z += w.z;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
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
  const asphaltTex = threeTexAsphalt();
  const roadGeo = new THREE.TubeGeometry(curve, segs, roadW * 0.5, 10, true);
  const road = new THREE.Mesh(roadGeo, new THREE.MeshStandardMaterial({
    map: asphaltTex, metalness: 0.2, roughness: 0.78, color: threeHexColor(tr.asphalt?.[1] || '#5a5e66'),
  }));
  road.receiveShadow = true;
  group.add(road);

  const kerbGeo = new THREE.TubeGeometry(curve, segs, roadW * 0.6, 8, true);
  const kerb = new THREE.Mesh(kerbGeo, new THREE.MeshStandardMaterial({
    map: threeTexKerb(), metalness: 0.05, roughness: 0.9,
  }));
  kerb.position.y = -0.03;
  kerb.receiveShadow = true;
  group.add(kerb);

  const b = kartTrackBounds(tr);
  const sc = threeTrackScale(tr).sc;
  const gw = (b.maxX - b.minX) * sc + 35;
  const gh = (b.maxY - b.minY) * sc + 35;
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(gw, gh),
    new THREE.MeshStandardMaterial({
      map: threeTexGrass(tr.grass?.[0] || '#2a5820'),
      roughness: 1, metalness: 0,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.1, 0);
  ground.receiveShadow = true;
  group.add(ground);

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(200, 32, 20),
    new THREE.MeshBasicMaterial({ color: threeHexColor(tr.bg?.[0] || '#1a4080'), side: THREE.BackSide })
  );
  group.add(sky);

  threeAddTrackDecor(group, tr);

  for (const box of tr.items || []) {
    if (box.taken) continue;
    const w = threeGameToWorld(box.x, box.y, 0, tr);
    const item = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.MeshStandardMaterial({
        color: 0xff66ff, emissive: 0xaa22aa, emissiveIntensity: 0.55,
        metalness: 0.4, roughness: 0.35,
      })
    );
    item.position.set(w.x, 1.3, w.z);
    item.castShadow = true;
    group.add(item);
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
  threeClearScene(ctx);
  ctx.lights = threeAddLights(ctx.scene, true);
  ctx.scene.background = new THREE.Color(0x1a4828);
  ctx.scene.fog = new THREE.Fog(0x1a4828, 35, 180);

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
  threeClearScene(ctx);
  ctx.lights = threeAddLights(ctx.scene, false);
  ctx.scene.background = new THREE.Color(0x0a1020);
  ctx.scene.fog = new THREE.Fog(0x0a1020, 30, 160);
  threeAddMenuFloor(ctx, 42, 'metal');

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
  threeClearScene(ctx);
  ctx.lights = threeAddLights(ctx.scene, false);
  ctx.scene.background = new THREE.Color(threeHexColor(tr.bg?.[0] || 0x0a1420));
  ctx.scene.fog = new THREE.Fog(threeHexColor(tr.bg?.[0] || 0x0a1420), 50, 240);
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
    entry.mesh.position.set(w.x, w.y + 0.2, w.z);
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
    }
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

function threeUpdateMainMenu(ctx, dt, t) {
  ctx.menuT += dt;
  if (ctx.menuGroup) {
    const bear = ctx.menuGroup.children[0];
    if (bear) bear.position.y = 0.2 + Math.sin(t * 2) * 0.12;
    ctx.menuGroup.children.forEach(ch => {
      if (ch.userData?.orbit !== undefined) {
        const a = ch.userData.orbit + t * 0.5;
        ch.position.x = Math.cos(a) * 9;
        ch.position.z = Math.sin(a) * 9;
        ch.rotation.y = t * 2;
      }
    });
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
  const orbit = t * 0.18;
  ctx.camera.position.set(Math.sin(orbit) * 30, 14 + Math.sin(t * 0.7) * 2, Math.cos(orbit) * 30);
  ctx.camera.lookAt(0, 2.2, 0);
}

const THREE_WORLD_COLS = [
  ['#3d7a2a', '#2d5a1b'], ['#4a3520', '#2d1f0f'], ['#b0c8e0', '#8aaac0'],
  ['#8a3320', '#5a1e10'], ['#dfeaf6', '#a9c4e0'], ['#d4b860', '#9a7830'],
  ['#2a8a9a', '#145a70'], ['#d4a850', '#a07828'], ['#9a60e0', '#5a28a0'], ['#4a5080', '#1a2048'],
];

function threeGpPos(gx, gy, gz) {
  return { x: gx * THREE_GP_SCALE, y: -gy * THREE_GP_SCALE, z: gz || 0 };
}

function threeBuildGameplayScene(ctx, ld, world) {
  threeClearScene(ctx);
  ctx.lights = threeAddLights(ctx.scene, world < 3);
  const bg = threeHexColor(ld.bg?.[0] || '#1a3a1a');
  ctx.scene.background = new THREE.Color(bg);
  ctx.scene.fog = new THREE.Fog(bg, 35, 220);

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(280, 32, 18),
    new THREE.MeshBasicMaterial({ color: threeHexColor(ld.bg?.[1] || ld.bg?.[0] || '#2d5a1b'), side: THREE.BackSide })
  );
  ctx.scene.add(sky);

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
      new THREE.MeshStandardMaterial({ color: 0x2a9d4a })
    );
    flag.position.set(g.x + 1.2, g.y - 1.2, 1.6);
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
}

function threeSyncGameplay(ctx, t) {
  if (!player || !levelData) return;
  const ld = levelData;
  const key = gs.world + '-' + gs.level;
  if (ctx.gameLevelKey !== key) threeBuildGameplayScene(ctx, ld, gs.world);
  if (ctx._itemsRef !== items || ctx._enemiesRef !== enemies) {
    ctx._itemsRef = items;
    ctx._enemiesRef = enemies;
    threeRebuildGameplayEntities(ctx);
  }

  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;
  const pp = threeGpPos(px, py);
  ctx.playerMesh.position.set(pp.x, pp.y + 1.2, 0.6);
  ctx.playerMesh.rotation.y = player.facing < 0 ? Math.PI / 2 : -Math.PI / 2;

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

  const lookX = pp.x;
  const lookY = pp.y + 2.5;
  const camX = lookX + 14;
  const camY = lookY + 11;
  const camZ = 26;
  ctx.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.12);
  ctx.camera.lookAt(lookX, lookY, 0);
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
  const can = threeCanUse();
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
      threeCtx.mode = null;
      threeCtx.el.style.display = 'none';
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
  return threeCanUse() && gs.scene === 'gameplay' && threeCtx?.mode === 'gameplay';
}

function threeKartHudOnly() {
  return threeCanUse() && gs.scene === 'kart' && threeCtx?.mode === 'race';
}

function threeMobileHudOnly() {
  return threeKartHudOnly();
}
