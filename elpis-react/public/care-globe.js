// A real interactive 3D globe (drag to spin, scroll to zoom, hover/click pins)
// built on Three.js, loaded at runtime from a free CDN (jsdelivr) — not a
// bundled npm dependency, so it adds zero build size, only a one-time
// network fetch the first time this element mounts.
//
// Recolored from its original dark navy/teal/coral palette to match Elpis's
// warm ivory/gold theme (only literal color constants below — no behavior
// changed). Data is supplied entirely via the `data-hospitals` attribute
// (real bearing/distance computed by the caller) — this file has no
// knowledge of any specific hospital and fabricates nothing.
(() => {
if (customElements.get('care-globe')) return;
const R = 60, PHI0 = 0.06, PHIMAX = 0.5, MAX_RADIUS_MI = 100;
class CareGlobe extends HTMLElement {
  static get observedAttributes() { return ['data-hospitals', 'radius', 'highlight']; }
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
    if (name === 'data-hospitals') this._buildPins();
    else if (name === 'radius') this._buildRing();
    else if (name === 'highlight') this._applyHighlight();
  }
  disconnectedCallback() {
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._ro) this._ro.disconnect();
    if (this._renderer) this._renderer.dispose();
  }
  _pos(T, phi, theta, r) {
    return new T.Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)).multiplyScalar(r);
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
    const globe = new T.Mesh(new T.SphereGeometry(R, 48, 48), new T.MeshStandardMaterial({ color: 0xeae7e7, roughness: 0.9, metalness: 0.05 }));
    g.add(globe);
    const wire = new T.Mesh(new T.SphereGeometry(R + 0.15, 28, 28), new T.MeshBasicMaterial({ color: 0xb68235, wireframe: true, transparent: true, opacity: 0.08 }));
    g.add(wire);
    // lat/meridian guide lines
    const lineMat = new T.LineBasicMaterial({ color: 0x201f1d, transparent: true, opacity: 0.12 });
    [0.18, 0.34, PHI0 + PHIMAX].forEach((phi) => {
      const pts = [];
      for (let i = 0; i <= 90; i++) pts.push(this._pos(T, phi, (i / 90) * Math.PI * 2, R + 0.25));
      g.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(pts), lineMat));
    });
    for (let m = 0; m < 6; m++) {
      const th = (m / 6) * Math.PI * 2, pts = [];
      for (let i = 0; i <= 40; i++) pts.push(this._pos(T, (i / 40) * 0.62, th, R + 0.25));
      g.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), lineMat));
    }
    // buildings scattered on the upper cap — purely decorative texture, not real data
    const bMat = new T.MeshStandardMaterial({ color: 0xd7d3d3, roughness: 0.8, metalness: 0.1, emissive: 0xb68235, emissiveIntensity: 0.15 });
    let seed = 12345;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 130; i++) {
      const phi = 0.05 + rnd() * 0.58, theta = rnd() * Math.PI * 2;
      const h = 1.5 + rnd() * rnd() * 6, w = 0.8 + rnd() * 1.6;
      const b = new T.Mesh(new T.BoxGeometry(w, h, 0.8 + rnd() * 1.6), bMat);
      const n = this._pos(T, phi, theta, 1);
      b.position.copy(n).multiplyScalar(R);
      b.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), n);
      b.position.addScaledVector(n, h / 2);
      g.add(b);
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
    this._pinGroup = new T.Group();
    g.add(this._pinGroup);
    this._ringGroup = new T.Group();
    g.add(this._ringGroup);
    this._ray = new T.Raycaster();
    this._ptr = new T.Vector2(-2, -2);
    this._ready = true;
    this._buildPins();
    this._buildRing();
    this._bindEvents();
    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(this);
    this._resize();
    const tick = (t) => {
      this._raf = requestAnimationFrame(tick);
      if (!this._dragging && !this._hovered) g.rotation.y += 0.0012;
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
  _buildPins() {
    if (!this._ready) return;
    const T = this.T, pg = this._pinGroup;
    while (pg.children.length) { const c = pg.children[0]; pg.remove(c); }
    this._heads = [];
    let list = [];
    try { list = JSON.parse(this.getAttribute('data-hospitals') || '[]'); } catch (e) {}
    list.forEach((h) => {
      const phi = PHI0 + (h.d / MAX_RADIUS_MI) * PHIMAX, theta = h.a;
      const n = this._pos(T, phi, theta, 1);
      const grp = new T.Group();
      const stem = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 7, 8), new T.MeshBasicMaterial({ color: 0xb68235, transparent: true, opacity: 0.7 }));
      stem.position.copy(n).multiplyScalar(R + 3.5);
      stem.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), n);
      const head = new T.Mesh(new T.SphereGeometry(1.6, 18, 18), new T.MeshStandardMaterial({ color: 0xb68235, emissive: 0xb68235, emissiveIntensity: 0.6 }));
      head.position.copy(n).multiplyScalar(R + 7.6);
      head.userData.id = h.id;
      const label = this._makeLabel(h.s + ' · ' + h.dl, 'rgba(243,242,242,0.95)', '#201f1d');
      label.position.copy(n).multiplyScalar(R + 14);
      label.visible = false;
      grp.add(stem, head, label);
      grp.userData = { id: h.id, head, label };
      pg.add(grp);
      this._heads.push(head);
    });
    this._applyHighlight();
  }
  _buildRing() {
    if (!this._ready) return;
    const T = this.T, rg = this._ringGroup;
    while (rg.children.length) rg.remove(rg.children[0]);
    const radius = parseFloat(this.getAttribute('radius') || '15');
    const phi = PHI0 + (radius / MAX_RADIUS_MI) * PHIMAX;
    const pts = [];
    for (let i = 0; i <= 120; i++) pts.push(this._pos(T, phi, (i / 120) * Math.PI * 2, R + 0.6));
    rg.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: 0xb68235, transparent: true, opacity: 0.85 })));
    // soft cap fill
    const capGeo = new T.SphereGeometry(R + 0.35, 48, 24, 0, Math.PI * 2, 0, phi);
    rg.add(new T.Mesh(capGeo, new T.MeshBasicMaterial({ color: 0xb68235, transparent: true, opacity: 0.07, depthWrite: false })));
  }
  _setPinState(grp, on) {
    grp.userData.head.scale.setScalar(on ? 1.5 : 1);
    grp.userData.head.material.color.set(on ? 0xffffff : 0xb68235);
    grp.userData.label.visible = on;
  }
  _applyHighlight() {
    if (!this._pinGroup) return;
    const hl = this.getAttribute('highlight');
    this._pinGroup.children.forEach((grp) => this._setPinState(grp, String(grp.userData.id) === hl || grp === this._hovGrp));
  }
  _bindEvents() {
    const el = this._renderer.domElement;
    let px = 0, py = 0, moved = 0;
    el.addEventListener('pointerdown', (e) => { this._dragging = true; moved = 0; px = e.clientX; py = e.clientY; el.setPointerCapture(e.pointerId); });
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
          this._hovGrp = grp;
          this._hovered = !!grp;
          el.style.cursor = grp ? 'pointer' : 'grab';
          this._applyHighlight();
          this.dispatchEvent(new CustomEvent('pin-hover', { detail: grp ? grp.userData.id : null, bubbles: true, composed: true }));
        }
      }
    });
    const end = () => {
      if (this._dragging && moved < 6 && this._hovGrp) {
        this.dispatchEvent(new CustomEvent('pin-select', { detail: this._hovGrp.userData.id, bubbles: true, composed: true }));
      }
      this._dragging = false;
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', () => { this._dragging = false; });
    el.addEventListener('wheel', (e) => { e.preventDefault(); this._zoom = Math.max(95, Math.min(240, this._zoom + e.deltaY * 0.12)); }, { passive: false });
    el.style.cursor = 'grab';
  }
  _resize() {
    const w = this.clientWidth || 600, h = this.clientHeight || 600;
    this._renderer.setSize(w, h);
    this._cam.aspect = w / h;
    this._cam.updateProjectionMatrix();
  }
}
customElements.define('care-globe', CareGlobe);
})();
