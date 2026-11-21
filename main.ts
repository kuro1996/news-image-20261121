// "THE WORLD TODAY — 21 NOVEMBER 2026"
// Editorial magazine-cover summary of the day's world news, drawn fully
// procedurally (Node 22 stdlib only, no network, deterministic output).
// Stories (verified 21 Nov 2026, AP/BBC/NYT/OneTurn): Russia's mass strike
// on Kyiv (400+ drones, 110 missiles, strikes reaching Poland); global
// markets plunge in an AI sell-off (Nikkei -5.1%, S&P in correction);
// Anthropic's Wall Street debut at ~$2 trillion; a daily pill
// (daraxonrasib) making pancreatic tumours undetectable in trial;
// BepiColombo reaching Mercury orbit; GTA 6's $4.9bn first-day sales.
// Run: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const W = 1024, H = 1024;
const img = Buffer.alloc(W * H * 3);
type RGB = [number, number, number];
const C = {
  cream: [247, 241, 227] as RGB, ink: [16, 18, 28] as RGB,
  red: [198, 34, 28] as RGB, redD: [140, 18, 16] as RGB,
  navy: [13, 22, 48] as RGB, navy2: [24, 38, 78] as RGB,
  gold: [232, 178, 62] as RGB, goldL: [245, 205, 110] as RGB,
  teal: [14, 122, 110] as RGB, tealL: [64, 190, 170] as RGB,
  orange: [240, 120, 32] as RGB, yellow: [255, 196, 66] as RGB,
  white: [255, 255, 255] as RGB, grey: [90, 96, 110] as RGB,
  sky: [52, 84, 138] as RGB, pink: [232, 120, 140] as RGB,
};
function px(x: number, y: number, c: RGB): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3; img[i] = c[0]; img[i + 1] = c[1]; img[i + 2] = c[2];
}
function rect(x: number, y: number, w: number, h: number, c: RGB): void {
  for (let j = Math.max(0, y); j < Math.min(H, y + h); j++)
    for (let i = Math.max(0, x); i < Math.min(W, x + w); i++) px(i, j, c);
}
function vgrad(x: number, y: number, w: number, h: number, a: RGB, b: RGB): void {
  for (let j = 0; j < h; j++) {
    const t = j / Math.max(1, h - 1);
    const c: RGB = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t].map(v => Math.round(v)) as unknown as RGB;
    rect(x, y + j, w, 1, c);
  }
}
function disc(cx: number, cy: number, r: number, c: RGB): void {
  for (let y = Math.floor(cy - r); y <= cy + r; y++)
    for (let x = Math.floor(cx - r); x <= cx + r; x++)
      if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r) px(x, y, c);
}
function ring(cx: number, cy: number, r: number, t: number, c: RGB): void {
  for (let a = 0; a < 360; a += 0.6) {
    const rad = a * Math.PI / 180;
    for (let k = -t / 2; k <= t / 2; k++) px(Math.round(cx + (r + k) * Math.cos(rad)), Math.round(cy + (r + k) * Math.sin(rad)), c);
  }
}
function line(x0: number, y0: number, x1: number, y1: number, th: number, c: RGB): void {
  const d = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let s = 0; s <= d; s++) disc(x0 + (x1 - x0) * s / d, y0 + (y1 - y0) * s / d, th / 2, c);
}
function poly(pts: [number, number][], c: RGB): void {
  let minY = 1e9, maxY = -1e9;
  for (const [, y] of pts) { minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  for (let y = Math.floor(minY); y <= maxY; y++) {
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
      if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) xs.push(x0 + (y - y0) * (x1 - x0) / (y1 - y0));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2)
      for (let x = Math.ceil(xs[k]); x <= xs[k + 1]; x++) px(x, y, c);
  }
}
function starburst(cx: number, cy: number, r: number, c1: RGB, c2: RGB): void {
  for (let k = 0; k < 12; k++) {
    const a = k * Math.PI / 6;
    poly([[cx, cy], [cx + Math.cos(a - 0.12) * r * 0.45, cy + Math.sin(a - 0.12) * r * 0.45], [cx + Math.cos(a) * r, cy + Math.sin(a) * r], [cx + Math.cos(a + 0.12) * r * 0.45, cy + Math.sin(a + 0.12) * r * 0.45]], k % 2 ? c2 : c1);
  }
  disc(cx, cy, r * 0.32, [255, 240, 200]);
}
// Seeded RNG (deterministic)
let seed = 20261121;
function rnd(): number { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }

// ---- 5x7 bitmap font ----
const FONT: Record<string, string[]> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  ',': ['00000', '00000', '00000', '00000', '01100', '00100', '01000'],
  ':': ['00000', '01100', '01100', '00000', '01100', '01100', '00000'],
  '-': ['00000', '00000', '00000', '01110', '00000', '00000', '00000'],
  "'": ['00100', '00100', '01000', '00000', '00000', '00000', '00000'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'],
  $: ['00100', '01111', '10100', '01110', '00101', '11110', '00100'],
  '+': ['00000', '00100', '00100', '01110', '00100', '00100', '00000'],
  '(': ['00010', '00100', '01000', '01000', '01000', '00100', '00010'],
  ')': ['01000', '00100', '00010', '00010', '00010', '00100', '01000'],
  '&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
  '\u2022': ['00000', '00000', '01100', '01100', '01100', '00000', '00000'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
};
function textW(s: string, sc: number): number { return s.length * 6 * sc - sc; }
function drawText(s: string, x: number, y: number, sc: number, c: RGB): void {
  let cx = x;
  for (const ch of s.toUpperCase()) {
    const g = FONT[ch] ?? FONT[' '];
    for (let r = 0; r < 7; r++) for (let col = 0; col < 5; col++)
      if (g[r][col] === '1') rect(cx + col * sc, y + r * sc, sc, sc, c);
    cx += 6 * sc;
  }
}
function drawTextC(s: string, cx: number, y: number, sc: number, c: RGB): void {
  drawText(s, Math.round(cx - textW(s, sc) / 2), y, sc, c);
}
// Wrap text into lines that fit maxW, at scale sc
function wrap(s: string, sc: number, maxW: number): string[] {
  const words = s.split(' '); const lines: string[] = []; let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (textW(t, sc) <= maxW) cur = t; else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ================= COMPOSITION =================
rect(0, 0, W, H, C.cream);

// ---- Masthead ----
drawTextC('THE WORLD TODAY', 512, 18, 9, C.ink);
rect(24, 96, 976, 5, C.red);
drawTextC('SATURDAY  \u2022  21 NOVEMBER 2026  \u2022  FIVE STORIES THAT SHOOK THE DAY', 512, 112, 2, C.redD);

// ---- HERO: Kyiv under fire (y 140..556) ----
const HX = 16, HY = 140, HW = 992, HH = 416;
vgrad(HX, HY, HW, HH, [8, 12, 30], C.navy2);
// stars
for (let i = 0; i < 90; i++) disc(HX + 8 + rnd() * (HW - 16), HY + 6 + rnd() * 170, rnd() < 0.2 ? 2 : 1, [200, 210, 235]);
// moon
disc(920, 196, 34, [240, 232, 200]); disc(908, 188, 7, [210, 200, 170]); disc(932, 206, 5, [210, 200, 170]);
// Kyiv skyline silhouette
const skyline: [number, number, number][] = [[0, 180, 90], [95, 150, 70], [170, 200, 110], [285, 130, 80], [370, 190, 100], [475, 140, 70], [550, 200, 110], [665, 150, 80], [750, 195, 95], [850, 160, 75], [930, 190, 62]];
for (const [bx, bw, bh] of skyline) {
  rect(HX + bx, HY + HH - bh - 118, bw, bh + 118, [20, 26, 46]);
  // lit windows
  for (let wy = HY + HH - bh - 100; wy < HY + HH - 130; wy += 16)
    for (let wx = HX + bx + 10; wx < HX + bx + bw - 8; wx += 18)
      if (rnd() < 0.35) rect(wx, wy, 5, 7, [255, 196, 90]);
}
// explosions over the skyline
starburst(740, 330, 42, C.orange, C.yellow);
starburst(880, 300, 34, C.orange, C.yellow);
starburst(950, 368, 24, C.orange, C.yellow);
// missile trails (diagonal, glowing)
const trails: [number, number, number, number][] = [[620, 148, 740, 320], [800, 148, 880, 290], [910, 148, 950, 358], [520, 148, 700, 340]];
for (const [x0, y0, x1, y1] of trails) {
  line(x0, y0, x1, y1, 7, [120, 70, 40]); line(x0, y0, x1, y1, 3, C.orange);
  disc(x1, y1, 9, C.yellow); disc(x0, y0, 4, C.white);
}
// ground glow
vgrad(HX, HY + HH - 118, HW, 118, [10, 13, 26], [52, 20, 16]);
// small fires on the foreground
disc(210, 522, 11, C.orange); disc(210, 522, 6, C.yellow);
disc(700, 512, 13, C.orange); disc(700, 512, 7, C.yellow);
disc(880, 528, 8, C.orange); disc(880, 528, 4, C.yellow);
// red tag + headline
rect(HX + 24, HY + 22, 252, 34, C.red);
drawText('WAR IN EUROPE', HX + 38, HY + 31, 3, C.white);
drawText('KYIV UNDER FIRE', HX + 24, HY + 66, 10, C.white);
drawText('400+ DRONES  \u2022  110 MISSILES', HX + 26, HY + 148, 4, C.goldL);
drawText("RUSSIA'S BIGGEST STRIKE", HX + 26, HY + 178, 4, C.white);
drawText('HITS BRIDGES, CUTS POWER', HX + 26, HY + 208, 4, C.white);
drawText('STRIKES REACH POLAND', HX + 26, HY + 238, 4, C.goldL);

// ---- THREE PANELS (y 572..836) ----
const PY = 572, PH = 264, PW = 320, GAP = 16;
// A) MARKETS — red chart plunge on cream
const AX = 16;
rect(AX, PY, PW, PH, [255, 255, 255]); rect(AX, PY, PW, 4, C.red);
drawText('MARKETS', AX + 20, PY + 18, 4, C.red);
drawText('PLUNGE', AX + 20, PY + 48, 8, C.ink);
drawText('AI SELL-OFF', AX + 20, PY + 112, 4, C.ink);
drawText('S&P IN CORRECTION', AX + 20, PY + 144, 3, C.ink);
// chart
const cx0 = AX + 20, cy0 = PY + 170, cw = 280, ch = 58;
rect(cx0, cy0, cw, 1, C.grey); rect(cx0, cy0, 1, ch, C.grey);
const pts: [number, number][] = [[0, 5], [35, 9], [70, 7], [105, 18], [140, 16], [175, 30], [210, 36], [245, 44], [280, 52]];
for (let i = 0; i + 1 < pts.length; i++) {
  line(cx0 + pts[i][0], cy0 + pts[i][1], cx0 + pts[i + 1][0], cy0 + pts[i + 1][1], 5, C.red);
  poly([[cx0 + pts[i][0], cy0 + pts[i][1]], [cx0 + pts[i + 1][0], cy0 + pts[i + 1][1]], [cx0 + pts[i + 1][0], cy0 + ch], [cx0 + pts[i][0], cy0 + ch]], [248, 200, 196]);
  line(cx0 + pts[i][0], cy0 + pts[i][1], cx0 + pts[i + 1][0], cy0 + pts[i + 1][1], 5, C.red);
}
disc(cx0 + 280, cy0 + 52, 7, C.red);
drawText('NIKKEI -5.1%', AX + 20, PY + 236, 4, C.redD);
// B) ANTHROPIC — dark teal + gold $2T
const BX = AX + PW + GAP;
rect(BX, PY, PW, PH, [10, 42, 44]); rect(BX, PY, PW, 4, C.gold);
drawText('WALL STREET', BX + 20, PY + 18, 4, C.goldL);
drawText('$2', BX + 20, PY + 44, 12, C.gold);
drawText('TRILLION', BX + 20, PY + 136, 5, C.white);
drawText('ANTHROPIC DEBUTS', BX + 20, PY + 178, 3, C.white);
drawText('AS A $2 TRILLION COMPANY', BX + 20, PY + 206, 2, C.tealL);
rect(BX + 20, PY + 232, 280, 4, C.gold);
// C) CANCER PILL — teal hope, big capsule
const CX = BX + PW + GAP;
rect(CX, PY, PW, PH, [232, 245, 240]); rect(CX, PY, PW, 4, C.teal);
drawText('HOPE', CX + 20, PY + 18, 4, C.teal);
drawText('A PILL AGAINST', CX + 20, PY + 48, 3, C.ink);
drawText('CANCER', CX + 20, PY + 76, 8, C.teal);
// capsule: two halves
const capY = PY + 168, capX = CX + 46;
rect(capX, capY, 110, 44, C.white); disc(capX, capY + 22, 22, C.white); disc(capX + 110, capY + 22, 22, C.teal);
rect(capX + 55, capY, 55, 44, C.teal); disc(capX + 110, capY + 22, 22, C.teal);
drawText('TUMOURS VANISH', CX + 20, PY + 222, 3, C.ink);
drawText('PANCREATIC TRIAL', CX + 20, PY + 240, 3, C.ink);

// ---- BOTTOM STRIP (y 852..962): Mercury + GTA 6 ----
const SY = 852, SH = 110;
rect(16, SY, 992, SH, C.ink);
// Mercury (left)
disc(86, SY + 55, 38, [176, 148, 120]); disc(76, SY + 42, 8, [140, 112, 88]); disc(100, SY + 66, 6, [140, 112, 88]); disc(92, SY + 48, 4, [150, 122, 96]);
ring(86, SY + 55, 52, 3, C.gold);
disc(150, SY + 18, 5, C.gold);
drawText('SPACE', 150, SY + 16, 3, C.goldL);
drawText('BEPICOLOMBO REACHES', 140, SY + 38, 3, C.white);
drawText('MERCURY ORBIT', 140, SY + 64, 3, C.white);
rect(486, SY + 14, 2, SH - 28, [70, 76, 92]);
// GTA 6 (right)
disc(560, SY + 55, 30, C.pink); disc(560, SY + 55, 22, [40, 16, 40]);
drawText('$', 548, SY + 38, 5, C.goldL);
drawText('POP CULTURE', 610, SY + 16, 3, C.pink);
drawText('GTA 6: $4.9 BILLION', 610, SY + 38, 3, C.white);
drawText('IN ITS FIRST DAY', 610, SY + 64, 3, C.white);

// ---- Footer ----
drawTextC('SOURCES: AP  \u2022  BBC  \u2022  NYT  \u2022  REUTERS  -  21 NOVEMBER 2026', 512, 978, 2, C.grey);
rect(24, 1004, 976, 2, C.ink);

// ================= PNG ENCODE (deterministic) =================
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcTable[n] = c; }
function crc32(b: Buffer): number { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0); out.write(type, 4, 'ascii'); data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])), 8 + data.length);
  return out;
}
const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) { raw[y * (1 + W * 3)] = 0; img.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3); }
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
]);
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), png);
console.log('wrote', join(outDir, 'entry.png'), png.length, 'bytes,', W + 'x' + H);
