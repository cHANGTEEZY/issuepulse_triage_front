/**
 * Nest: a woven nest holding a clutch of five eggs, IssueNest's inbox. The egg
 * under the pointer stands upright and lifts clear of the clutch; the eggs
 * near it lean back, staggered outwards by distance. The read-out names the
 * issue. The slider is the lift, in world units.
 *
 * The pattern: discrete items, as Riffle. Tweens, a stagger by distance, and a
 * hit test against the eggs' resting centres, so a lifting egg cannot move out
 * from under the pointer.
 */
const {
  Cam, circ, clamp, facing, fit, hull, open, poly, proj, rad, ringAt, run,
  tdone, tset, tval, tween, disposer, mk, pointer, reflect, register,
} = HL;

const R0 = 34, R1 = 55, ZB = 8, RO = 51, RI = 43, H = 16, FLOOR = 9, EA = 10, EC = 14;
const EGGS = [
  { n: 1, x: 2, y: 0, tilt: 66, dir: 30 },
  { n: 2, x: -18, y: -13, tilt: 80, dir: 205 },
  { n: 3, x: 15, y: -19, tilt: 60, dir: 125 },
  { n: 4, x: -15, y: 17, tilt: 76, dir: 300 },
  { n: 5, x: 20, y: 12, tilt: 56, dir: 250 },
];
const LEAN = 30, SINK = 4, REACH = 40, STEP = 45, HIT = 26;
const TWIGS = [
  [-150, 13, 5, 4], [-95, 10, 7, -3], [-20, 12, 4, 3], [140, 9, 5, 3],
];

const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());

/** A horizontal ring that wanders a little, so a band reads as coiled grass rather than a turned line. */
function band(r, phase) {
  return circ(r, 40).map((q) => {
    const k = 1 + 0.035 * Math.sin(Math.atan2(q.v, q.u) * 5 + phase);
    return { u: q.u * k, v: q.v * k, nu: q.nu, nv: q.nv };
  });
}

/** An egg's surface, sampled: blunt below, pointed above, its long axis tilted `t` degrees toward `dir`, standing on z0. */
function eggPoints(e, t, z0) {
  const tr = rad(t), dr = rad(e.dir), ct = Math.cos(tr), st = Math.sin(tr);
  const w = [st * Math.cos(dr), st * Math.sin(dr), ct];
  const u = [ct * Math.cos(dr), ct * Math.sin(dr), -st];
  const v = [-Math.sin(dr), Math.cos(dr), 0];
  const zc = z0 + Math.hypot(EC * ct, EA * st);
  const pts = [];
  for (let i = 0; i <= 12; i++) {
    const th = (i / 12) * Math.PI, along = EC * Math.cos(th), r = EA * Math.sin(th) * (1 - 0.12 * Math.cos(th));
    for (let j = 0; j < 18; j++) {
      const ph = (j / 18) * Math.PI * 2, a = r * Math.cos(ph), b = r * Math.sin(ph);
      pts.push([e.x + a * u[0] + b * v[0] + along * w[0], e.y + a * u[1] + b * v[1] + along * w[1], zc + a * u[2] + along * w[2]]);
    }
  }
  return { pts, zc };
}

/** A twig: three points from inside the rim out past it, bending once. */
function twig(P, [deg, len, rise, bend]) {
  const a = rad(deg), c = Math.cos(a), s = Math.sin(a), nx = -s, ny = c;
  const at = (r, z, off) => P(r * c + off * nx, r * s + off * ny, z);
  return { far: c + s < 0, d: open([at(RO - 2, H - 2, 0), at(RO + len * 0.5, H + rise * 0.6, bend), at(RO + len, H + rise, bend * 0.4)]) };
}

/** The radius of the nest's outer wall at height z: a narrow foot, a full belly, a rim drawn in. */
const wall = (z) => (z <= ZB ? R0 + (R1 - R0) * Math.sin((z / ZB) * (Math.PI / 2)) : R1 - (R1 - RO) * ((z - ZB) / (H - ZB)) ** 2);

/** The hull's lower chain, left to right: the near half of the silhouette. */
function lower(pts) {
  const h = hull(pts), n = h.length;
  let l = 0, r = 0;
  h.forEach((p, i) => { if (p[0] < h[l][0]) l = i; if (p[0] > h[r][0]) r = i; });
  const walk = (a, b) => { const out = []; for (let i = a; ; i = (i + 1) % n) { out.push(h[i]); if (i === b) return out; } };
  const one = walk(l, r), two = walk(r, l).reverse();
  const mean = (c) => c.reduce((s, p) => s + p[1], 0) / c.length;
  return mean(one) > mean(two) ? one : two;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value;

  const C = Cam(45, 0.5, 2.3);
  const extreme = EGGS.map((e) => [e.x, e.y, FLOOR + 2 * EC + 34]);
  fit(C, [[-R1, -R1, 0], [R1, R1, 0], [R1, -R1, 0], [-R1, R1, 0], [-R1, -R1, H], ...extreme], 200, 170);
  const P = proj(C), front = facing(C);

  const foot = circ(R0, 40), outer = circ(RO, 40), inner = circ(RI, 40), bed = circ(RI - 12, 40);
  const body = [];
  for (let k = 0; k <= 8; k++) { const z = (k / 8) * H; body.push(...ringAt(P, circ(wall(z), 40), z)); }
  const g = mk("g", {}, svg);
  reflect(svg, g, P, front, foot, 0, 12);

  const twigs = TWIGS.map((t) => twig(P, t));
  for (const t of twigs) if (t.far) mk("path", { d: t.d, class: "nf" }, g);
  mk("path", { d: poly(hull(body)), class: "sil" }, g);
  mk("path", { d: open(ringAt(P, run(outer, (q) => !front(q)), H)), class: "nf lo" }, g);
  mk("path", { d: poly(ringAt(P, inner, H)), class: "nf" }, g);
  mk("path", { d: open(ringAt(P, run(inner, (q) => !front(q)), H - 4)), class: "nf lo" }, g);
  mk("path", { d: open(ringAt(P, run(bed, (q) => !front(q)), FLOOR)), class: "nf lo" }, g);

  const order = EGGS.map((e, i) => i).sort((a, b) => EGGS[a].x + EGGS[a].y - (EGGS[b].x + EGGS[b].y));
  const eggs = EGGS.map((e) => ({ e, el: null, t: tween(e.tilt), z: tween(0), last: "" }));
  for (const i of order) eggs[i].el = mk("path", { class: "sil" }, g);

  const iF = LR(ringAt(P, run(inner, front), H)), oT = LR(ringAt(P, run(outer, front), H)), near = lower(body);
  mk("path", { d: poly([...iF, ...near.slice().reverse()]), class: "fo" }, g);
  [10, 12.5, 14.6].forEach((h, k) => {
    const ring = band(wall(h) - 0.6, k * 1.7);
    mk("path", { d: open(LR(ringAt(P, run(ring, front), h))), class: "nf lo" }, g);
  });
  mk("path", { d: open(oT), class: "nf lo" }, g);
  mk("path", { d: open(iF), class: "nf" }, g);
  mk("path", { d: open(near), class: "nf sil" }, g);
  for (const t of twigs) if (!t.far) mk("path", { d: t.d, class: "nf" }, g);

  const rest = EGGS.map((e) => P(e.x, e.y, eggPoints(e, e.tilt, FLOOR).zc));
  function hit([x, y]) {
    let best = -1, bd = HIT;
    rest.forEach(([sx, sy], i) => { const d = Math.hypot(x - sx, y - sy); if (d < bd) { bd = d; best = i; } });
    return best;
  }

  function draw(egg, now) {
    const t = tval(egg.t, now), z = tval(egg.z, now);
    const d = poly(hull(eggPoints(egg.e, t, FLOOR + z).pts.map((p) => P(p[0], p[1], p[2]))));
    if (d !== egg.last) { egg.el.setAttribute("d", d); egg.last = d; }
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const egg of eggs) { draw(egg, now); if (!tdone(egg.t, now) || !tdone(egg.z, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  let act = -1;
  const mark = (a) => eggs.forEach((egg, i) => egg.el.classList.toggle("hi", a < 0 ? i === 0 : i === a));
  function setActive(a, force) {
    if (a === act && !force) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    const fx = from >= 0 ? EGGS[from].x : 0, fy = from >= 0 ? EGGS[from].y : 0;
    eggs.forEach((egg, i) => {
      const dist = Math.hypot(egg.e.x - fx, egg.e.y - fy), delay = Math.round((dist / 10) * STEP);
      const near = clamp(1 - dist / REACH, 0, 1);
      const t = a < 0 ? egg.e.tilt : i === a ? 0 : clamp(egg.e.tilt + LEAN * near, 0, 88);
      tset(egg.t, t, now, delay);
      tset(egg.z, a < 0 ? 0 : i === a ? lift : -SINK * near, now, delay);
    });
    mark(a);
    read.textContent = a < 0 ? "rest" : "issue " + EGGS[a].n;
    B.wake();
  }
  mark(-1);

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = v; if (act >= 0) setActive(act, true); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "nest",
  means: "A woven nest holding five eggs: the one under the pointer stands up and lifts clear, and the eggs beside it lean back.",
  rules: [1, 2, 5, 9],
  range: [14, 24, 34],
  tour: [[255, 150], [148, 162], [213, 186], null],
  mount,
});
