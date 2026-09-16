import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, drawPixel) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  function crc32(buf) {
    let c = -1;
    for (let i = 0; i < buf.length; i++) {
      c = table[(c ^ buf[i]) & 255] ^ (c >>> 8);
    }
    return c ^ -1;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(len + 12);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crc = crc32(buf.subarray(4, len + 8));
    buf.writeInt32BE(crc, len + 8);
    return buf;
  }

  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawPixel(x, y, width, height);
      raw[pxOffset] = r;
      raw[pxOffset + 1] = g;
      raw[pxOffset + 2] = b;
      raw[pxOffset + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(raw, { level: 9 });
  const idat = makeChunk('IDAT', idatData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idat, iend]);
}

function renderUmarFarooqAppIcon(isMaskable = false) {
  return (x, y, w, h) => {
    const nx = x / w;
    const ny = y / h;

    // Corner rounding for standard app icon
    if (!isMaskable) {
      const cornerRadius = 0.22;
      const dx = Math.max(0, Math.max(cornerRadius - nx, nx - (1 - cornerRadius)));
      const dy = Math.max(0, Math.max(cornerRadius - ny, ny - (1 - cornerRadius)));
      if (dx * dx + dy * dy > cornerRadius * cornerRadius) {
        return [0, 0, 0, 0]; // Transparent outside squircle
      }
    }

    // Gradient Background from top-left (#0369a1) to bottom-right (#0b0f19)
    const diag = (nx + ny) / 2;
    let bgR = Math.round(3 + (14 - 3) * (1 - diag));
    let bgG = Math.round(105 + (165 - 105) * (1 - diag));
    let bgB = Math.round(161 + (233 - 161) * (1 - diag));

    // Dark cyber center
    const centerDist = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2);
    if (centerDist < 0.45) {
      const factor = (0.45 - centerDist) / 0.45;
      bgR = Math.round(bgR * (1 - factor * 0.7) + 11 * factor * 0.7);
      bgG = Math.round(bgG * (1 - factor * 0.7) + 15 * factor * 0.7);
      bgB = Math.round(bgB * (1 - factor * 0.7) + 25 * factor * 0.7);
    }

    // Phone geometry inside icon (centered)
    const phoneX1 = 0.28, phoneX2 = 0.72;
    const phoneY1 = 0.18, phoneY2 = 0.82;
    const borderThickness = 0.035;

    const inPhoneOuter = nx >= phoneX1 && nx <= phoneX2 && ny >= phoneY1 && ny <= phoneY2;
    const inPhoneInner =
      nx >= phoneX1 + borderThickness &&
      nx <= phoneX2 - borderThickness &&
      ny >= phoneY1 + borderThickness &&
      ny <= phoneY2 - borderThickness;

    // Phone Outer Frame
    if (inPhoneOuter && !inPhoneInner) {
      return [56, 189, 248, 255]; // Accent Cyan #38bdf8
    }

    // Inside phone screen
    if (inPhoneInner) {
      // Notch at top
      if (ny >= phoneY1 + borderThickness && ny <= phoneY1 + borderThickness + 0.04 && nx >= 0.42 && nx <= 0.58) {
        return [15, 23, 42, 255]; // Notch
      }

      // Home bar at bottom
      if (ny >= phoneY2 - borderThickness - 0.03 && ny <= phoneY2 - borderThickness - 0.015 && nx >= 0.40 && nx <= 0.60) {
        return [56, 189, 248, 255];
      }

      // Glowing Badge / Mobile Signal Wave in Center
      const screenDx = Math.abs(nx - 0.5);
      const screenDy = Math.abs(ny - 0.5);

      // Diamond or Star Logo in center
      if (screenDx + screenDy < 0.12) {
        return [255, 255, 255, 255]; // White Core
      }
      if (screenDx + screenDy < 0.15) {
        return [56, 189, 248, 255]; // Cyan Glow
      }

      return [18, 26, 43, 255]; // Deep Blue Screen
    }

    // Subtle outer border highlight
    return [bgR, bgG, bgB, 255];
  };
}

const outDir = path.resolve('public');

console.log('Generating PWA icons in public directory...');

const icon192 = createPng(192, 192, renderUmarFarooqAppIcon(false));
fs.writeFileSync(path.join(outDir, 'icon-192.png'), icon192);
console.log('Created public/icon-192.png');

const icon512 = createPng(512, 512, renderUmarFarooqAppIcon(false));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), icon512);
console.log('Created public/icon-512.png');

const iconMaskable192 = createPng(192, 192, renderUmarFarooqAppIcon(true));
fs.writeFileSync(path.join(outDir, 'icon-maskable-192.png'), iconMaskable192);
console.log('Created public/icon-maskable-192.png');

const iconMaskable512 = createPng(512, 512, renderUmarFarooqAppIcon(true));
fs.writeFileSync(path.join(outDir, 'icon-maskable-512.png'), iconMaskable512);
console.log('Created public/icon-maskable-512.png');

const appleTouchIcon = createPng(180, 180, renderUmarFarooqAppIcon(false));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), appleTouchIcon);
console.log('Created public/apple-touch-icon.png');

// Also create a crisp vector SVG icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="60%" stop-color="#0b0f19"/>
      <stop offset="100%" stop-color="#031525"/>
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="115" fill="url(#bgGrad)"/>
  <rect x="140" y="85" width="232" height="342" rx="36" fill="#121a2b" stroke="url(#cyanGrad)" stroke-width="14" filter="url(#glow)"/>
  <rect x="216" y="105" width="80" height="16" rx="8" fill="#0b0f19"/>
  <circle cx="280" cy="113" r="4" fill="#38bdf8"/>
  <circle cx="256" cy="256" r="45" fill="none" stroke="#38bdf8" stroke-width="8"/>
  <polygon points="256,220 286,270 226,270" fill="url(#cyanGrad)"/>
  <text x="256" y="325" font-family="'Outfit', sans-serif" font-size="28" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="2">MOBILE</text>
  <text x="256" y="352" font-family="'Outfit', sans-serif" font-size="18" font-weight="600" fill="#38bdf8" text-anchor="middle" letter-spacing="4">ZONE</text>
  <rect x="206" y="398" width="100" height="6" rx="3" fill="#38bdf8"/>
</svg>`;
fs.writeFileSync(path.join(outDir, 'icon.svg'), svgIcon);
console.log('Created public/icon.svg');

console.log('All PWA icons generated successfully!');
