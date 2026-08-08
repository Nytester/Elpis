// A real interactive 3D globe (drag to spin, scroll to zoom, hover/click pins,
// click-to-fly-in on a pin) built on Three.js, loaded at runtime from a free
// CDN (jsdelivr) — not a bundled npm dependency, so it adds zero build size,
// only a one-time network fetch the first time this element mounts.
//
// Colors are Elpis's warm ivory/gold theme (not the original dark navy/teal
// palette this component started from). Data is supplied entirely via the
// `data-hospitals` attribute (real bearing/distance computed by the caller)
// — this file has no knowledge of any specific hospital and fabricates
// nothing. Two fields are OPTIONAL and currently unused by any caller
// because we don't have real data for them yet: `h.w` (ER wait minutes, for
// the traffic-light pin coloring) and `h.m` (array of transit-mode keys, for
// the arc lines to each pin). Until a real data source exists for those,
// every pin just renders in the same neutral gold — wire them up only when
// backed by real values, never fabricated ones.
(() => {
if (customElements.get('care-globe')) return;
const R = 60, PHI0 = 0.06, PHIMAX = 0.5, MAX_RADIUS_MI = 100;
const BASE_PIN = 0xb68235;
const WAIT_COLORS = [[20, 0x6fae74], [45, 0xb68235], [70, 0xd98c3d]], SLOW = 0xc1584a;
const waitColor = (w) => { if (w == null || w < 0) return BASE_PIN; for (const [t, c] of WAIT_COLORS) if (w <= t) return c; return SLOW; };
const MODE_COLORS = { M: 0x6aa5ff, B: 0x7fe0d4, P: 0xc9a6ff, R: 0xf2a35c, A: 0xc1584a };

class CareGlobe extends HTMLElement {
  static get observedAttributes() { return ['data-hospitals', 'ring', 'highlight', 'arcs', 'zip']; }
  connectedCallback() {
    if (this._started) return; this._started = true;
    this.style.display = 'block';
    if (!this.style.position) this.style.position = 'relative';
    this._msg = document.createElement('div');
    this._msg.textContent = 'Loading 3D globe…';
    Object.assign(this._msg.style, { position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7d7979', fontSize: '13px', fontFamily: 'inherit' });
    this.appendChild(this._msg);
    import('https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js')
      .then((THREE) => this._init(THREE))
      .catch((e) => { this._msg.textContent = '3D globe failed to load'; console.error(e); });
  }
  attributeChangedCallback(name) {
    if (!this._ready) return;
    if (name === 'data-hospitals') this._syncPins();
    else if (name === 'ring') this._buildRing();
    else if (name === 'highlight') this._applyHighlight();
    else if (name === 'arcs') this._applyArcVisibility();
  }
  disconnectedCallback() {
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._ro) this._ro.disconnect();
    if (this._renderer) this._renderer.dispose();
  }
  _pos(phi, theta, r) {
    return new this.T.Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)).multiplyScalar(r);
  }
  _init(T) {
    this.T = T;
    this._msg.remove();
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;touch-action:none;';
    this.appendChild(renderer.domElement);
    this._renderer = renderer;
    const scene = new T.Scene();
    this._scene = scene;
    const cam = new T.PerspectiveCamera(38, 1, 0.1, 1000);
    cam.position.set(0, 26, 160);
    cam.lookAt(0, 4, 0);
    this._cam = cam;
    this._zoom = 160;
    scene.add(new T.AmbientLight(0xfff3e4, 0.75));
    const dir = new T.DirectionalLight(0xffffff, 1.3); dir.position.set(80, 120, 90); scene.add(dir);
    const gold = new T.PointLight(0xb68235, 60000, 400); gold.position.set(0, 130, 40); scene.add(gold);
    // subtle floating particles
    const starGeo = new T.BufferGeometry();
    const sp = [];
    for (let i = 0; i < 320; i++) {
      const v = new T.Vector3().randomDirection().multiplyScalar(300 + Math.random() * 150);
      sp.push(v.x, v.y, v.z);
    }
    starGeo.setAttribute('position', new T.Float32BufferAttribute(sp, 3));
    scene.add(new T.Points(starGeo, new T.PointsMaterial({ color: 0xd7d3d3, size: 1.1, sizeAttenuation: true, transparent: true, opacity: 0.5 })));
    // globe group
    const g = new T.Group();
    g.rotation.x = 0.5;
    scene.add(g);
    this._g = g;
    this._tRotX = 0.5; this._tRotY = 0;
    const globe = new T.Mesh(new T.SphereGeometry(R, 48, 48), new T.MeshStandardMaterial({ color: 0xeae7e7, roughness: 0.9, metalness: 0.05 }));
    g.add(globe);
    const wire = new T.Mesh(new T.SphereGeometry(R + 0.15, 28, 28), new T.MeshBasicMaterial({ color: 0xb68235, wireframe: true, transparent: true, opacity: 0.08 }));
    g.add(wire);
    // lat/meridian guide lines
    const lineMat = new T.LineBasicMaterial({ color: 0x201f1d, transparent: true, opacity: 0.12 });
    [0.18, 0.34, PHI0 + PHIMAX].forEach((phi) => {
      const pts = [];
      for (let i = 0; i <= 90; i++) pts.push(this._pos(phi, (i / 90) * Math.PI * 2, R + 0.25));
      g.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(pts), lineMat));
    });
    for (let m = 0; m < 6; m++) {
      const th = (m / 6) * Math.PI * 2, pts = [];
      for (let i = 0; i <= 40; i++) pts.push(this._pos((i / 40) * 0.62, th, R + 0.25));
      g.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), lineMat));
    }
    // buildings scattered on the upper cap — purely decorative texture, not real data
    const bMat = new T.MeshStandardMaterial({ color: 0xd7d3d3, roughness: 0.8, metalness: 0.1, emissive: 0xb68235, emissiveIntensity: 0.15 });
    this._bMat = bMat;
    let seed = 12345;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    this._city = [];
    for (let i = 0; i < 130; i++) {
      const phi = 0.05 + rnd() * 0.58, theta = rnd() * Math.PI * 2;
      const h = 1.5 + rnd() * rnd() * 6, w = 0.8 + rnd() * 1.6;
      const b = new T.Mesh(new T.BoxGeometry(w, h, 0.8 + rnd() * 1.6), bMat);
      const n = this._pos(phi, theta, 1);
      b.position.copy(n).multiplyScalar(R);
      b.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), n);
      b.position.addScaledVector(n, h / 2);
      g.add(b);
      this._city.push(b);
    }
    // ZIP marker at pole ("You")
    const you = new T.Mesh(new T.SphereGeometry(1.9, 20, 20), new T.MeshStandardMaterial({ color: 0x444141, emissive: 0x444141, emissiveIntensity: 0.5 }));
    you.position.set(0, R + 1.2, 0);
    g.add(you);
    this._pulse = new T.Mesh(new T.RingGeometry(2.4, 2.9, 40), new T.MeshBasicMaterial({ color: 0x444141, transparent: true, side: T.DoubleSide }));
    this._pulse.rotation.x = -Math.PI / 2;
    this._pulse.position.set(0, R + 0.4, 0);
    g.add(this._pulse);
    this._youLabel = this._makeLabel('ZIP ' + (this.getAttribute('zip') || ''), 'rgba(243,242,242,0.95)', '#201f1d');
    this._youLabel.position.set(0, R + 9, 0);
    g.add(this._youLabel);
    this._arcGroup = new T.Group();
    g.add(this._arcGroup);
    this._pinGroup = new T.Group();
    g.add(this._pinGroup);
    this._ringGroup = new T.Group();
    g.add(this._ringGroup);
    this._ray = new T.Raycaster();
    this._ptr = new T.Vector2(-2, -2);
    this._pins = new Map();
    this._ready = true;
    this._syncPins();
    this._buildRing();
    this._bindEvents();
    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(this);
    this._resize();
    const tick = (t) => {
      this._raf = requestAnimationFrame(tick);
      if (this._flying) {
        g.rotation.y += (this._tRotY - g.rotation.y) * 0.12;
        g.rotation.x += (this._tRotX - g.rotation.x) * 0.12;
        if (Math.abs(this._tRotY - g.rotation.y) < 0.004 && Math.abs(this._tRotX - g.rotation.x) < 0.004) this._flying = false;
      } else if (!this._dragging && !this._hovGrp) g.rotation.y += 0.0012;
      this._pins.forEach((grp) => {
        const d = grp.userData;
        const dp = d.tPhi - d.phi, dt = d.tTheta - d.theta;
        if (Math.abs(dp) > 0.0004 || Math.abs(dt) > 0.0004) {
          d.phi += dp * 0.14; d.theta += dt * 0.14;
          this._place(grp);
        }
      });
      if (this._ringT != null) {
        const dr = this._ringT - this._ringCur;
        if (Math.abs(dr) > 0.002) { this._ringCur += dr * 0.16; this._drawRing(this._ringCur); }
      }
      const p = (t / 1200) % 1;
      this._pulse.scale.setScalar(1 + p * 2.2);
      this._pulse.material.opacity = 0.7 * (1 - p);
      this._cam.position.z += (this._zoom - this._cam.position.z) * 0.08;
      renderer.render(scene, cam);
    };
    this._raf = requestAnimationFrame(tick);
  }
  _makeLabel(text, bg, fg) {
    const T = this.T, c = document.createElement('canvas');
    c.width = 320; c.height = 76;
    const x = c.getContext('2d');
    x.font = '600 26px sans-serif';
    const w = Math.min(300, x.measureText(text).width + 36);
    x.fillStyle = bg;
    x.beginPath(); x.roundRect((c.width - w) / 2, 10, w, 52, 14); x.fill();
    x.fillStyle = fg;
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(text, c.width / 2, 37);
    const sprite = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), transparent: true, depthTest: false }));
    sprite.scale.set(20, 4.75, 1);
    sprite.renderOrder = 10;
    return sprite;
  }
  _place(grp) {
    const T = this.T, d = grp.userData, n = this._pos(d.phi, d.theta, 1);
    d.stem.position.copy(n).multiplyScalar(R + 3.5);
    d.stem.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), n);
    d.head.position.copy(n).multiplyScalar(R + 7.6);
    d.label.position.copy(n).multiplyScalar(R + 14);
    const start = new T.Vector3(0, R + 1, 0), end = n.clone().multiplyScalar(R + 1);
    d.arcs.forEach((line, i) => {
      const lift = 8 + i * 5;
      const mid = start.clone().add(end).normalize().multiplyScalar(R + lift + d.phi * 40);
      const pts = new T.QuadraticBezierCurve3(start, mid, end).getPoints(40);
      line.geometry.setFromPoints(pts);
      line.geometry.attributes.position.needsUpdate = true;
    });
  }
  _syncPins() {
    if (!this._ready) return;
    const T = this.T;
    let list = [];
    try { list = JSON.parse(this.getAttribute('data-hospitals') || '[]'); } catch (e) {}
    const seen = new Set();
    list.forEach((h) => {
      const key = String(h.id);
      seen.add(key);
      const tPhi = PHI0 + Math.max(0, Math.min(1, h.d / MAX_RADIUS_MI)) * PHIMAX;
      const col = waitColor(h.w);
      let grp = this._pins.get(key);
      if (!grp) {
        grp = new T.Group();
        const stem = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 7, 8), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.7 }));
        const head = new T.Mesh(new T.SphereGeometry(1.6, 18, 18), new T.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.6 }));
        head.userData.id = h.id;
        const label = this._makeLabel(h.s + ' · ' + h.dl, 'rgba(243,242,242,0.95)', '#201f1d');
        label.visible = false;
        grp.add(stem, head, label);
        grp.userData = { id: h.id, stem, head, label, baseColor: col, phi: tPhi, theta: h.a, tPhi, tTheta: h.a, arcs: [], lab: '' };
        this._pinGroup.add(grp);
        this._pins.set(key, grp);
      }
      const d = grp.userData;
      d.tPhi = tPhi; d.tTheta = h.a;
      if (d.baseColor !== col) {
        d.baseColor = col;
        d.head.material.color.set(col); d.head.material.emissive.set(col);
        d.stem.material.color.set(col);
      }
      const lab = h.s + ' · ' + h.dl;
      if (d.lab !== lab) {
        d.lab = lab;
        const vis = d.label.visible;
        grp.remove(d.label);
        const nl = this._makeLabel(lab, 'rgba(243,242,242,0.95)', '#201f1d');
        nl.visible = vis;
        grp.add(nl); d.label = nl;
      }
      const modes = h.m || [];
      while (d.arcs.length > modes.length) { const a = d.arcs.pop(); this._arcGroup.remove(a); }
      modes.forEach((m, i) => {
        if (!d.arcs[i]) {
          const line = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(), new T.Vector3()]), new T.LineBasicMaterial({ color: MODE_COLORS[m] || 0xb68235, transparent: true, opacity: 0.22 }));
          d.arcs[i] = line; this._arcGroup.add(line);
        } else d.arcs[i].material.color.set(MODE_COLORS[m] || 0xb68235);
      });
      this._place(grp);
    });
    this._pins.forEach((grp, key) => {
      if (seen.has(key)) return;
      grp.userData.arcs.forEach((a) => this._arcGroup.remove(a));
      this._pinGroup.remove(grp);
      this._pins.delete(key);
    });
    this._heads = Array.from(this._pins.values()).map((g) => g.userData.head);
    this._applyArcVisibility();
    this._applyHighlight();
    if (this._youLabel && this.getAttribute('zip')) {
      const txt = 'ZIP ' + this.getAttribute('zip');
      if (this._youLabel.userData.txt !== txt) {
        this._g.remove(this._youLabel);
        this._youLabel = this._makeLabel(txt, 'rgba(243,242,242,0.95)', '#201f1d');
        this._youLabel.userData.txt = txt;
        this._youLabel.position.set(0, R + 9, 0);
        this._g.add(this._youLabel);
      }
    }
  }
  _drawRing(frac) {
    const T = this.T, rg = this._ringGroup;
    while (rg.children.length) { const c = rg.children[0]; rg.remove(c); c.geometry.dispose(); }
    const phi = PHI0 + Math.max(0.02, Math.min(1, frac)) * PHIMAX;
    const pts = [];
    for (let i = 0; i <= 120; i++) pts.push(this._pos(phi, (i / 120) * Math.PI * 2, R + 0.6));
    rg.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: 0xb68235, transparent: true, opacity: 0.85 })));
    // soft cap fill
    rg.add(new T.Mesh(new T.SphereGeometry(R + 0.35, 48, 24, 0, Math.PI * 2, 0, phi), new T.MeshBasicMaterial({ color: 0xb68235, transparent: true, opacity: 0.07, depthWrite: false })));
  }
  _buildRing() {
    if (!this._ready) return;
    const frac = parseFloat(this.getAttribute('ring') || '0.15');
    if (this._ringCur == null) { this._ringCur = frac; this._drawRing(frac); }
    this._ringT = frac;
  }
  _applyArcVisibility() { if (this._arcGroup) this._arcGroup.visible = this.getAttribute('arcs') !== 'off'; }
  _setPinState(grp, on) {
    const d = grp.userData;
    d.head.scale.setScalar(on ? 1.5 : 1);
    d.head.material.color.set(on ? 0xffffff : d.baseColor);
    d.label.visible = on;
    d.arcs.forEach((a) => { a.material.opacity = on ? 0.9 : 0.22; });
  }
  _applyHighlight() {
    if (!this._pinGroup) return;
    const hl = this.getAttribute('highlight');
    this._pins.forEach((grp) => this._setPinState(grp, String(grp.userData.id) === hl || grp === this._hovGrp));
  }
  flyTo(grp) {
    const d = grp.userData;
    let ty = d.tTheta - Math.PI / 2;
    const cur = this._g.rotation.y;
    ty = cur + Math.atan2(Math.sin(ty - cur), Math.cos(ty - cur));
    this._tRotY = ty;
    this._tRotX = Math.max(0.08, Math.min(1.2, Math.PI / 2 - d.tPhi - 0.3));
    this._zoom = 112;
    this._flying = true;
  }
  focusId(id) { const grp = this._pins && this._pins.get(String(id)); if (grp) this.flyTo(grp); }
  resetView() { this._tRotX = 0.5; this._tRotY = this._g.rotation.y; this._zoom = 160; this._flying = true; }
  setNight(on) {
    if (!this._bMat) return;
    this._bMat.emissiveIntensity = on ? 0.45 : 0.15;
  }
  _bindEvents() {
    const el = this._renderer.domElement;
    let px = 0, py = 0, moved = 0;
    el.addEventListener('pointerdown', (e) => { this._dragging = true; this._flying = false; moved = 0; px = e.clientX; py = e.clientY; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', (e) => {
      if (this._dragging) {
        const dx = e.clientX - px, dy = e.clientY - py;
        moved += Math.abs(dx) + Math.abs(dy);
        this._g.rotation.y += dx * 0.005;
        this._g.rotation.x = Math.max(0.05, Math.min(1.25, this._g.rotation.x + dy * 0.004));
        px = e.clientX; py = e.clientY;
      } else {
        const r = el.getBoundingClientRect();
        this._ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        this._ray.setFromCamera(this._ptr, this._cam);
        const hit = this._ray.intersectObjects(this._heads || [], false)[0];
        const grp = hit ? hit.object.parent : null;
        if (grp !== this._hovGrp) {
          const prev = this._hovGrp;
          this._hovGrp = grp;
          el.style.cursor = grp ? 'pointer' : 'grab';
          if (prev) this._setPinState(prev, String(prev.userData.id) === this.getAttribute('highlight'));
          this._applyHighlight();
          this.dispatchEvent(new CustomEvent('pin-hover', { detail: grp ? grp.userData.id : null, bubbles: true, composed: true }));
        }
      }
    });
    el.addEventListener('pointerup', () => {
      if (this._dragging && moved < 6 && this._hovGrp) {
        const grp = this._hovGrp;
        this.flyTo(grp);
        setTimeout(() => this.dispatchEvent(new CustomEvent('pin-select', { detail: grp.userData.id, bubbles: true, composed: true })), 620);
      }
      this._dragging = false;
    });
    el.addEventListener('pointercancel', () => { this._dragging = false; });
    el.addEventListener('wheel', (e) => { e.preventDefault(); this._flying = false; this._zoom = Math.max(95, Math.min(240, this._zoom + e.deltaY * 0.12)); }, { passive: false });
    el.style.cursor = 'grab';
  }
  _resize() {
    const p = this.parentElement;
    const w = this.clientWidth || (p && p.clientWidth) || 600;
    const h = this.clientHeight || (p && p.clientHeight) || 600;
    this._renderer.setSize(w, h);
    this._cam.aspect = w / h;
    this._cam.updateProjectionMatrix();
  }
}
customElements.define('care-globe', CareGlobe);
})();
