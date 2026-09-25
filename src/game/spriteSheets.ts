import { Direction, AnimState } from '../types';

export const PALETTE = {
  // Hair (Moonlighter Will white messy bushy hair with layered depth)
  hairLight: '#ffffff',
  hairMid: '#e4e7ee',
  hairShadow: '#a6adbc',
  hairDeep: '#6c7485',

  // Skin (Clean stylized tones)
  skinLight: '#ffe2c8',
  skinMid: '#f0b78e',
  skinShadow: '#c4845a',

  // Eye (Luminescent cyan / turquoise eye with deep shadow cavity)
  eyeDark: '#0b1619',
  eyeGlint: '#67e8f9',
  eyeCore: '#ffffff',

  // Cloak (Deep burgundy velvet & carmine folds matching the cohesive reference image)
  cloakHighlight: '#b91c1c',
  cloakLight: '#991b1b',
  cloakMid: '#7f1d1d',
  cloakShadow: '#5c1015',
  cloakDeep: '#3b080d',
  cloakLining: '#200508',
  cloakHoodFold: '#681318',
  cloakHoodLining: '#150305',
  cloakTrim: '#eab308',
  cloakTrimShadow: '#a16207',
  cloakClasp: '#facc15',
  cloakClaspShadow: '#a16207',
  cloakClaspGem: '#38bdf8',

  // Legacy pack color aliases (safeguard)
  packHighlight: '#b91c1c',
  packMid: '#7f1d1d',
  packShadow: '#5c1015',
  packDeep: '#3b080d',
  packStrap: '#5c1015',
  packBuckle: '#facc15',
  packBedroll: '#a16207',
  packBedrollLight: '#eab308',
  packBedrollShadow: '#3b080d',

  // Undergarment Tunic / Inner Robe (Sleek dark obsidian tunic with golden belt buckle)
  tunicLight: '#262626',
  tunicMid: '#171717',
  tunicShadow: '#0a0a0a',
  tunicUndershirt: '#e5e5e5',
  tunicUndershirtShadow: '#a3a3a3',

  // Belt (Warm golden ochre leather band with gilded brass buckle)
  belt: '#b45309',
  beltLight: '#f59e0b',
  beltBuckle: '#fef08a',
  pants: '#171717',
  pantsShadow: '#0a0a0a',

  // Boots (Warm caramel leather boots matching reference image)
  bootHighlight: '#b45309',
  bootMid: '#854d0e',
  bootShadow: '#543108',
  bootSole: '#201005',

  // Sword
  bladeEdge: '#ffffff',
  bladeLight: '#e4f4f7',
  bladeMid: '#8ea6b8',
  bladeShadow: '#536d80',
  bladeDeep: '#233947',
  bladeOutline: '#203340',
  swordGuard: '#f5c342',
  swordGuardShadow: '#b0811a',
  swordGrip: '#48250c',
  swordPommel: '#f5c342',

  // Slash Arc FX (Luminescent teal crescent like Moonlighter dungeon essence)
  slashCore: '#ffffff',
  slashGlow: '#6df2e2',
  slashMid: '#2fb8a9',
  slashTrail: 'rgba(40, 160, 150, 0.4)',

  // Bow & Arrow
  bowWood: '#82461d',
  bowWoodLight: '#ab6533',
  bowWoodDark: '#4a250c',
  bowGrip: '#233947',
  bowString: '#e0f4f4',
  arrowShaft: '#c2854e',
  arrowShaftShadow: '#8a4c1f',
  arrowHead: '#ffffff',
  arrowHeadShadow: '#8ea6b8',
  arrowFletch: '#48b8aa',

  // Enemy (Moonlighter Forest Slime Golem)
  slimeDark: '#102e2b',
  slimeShadow: '#16524b',
  slimeMid: '#228377',
  slimeLight: '#3ec7b5',
  slimeHighlight: '#83f5e3',
  slimeEye: '#0f2425',
  slimeHorn: '#f59e0b',
  slimeHornLight: '#fde047',
  slimeFoot: '#382516',

  // Shadow
  shadow: 'rgba(10, 28, 30, 0.48)',
};

export const SPRITE_WIDTH = 56;
export const SPRITE_HEIGHT = 52;
export const PIVOT_X = 26;
export const PIVOT_Y = 38;

export const ENEMY_WIDTH = 36;
export const ENEMY_HEIGHT = 32;
export const ENEMY_PIVOT_X = 18;
export const ENEMY_PIVOT_Y = 24;

// Helper to fill rectangle pixels on canvas
function p(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
}

/**
 * Draws the character facing RIGHT (East).
 * If facing LEFT (West), canvas is flipped horizontally.
 */
function drawSideSprite(
  ctx: CanvasRenderingContext2D,
  anim: AnimState,
  frame: number
) {
  let headY = 0;
  let cloakY = 0;
  let cloakBillowX = 0;
  let cloakFlutterY = 0;
  let hairBobY = 0;
  let hairSwayX = 0;
  let legLeftOffset = 0;
  let legRightOffset = 0;
  let legLeftY = 0;
  let legRightY = 0;
  let armSwing = 0;

  if (anim === 'walk') {
    // 8-frame fluid walk cycle with enriched, fabric-reactive cloak sway & billow
    switch (frame % 8) {
      case 0: // Contact 1 (Right heel forward, Left toe back)
        headY = 0;
        cloakY = 0;
        cloakBillowX = -3;
        cloakFlutterY = 0;
        hairBobY = 0;
        hairSwayX = -1;
        legRightOffset = 4;
        legRightY = 0;
        legLeftOffset = -4;
        legLeftY = -1;
        armSwing = -2;
        break;
      case 1: // Down / Squash 1 (Absorbing weight, knees bent, cloak billows upward and outward)
        headY = 1;
        cloakY = 1;
        cloakBillowX = -4;
        cloakFlutterY = -2;
        hairBobY = -1; // Hair tips lag/lift with inertia
        hairSwayX = 0;
        legRightOffset = 2;
        legRightY = 0;
        legLeftOffset = -2;
        legLeftY = 0;
        armSwing = -1;
        break;
      case 2: // Passing 1 (Right foot taking weight, Left foot passing forward)
        headY = 0;
        cloakY = 0;
        cloakBillowX = -3;
        cloakFlutterY = -1;
        hairBobY = 0;
        hairSwayX = 1;
        legRightOffset = 0;
        legRightY = 0;
        legLeftOffset = 0;
        legLeftY = -1;
        armSwing = 0;
        break;
      case 3: // Up / High Point 1 (Pushing off, body reaches crest, cloak tips dip and trail)
        headY = -1;
        cloakY = -1;
        cloakBillowX = -1;
        cloakFlutterY = 2;
        hairBobY = 1;
        hairSwayX = 0;
        legRightOffset = -2;
        legRightY = -1;
        legLeftOffset = 2;
        legLeftY = -2;
        armSwing = 2;
        break;
      case 4: // Contact 2 (Left heel forward, Right toe back)
        headY = 0;
        cloakY = 0;
        cloakBillowX = -3;
        cloakFlutterY = 0;
        hairBobY = 0;
        hairSwayX = -1;
        legRightOffset = -4;
        legRightY = -1;
        legLeftOffset = 4;
        legLeftY = 0;
        armSwing = 2;
        break;
      case 5: // Down / Squash 2 (Torso squashes down, cloak lifts & flutters)
        headY = 1;
        cloakY = 1;
        cloakBillowX = -4;
        cloakFlutterY = -2;
        hairBobY = -1;
        hairSwayX = 0;
        legRightOffset = -2;
        legRightY = 0;
        legLeftOffset = 2;
        legLeftY = 0;
        armSwing = 1;
        break;
      case 6: // Passing 2 (Left foot flat, Right foot swings forward)
        headY = 0;
        cloakY = 0;
        cloakBillowX = -3;
        cloakFlutterY = -1;
        hairBobY = 0;
        hairSwayX = 1;
        legRightOffset = 0;
        legRightY = -1;
        legLeftOffset = 0;
        legLeftY = 0;
        armSwing = 0;
        break;
      case 7: // Up / High Point 2 (Torso rises to apex, cloak cascades)
        headY = -1;
        cloakY = -1;
        cloakBillowX = -1;
        cloakFlutterY = 2;
        hairBobY = 1;
        hairSwayX = 0;
        legRightOffset = 2;
        legRightY = -2;
        legLeftOffset = -2;
        legLeftY = -1;
        armSwing = -2;
        break;
    }
  } else if (anim === 'idle') {
    // 4-frame idle breathing cycle with gentle living fabric breathing sway
    switch (frame % 4) {
      case 0:
        headY = 0;
        cloakY = 0;
        cloakBillowX = 0;
        cloakFlutterY = 0;
        hairBobY = 0;
        break;
      case 1:
        headY = -1;
        cloakY = -1;
        cloakBillowX = -1;
        cloakFlutterY = -1;
        hairBobY = -1;
        break;
      case 2: // gentle inhale / chest expands
        headY = -1;
        cloakY = -1;
        cloakBillowX = -1;
        cloakFlutterY = 0;
        hairBobY = 0;
        break;
      case 3: // exhale / fabric settles
        headY = 0;
        cloakY = 0;
        cloakBillowX = 0;
        cloakFlutterY = 1;
        hairBobY = 1;
        break;
    }
  } else if (anim === 'attack') {
    // Attack animation: 4 dynamic frames with sweeping cloak inertia
    switch (frame % 4) {
      case 0: // Windup (pull sword back, cloak whips back)
        headY = 0;
        cloakY = 0;
        cloakBillowX = -5;
        cloakFlutterY = -1;
        hairBobY = -1;
        hairSwayX = -2; // hair flings back
        legRightOffset = -1;
        legLeftOffset = -2;
        break;
      case 1: // Swing Strike (lunge forward, cloak flutters in wake)
        headY = 1;
        cloakY = 0;
        cloakBillowX = -4;
        cloakFlutterY = 2;
        hairBobY = 1;
        hairSwayX = 3; // hair whips forward
        legRightOffset = 5;
        legLeftOffset = -3;
        break;
      case 2: // Full Extension (apex slash)
        headY = 0;
        cloakY = -1;
        cloakBillowX = -3;
        cloakFlutterY = 1;
        hairBobY = 0;
        hairSwayX = 2;
        legRightOffset = 4;
        legLeftOffset = -3;
        break;
      case 3: // Follow-through & Recovery
        headY = 0;
        cloakY = 0;
        cloakBillowX = -1;
        cloakFlutterY = 0;
        hairBobY = 0;
        hairSwayX = 0;
        legRightOffset = 2;
        legLeftOffset = -1;
        break;
    }
  } else if (anim === 'bow') {
    // Bow shooting: 3 snappy frames (Draw, Full Draw, Release)
    switch (frame % 3) {
      case 0: // Raising bow & nocking
        headY = 0;
        cloakY = 0;
        cloakBillowX = -1;
        cloakFlutterY = 0;
        hairBobY = -1;
        hairSwayX = -1;
        legRightOffset = 1;
        legLeftOffset = -1;
        break;
      case 1: // Full draw tension
        headY = 0;
        cloakY = 0;
        cloakBillowX = -3;
        cloakFlutterY = -1;
        hairBobY = 0;
        hairSwayX = -2;
        legRightOffset = 3;
        legLeftOffset = -2;
        break;
      case 2: // Arrow loosed / recoil follow-through
        headY = 1;
        cloakY = 1;
        cloakBillowX = 0;
        cloakFlutterY = 2;
        hairBobY = 1;
        hairSwayX = 1;
        legRightOffset = 2;
        legLeftOffset = -1;
        break;
    }
  }

  const cx = PIVOT_X - 2;
  const cy = PIVOT_Y - 16;

  // 1. BACK CLOAK (Flowing trailing cape cascading behind character with natural fabric wave)
  const ckX = cx - 4 + cloakBillowX;
  const ckY = cy + cloakY;

  // Deep shadow inside lining
  p(ctx, ckX - 3, ckY + 5, PALETTE.cloakLining, 2, 8);

  // Cascading flowing cape body trailing behind back
  p(ctx, ckX - 3, ckY + 1, PALETTE.cloakDeep, 2, 12);
  p(ctx, ckX - 2, ckY + 1, PALETTE.cloakShadow, 4, 12);
  p(ctx, ckX, ckY + 2, PALETTE.cloakMid, 3, 11);
  p(ctx, ckX + 1, ckY + 2, PALETTE.cloakLight, 2, 9);
  p(ctx, ckX + 2, ckY + 3, PALETTE.cloakHighlight, 1, 7);

  // Billowing ripple at rear hem with organic wave
  p(ctx, ckX - 4, ckY + 8 + cloakFlutterY, PALETTE.cloakShadow, 2, 4);
  p(ctx, ckX - 5, ckY + 10 + cloakFlutterY, PALETTE.cloakDeep, 2, 3);

  // Subtle burgundy hem accent
  p(ctx, ckX - 3, ckY + 13 + cloakFlutterY, PALETTE.cloakShadow, 4, 1);

  // 2. BACK LEG (Left Leg)
  const blx = cx - 1 + legLeftOffset;
  const bly = cy + 9 + legLeftY;
  p(ctx, blx, bly, PALETTE.pantsShadow, 3, 2);
  p(ctx, blx - 1, bly + 2, PALETTE.bootShadow, 4, 4);
  p(ctx, blx - 1, bly + 5, PALETTE.bootSole, 4, 1);

  // 3. ENVELOPING CLOAK BODY & INNER TUNIC (Torso enveloped by cowl & robe matching reference)
  const tx = cx - 2;
  const ty = cy + 2 + headY;

  // Inner black robe visible under front opening
  p(ctx, tx + 3, ty + 1, PALETTE.tunicMid, 2, 7);
  p(ctx, tx + 4, ty + 2, PALETTE.tunicLight, 1, 5);

  // Cloak Body enveloping torso: draped cowl covering shoulders, chest & flanks
  p(ctx, tx - 3, ty, PALETTE.cloakDeep, 2, 8);
  p(ctx, tx - 2, ty - 1, PALETTE.cloakShadow, 6, 9);
  p(ctx, tx - 1, ty, PALETTE.cloakMid, 5, 8);
  p(ctx, tx, ty + 1, PALETTE.cloakLight, 4, 7);

  // Front diagonal wrap fold of the enveloping cowl
  p(ctx, tx + 1, ty + 1, PALETTE.cloakHighlight, 2, 5);
  p(ctx, tx, ty + 6, PALETTE.cloakShadow, 3, 2); // lower drape crease

  // Golden Ochre Belt wrapping the waist with gilded brass buckle (straight from reference image!)
  p(ctx, tx - 2, ty + 5, PALETTE.belt, 6, 2);
  p(ctx, tx + 1, ty + 5, PALETTE.beltLight, 3, 2);
  p(ctx, tx + 3, ty + 5, PALETTE.beltBuckle, 2, 2); // gold square buckle accent

  // 4. FRONT LEG (Right Leg)
  const flx = cx + 1 + legRightOffset;
  const fly = cy + 9 + legRightY;
  p(ctx, flx, fly, PALETTE.pants, 3, 2);
  p(ctx, flx - 1, fly + 2, PALETTE.bootMid, 4, 4);
  p(ctx, flx + 1, fly + 2, PALETTE.bootHighlight, 2, 2);
  p(ctx, flx - 1, fly + 5, PALETTE.bootSole, 4, 1);

  // 5. RAISED HOOD & HEAD (Side view: Peaked crimson cowl with deep shadow cavity & glowing eye)
  const hx = cx - 1;
  const hy = cy - 8 + headY;

  // Hood Rear & Crown Base
  p(ctx, hx - 4, hy - 4, PALETTE.cloakDeep, 6, 11);
  p(ctx, hx - 3, hy - 3, PALETTE.cloakShadow, 8, 10);
  p(ctx, hx - 2, hy - 4, PALETTE.cloakMid, 7, 7);
  p(ctx, hx - 1, hy - 4, PALETTE.cloakLight, 5, 4);
  p(ctx, hx, hy - 4, PALETTE.cloakHighlight, 3, 2);

  // Hood top peak / pointy cowl crest
  p(ctx, hx - 1, hy - 6, PALETTE.cloakMid, 3, 2);
  p(ctx, hx, hy - 6, PALETTE.cloakLight, 2, 1);

  // Forward brow overhang (peaked visor shadow from reference)
  p(ctx, hx + 2, hy - 3, PALETTE.cloakLight, 3, 2);
  p(ctx, hx + 3, hy - 2, PALETTE.cloakHighlight, 2, 1);
  p(ctx, hx + 4, hy - 1, PALETTE.cloakMid, 2, 2);

  // Deep hooded shadow cavity framing the face
  p(ctx, hx + 1, hy, PALETTE.cloakHoodLining, 4, 8);
  p(ctx, hx + 2, hy + 1, PALETTE.tunicShadow, 3, 6);

  // Hood rim / cowl forward fold curving down to shoulder
  p(ctx, hx + 2, hy + 3, PALETTE.cloakMid, 2, 4);
  p(ctx, hx + 1, hy + 4, PALETTE.cloakShadow, 2, 3);

  // Face Base & Cheek (peeking in profile from inside the hood rim)
  p(ctx, hx + 3, hy + 3, PALETTE.skinMid, 3, 5);
  p(ctx, hx + 4, hy + 4, PALETTE.skinLight, 2, 4);
  p(ctx, hx + 5, hy + 5, PALETTE.skinLight, 2, 2); // subtle nose/chin profile

  // Glowing Eye nestled in deep hood shadow cavity (iconic cyan glint from reference)
  const isBlinking = anim === 'idle' && frame === 2;
  if (isBlinking) {
    p(ctx, hx + 3, hy + 3, PALETTE.eyeDark, 2, 1);
  } else {
    // Deep black eye socket surround
    p(ctx, hx + 2, hy + 2, PALETTE.eyeDark, 3, 2);
    // Glowing cyan/turquoise iris
    p(ctx, hx + 3, hy + 2, PALETTE.eyeGlint, 2, 2);
    // Pure white pinpoint core glint
    p(ctx, hx + 3, hy + 2, PALETTE.eyeCore, 1, 1);
  }

  // 6. CHARACTER'S FRINGE / BANGS PEEKING OUT IN FRONT OF HOOD
  // Delicate white fringe tufts emerging from underneath the hood rim
  const fringeX = hx + hairSwayX;
  const fringeY = hy + hairBobY;

  // Bangs framing forehead and brow
  p(ctx, fringeX + 3, fringeY - 1, PALETTE.hairShadow, 2, 2);
  p(ctx, fringeX + 3, fringeY, PALETTE.hairLight, 2, 2);
  p(ctx, fringeX + 4, fringeY + 1, PALETTE.hairLight, 2, 2);
  p(ctx, fringeX + 2, fringeY + 1, PALETTE.hairMid, 2, 2);

  // Distinctive peek fringe tips reacting to movement
  p(ctx, fringeX + 5, fringeY + 1, PALETTE.hairLight, 1, 2);
  if (hairBobY < 0) {
    p(ctx, fringeX + 4, fringeY - 1, PALETTE.hairLight, 2, 1);
  }

  // 7. ARMS / SWORD ACTION
  if (anim === 'attack') {
    drawSideAttackSword(ctx, cx, cy, headY, frame % 4);
  } else if (anim === 'bow') {
    drawSideBow(ctx, cx, cy, headY, frame % 3);
  } else {
    // Forearm / hand emerging near belt (as seen in the reference image)
    const ax = cx + 1 + armSwing;
    const ay = cy + 3 + headY;
    // Cloak sleeve / shoulder drape over upper arm
    p(ctx, ax - 1, ay, PALETTE.cloakMid, 3, 3);
    p(ctx, ax, ay, PALETTE.cloakLight, 2, 2);
    // Hand emerging at waistline
    p(ctx, ax + 1, ay + 2, PALETTE.skinMid, 2, 3);
    p(ctx, ax + 2, ay + 3, PALETTE.skinLight, 1, 2);
  }
}

/**
 * Draws the character's sword slash when facing RIGHT.
 */
function drawSideAttackSword(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  headY: number,
  frame: number
) {
  const sx = cx + 4;
  const sy = cy + 2 + headY;

  if (frame === 0) {
    // Frame 0: Windup - Sword pulled back over shoulder
    // Arm
    p(ctx, cx - 1, sy + 1, PALETTE.tunicMid, 4, 3);
    p(ctx, cx - 2, sy, PALETTE.skinMid, 2, 2);

    // Crossguard
    p(ctx, cx - 4, sy - 2, PALETTE.swordGuard, 4, 2);
    p(ctx, cx - 3, sy - 3, PALETTE.swordGrip, 2, 2);

    // Blade angled up/back
    p(ctx, cx - 8, sy - 9, PALETTE.bladeEdge, 2, 8);
    p(ctx, cx - 7, sy - 8, PALETTE.bladeLight, 2, 7);
    p(ctx, cx - 6, sy - 7, PALETTE.bladeShadow, 1, 6);

    // Glint on blade tip
    p(ctx, cx - 9, sy - 10, '#ffffff', 2, 2);
  } else if (frame === 1) {
    // Frame 1: Slash Strike - Blade sweeps in front, slash starts
    // Arm lunged forward
    p(ctx, sx, sy + 1, PALETTE.tunicMid, 5, 3);
    p(ctx, sx + 4, sy + 1, PALETTE.skinMid, 2, 2);

    // Crossguard
    p(ctx, sx + 5, sy - 1, PALETTE.swordGuard, 2, 5);

    // Steel Blade angled forward/down
    p(ctx, sx + 7, sy - 2, PALETTE.bladeOutline, 8, 4);
    p(ctx, sx + 7, sy - 1, PALETTE.bladeLight, 7, 2);
    p(ctx, sx + 7, sy - 1, PALETTE.bladeEdge, 7, 1);
    p(ctx, sx + 14, sy - 1, PALETTE.bladeEdge, 2, 2);

    // Slash energy arc (early wave)
    p(ctx, sx + 11, sy - 8, PALETTE.slashMid, 3, 2);
    p(ctx, sx + 14, sy - 6, PALETTE.slashGlow, 3, 3);
    p(ctx, sx + 16, sy - 3, PALETTE.slashCore, 2, 6);
    p(ctx, sx + 14, sy + 3, PALETTE.slashGlow, 3, 3);
  } else if (frame === 2) {
    // Frame 2: Apex - Full extension with large glowing crescent slash wave!
    // Arm fully extended
    p(ctx, sx + 1, sy + 2, PALETTE.tunicMid, 5, 3);
    p(ctx, sx + 5, sy + 2, PALETTE.skinMid, 2, 2);

    // Crossguard
    p(ctx, sx + 6, sy, PALETTE.swordGuard, 2, 6);

    // Blade thrust
    p(ctx, sx + 8, sy + 1, PALETTE.bladeEdge, 10, 2);
    p(ctx, sx + 8, sy + 2, PALETTE.bladeLight, 10, 1);
    p(ctx, sx + 8, sy + 3, PALETTE.bladeShadow, 9, 1);

    // BIG MOONLIGHTER CRESCENT SLASH ARC
    const ax = sx + 14;
    const ay = sy - 11;

    // Outer glow
    p(ctx, ax + 2, ay, PALETTE.slashMid, 4, 2);
    p(ctx, ax + 5, ay + 2, PALETTE.slashGlow, 3, 3);
    p(ctx, ax + 7, ay + 5, PALETTE.slashGlow, 3, 4);
    p(ctx, ax + 8, ay + 9, PALETTE.slashCore, 3, 8);
    p(ctx, ax + 7, ay + 17, PALETTE.slashGlow, 3, 4);
    p(ctx, ax + 4, ay + 21, PALETTE.slashMid, 4, 3);
    p(ctx, ax + 1, ay + 24, PALETTE.slashTrail, 4, 2);

    // Pure white blazing cutting core
    p(ctx, ax + 5, ay + 5, PALETTE.slashCore, 3, 2);
    p(ctx, ax + 6, ay + 7, PALETTE.slashCore, 3, 4);
    p(ctx, ax + 7, ay + 11, PALETTE.slashCore, 2, 4);

    // Slash sparks
    p(ctx, ax + 12, ay + 7, PALETTE.slashGlow, 2, 2);
    p(ctx, ax + 13, ay + 13, PALETTE.slashCore, 2, 2);
    p(ctx, ax + 11, ay + 19, PALETTE.slashGlow, 2, 2);
  } else if (frame === 3) {
    // Frame 3: Follow-through / Recovery
    // Arm resting downward
    p(ctx, sx, sy + 3, PALETTE.tunicMid, 4, 3);
    p(ctx, sx + 2, sy + 5, PALETTE.skinMid, 2, 2);

    // Crossguard
    p(ctx, sx + 2, sy + 7, PALETTE.swordGuard, 4, 2);

    // Blade pointed down
    p(ctx, sx + 3, sy + 9, PALETTE.bladeLight, 2, 8);
    p(ctx, sx + 4, sy + 9, PALETTE.bladeEdge, 1, 8);
    p(ctx, sx + 2, sy + 9, PALETTE.bladeShadow, 1, 7);

    // Lingering sparks
    p(ctx, sx + 14, sy - 2, PALETTE.slashGlow, 1, 2);
    p(ctx, sx + 18, sy + 4, PALETTE.slashTrail, 2, 1);
    p(ctx, sx + 15, sy + 10, PALETTE.slashGlow, 1, 1);
  }
}

/**
 * Draws the character sprite facing DOWN (South / Front view).
 */
function drawDownSprite(
  ctx: CanvasRenderingContext2D,
  anim: AnimState,
  frame: number
) {
  let headY = 0;
  let cloakY = 0;
  let cloakSwayX = 0;
  let cloakFlutterY = 0;
  let hairBobY = 0;
  let hairSwayX = 0;
  let legLeftY = 0;
  let legRightY = 0;

  if (anim === 'walk') {
    // 8-frame fluid walk cycle with secondary cloak inertia & wave
    switch (frame % 8) {
      case 0:
        legLeftY = -1;
        legRightY = 1;
        headY = 0;
        hairBobY = 0;
        cloakSwayX = -2;
        cloakFlutterY = 0;
        hairSwayX = -1;
        break;
      case 1: // squash
        legLeftY = 0;
        legRightY = 0;
        headY = 1;
        hairBobY = -1;
        cloakY = 1;
        cloakSwayX = -3;
        cloakFlutterY = -1;
        hairSwayX = 0;
        break;
      case 2:
        legLeftY = 1;
        legRightY = 0;
        headY = 0;
        hairBobY = 0;
        cloakSwayX = -1;
        cloakFlutterY = 0;
        hairSwayX = 1;
        break;
      case 3: // apex
        legLeftY = 1;
        legRightY = -1;
        headY = -1;
        hairBobY = 1;
        cloakY = -1;
        cloakSwayX = 0;
        cloakFlutterY = 1;
        hairSwayX = 0;
        break;
      case 4:
        legLeftY = 1;
        legRightY = -1;
        headY = 0;
        hairBobY = 0;
        cloakSwayX = 2;
        cloakFlutterY = 0;
        hairSwayX = 1;
        break;
      case 5: // squash
        legLeftY = 0;
        legRightY = 0;
        headY = 1;
        hairBobY = -1;
        cloakY = 1;
        cloakSwayX = 3;
        cloakFlutterY = -1;
        hairSwayX = 0;
        break;
      case 6:
        legLeftY = 0;
        legRightY = 1;
        headY = 0;
        hairBobY = 0;
        cloakSwayX = 1;
        cloakFlutterY = 0;
        hairSwayX = -1;
        break;
      case 7: // apex
        legLeftY = -1;
        legRightY = 1;
        headY = -1;
        hairBobY = 1;
        cloakY = -1;
        cloakSwayX = 0;
        cloakFlutterY = 1;
        hairSwayX = 0;
        break;
    }
  } else if (anim === 'idle') {
    // 4-frame breathing cycle
    switch (frame % 4) {
      case 0:
        headY = 0;
        cloakY = 0;
        cloakSwayX = 0;
        cloakFlutterY = 0;
        hairBobY = 0;
        break;
      case 1:
        headY = -1;
        cloakY = -1;
        cloakSwayX = -1;
        cloakFlutterY = -1;
        hairBobY = -1;
        break;
      case 2:
        headY = -1;
        cloakY = -1;
        cloakSwayX = 0;
        cloakFlutterY = 0;
        hairBobY = 0;
        break;
      case 3:
        headY = 0;
        cloakY = 0;
        cloakSwayX = 1;
        cloakFlutterY = 1;
        hairBobY = 1;
        break;
    }
  } else if (anim === 'attack') {
    headY = frame === 1 ? 1 : 0;
    hairBobY = frame === 1 ? 1 : 0;
    cloakSwayX = frame === 1 ? -4 : frame === 2 ? 4 : 0;
    cloakFlutterY = frame === 1 ? 2 : 0;
  } else if (anim === 'bow') {
    headY = frame === 2 ? 1 : 0;
    hairBobY = frame === 2 ? 1 : -1;
    cloakSwayX = frame === 1 ? -2 : 0;
  }

  const cx = PIVOT_X;
  const cy = PIVOT_Y - 16;

  // 1. REAR CLOAK FABRIC (Cascading behind player body with movement sway)
  const cyCloak = cy + cloakY;
  const sx = cx + cloakSwayX;

  // Cape fabric billowing behind left flank
  p(ctx, sx - 9, cyCloak - 1, PALETTE.cloakDeep, 2, 11);
  p(ctx, sx - 8, cyCloak - 1, PALETTE.cloakShadow, 3, 12);
  p(ctx, sx - 7, cyCloak, PALETTE.cloakMid, 2, 10);
  p(ctx, sx - 6, cyCloak + 1, PALETTE.cloakLight, 1, 8);
  // Left Golden Hem Trim
  p(ctx, sx - 8, cyCloak + 10 + cloakFlutterY, PALETTE.cloakTrim, 3, 1);
  p(ctx, sx - 7, cyCloak + 11 + cloakFlutterY, PALETTE.cloakTrimShadow, 2, 1);
  p(ctx, sx - 7, cyCloak + 10 + cloakFlutterY, '#fef08a', 1, 1); // gold glint

  // Cape fabric billowing behind right flank
  p(ctx, sx + 8, cyCloak - 1, PALETTE.cloakDeep, 2, 11);
  p(ctx, sx + 5, cyCloak - 1, PALETTE.cloakShadow, 3, 12);
  p(ctx, sx + 5, cyCloak, PALETTE.cloakMid, 2, 10);
  p(ctx, sx + 5, cyCloak + 1, PALETTE.cloakLight, 1, 8);
  // Right Golden Hem Trim
  p(ctx, sx + 5, cyCloak + 10 + cloakFlutterY, PALETTE.cloakTrim, 3, 1);
  p(ctx, sx + 5, cyCloak + 11 + cloakFlutterY, PALETTE.cloakTrimShadow, 2, 1);
  p(ctx, sx + 6, cyCloak + 10 + cloakFlutterY, '#fef08a', 1, 1); // gold glint

  // 2. LEGS (beneath enveloping cloak)
  const llx = cx - 4;
  const lly = cy + 9 + legLeftY;
  p(ctx, llx, lly, PALETTE.pants, 3, 2);
  p(ctx, llx - 1, lly + 2, PALETTE.bootMid, 4, 4);
  p(ctx, llx, lly + 2, PALETTE.bootHighlight, 2, 2);
  p(ctx, llx - 1, lly + 5, PALETTE.bootSole, 4, 1);

  const rlx = cx + 1;
  const rly = cy + 9 + legRightY;
  p(ctx, rlx, rly, PALETTE.pants, 3, 2);
  p(ctx, rlx, rly + 2, PALETTE.bootMid, 4, 4);
  p(ctx, rlx + 1, rly + 2, PALETTE.bootHighlight, 2, 2);
  p(ctx, rlx, rly + 5, PALETTE.bootSole, 4, 1);

  // 3. ENVELOPING CLOAK BODY & INNER ROBE (Front wrap with golden ochre belt matching reference)
  const ty = cy + 2 + headY;

  // Inner black robe visible down the center chest
  p(ctx, cx - 1, ty, PALETTE.tunicMid, 3, 8);

  // Enveloping Cloak Main Torso Form (Mantle wrapping around shoulders & flanks)
  p(ctx, cx - 6, ty, PALETTE.cloakDeep, 2, 8);
  p(ctx, cx - 5, ty - 1, PALETTE.cloakShadow, 10, 9);
  p(ctx, cx - 4, ty, PALETTE.cloakMid, 8, 8);
  p(ctx, cx - 3, ty + 1, PALETTE.cloakLight, 6, 6);

  // Folds of the mantle draping across torso
  // Left shoulder & breast drape
  p(ctx, cx - 5, ty, PALETTE.cloakShadow, 3, 6);
  p(ctx, cx - 4, ty, PALETTE.cloakMid, 2, 5);
  p(ctx, cx - 4, ty + 1, PALETTE.cloakLight, 1, 4);

  // Right overlapping mantle panel (enveloping front right side)
  p(ctx, cx + 1, ty + 1, PALETTE.cloakMid, 4, 7);
  p(ctx, cx + 2, ty + 2, PALETTE.cloakLight, 3, 5);
  p(ctx, cx + 2, ty + 2, PALETTE.cloakHighlight, 1, 4);

  // Crease shadow where mantle folds meet
  p(ctx, cx - 1, ty + 2, PALETTE.cloakShadow, 2, 4);
  p(ctx, cx, ty + 3, PALETTE.cloakDeep, 1, 3);

  // Golden Ochre Belt & Gilded Brass Buckle wrapping waist (matching reference image)
  p(ctx, cx - 4, ty + 5, PALETTE.belt, 8, 2);
  p(ctx, cx - 1, ty + 5, PALETTE.beltLight, 3, 2);
  p(ctx, cx - 1, ty + 5, PALETTE.beltBuckle, 2, 2); // gold square buckle

  // 4. ARMS & ATTACK HANDLING
  if (anim === 'attack') {
    drawDownAttackSword(ctx, cx, cy, headY, frame % 4);
  } else if (anim === 'bow') {
    drawDownBow(ctx, cx, cy, headY, frame % 3);
  } else {
    // Arms resting naturally under cloak drape
    const ay = cy + 3 + headY;
    // Left arm drape
    p(ctx, cx - 7, ay, PALETTE.cloakShadow, 3, 4);
    p(ctx, cx - 6, ay + 1, PALETTE.cloakMid, 2, 3);
    p(ctx, cx - 6, ay + 4, PALETTE.skinMid, 2, 2); // Left hand
    // Right arm drape
    p(ctx, cx + 4, ay, PALETTE.cloakShadow, 3, 4);
    p(ctx, cx + 4, ay + 1, PALETTE.cloakMid, 2, 3);
    p(ctx, cx + 4, ay + 4, PALETTE.skinMid, 2, 2); // Right hand
  }

  // 5. RAISED HOOD & HEAD (South/Front view: Pointed cowl, deep shadow cavity & glowing cyan eyes)
  const hy = cy - 8 + headY;

  // Hood Outer Canopy & Silhouette
  p(ctx, cx - 7, hy - 4, PALETTE.cloakDeep, 14, 12);
  p(ctx, cx - 6, hy - 4, PALETTE.cloakShadow, 12, 12);
  p(ctx, cx - 5, hy - 5, PALETTE.cloakMid, 10, 8);
  p(ctx, cx - 4, hy - 5, PALETTE.cloakLight, 8, 5);
  p(ctx, cx - 2, hy - 5, PALETTE.cloakHighlight, 4, 2);

  // Pointed peak crest of hood
  p(ctx, cx - 2, hy - 6, PALETTE.cloakMid, 4, 2);
  p(ctx, cx - 1, hy - 6, PALETTE.cloakLight, 2, 1);

  // Deep hood interior shadow cavity framing face (creates the mysterious veiled effect)
  p(ctx, cx - 5, hy - 2, PALETTE.cloakHoodLining, 10, 10);
  p(ctx, cx - 4, hy - 1, PALETTE.cloakDeep, 8, 9);
  p(ctx, cx - 3, hy + 1, PALETTE.tunicShadow, 6, 6);

  // Face Base nestled inside deep hood shadow
  p(ctx, cx - 3, hy + 3, PALETTE.skinMid, 6, 5);
  p(ctx, cx - 2, hy + 4, PALETTE.skinLight, 4, 4);

  // Glowing Cyan / Turquoise Eyes nestled inside the shadow cavity (matching the reference image)
  const isBlink = anim === 'idle' && frame === 2;
  if (isBlink) {
    p(ctx, cx - 3, hy + 3, PALETTE.eyeDark, 2, 1);
    p(ctx, cx + 1, hy + 3, PALETTE.eyeDark, 2, 1);
  } else {
    // Left eye
    p(ctx, cx - 3, hy + 2, PALETTE.eyeGlint, 2, 2);
    p(ctx, cx - 3, hy + 2, PALETTE.eyeCore, 1, 1);
    // Right eye
    p(ctx, cx + 1, hy + 2, PALETTE.eyeGlint, 2, 2);
    p(ctx, cx + 1, hy + 2, PALETTE.eyeCore, 1, 1);
  }

  // 6. CHARACTER'S WHITE FRINGE PEEKING OUT IN FRONT OF HOOD
  const fringeY = hy + hairBobY;
  const fringeX = cx + hairSwayX;

  // Fringe cluster emerging from top-center under hood rim
  p(ctx, fringeX - 3, fringeY - 1, PALETTE.hairShadow, 6, 2);
  p(ctx, fringeX - 3, fringeY, PALETTE.hairLight, 6, 2);
  p(ctx, fringeX - 1, fringeY + 1, PALETTE.hairLight, 2, 2);
  p(ctx, fringeX, fringeY + 2, PALETTE.hairMid, 1, 1);

  // Side bangs tips
  p(ctx, fringeX - 4, fringeY + 1, PALETTE.hairLight, 2, 2);
  p(ctx, fringeX + 2, fringeY + 1, PALETTE.hairLight, 2, 2);

  // Hood side cowl folds framing lower face
  p(ctx, cx - 5, hy + 5, PALETTE.cloakMid, 2, 4);
  p(ctx, cx - 5, hy + 6, PALETTE.cloakLight, 1, 3);
  p(ctx, cx + 3, hy + 5, PALETTE.cloakMid, 2, 4);
  p(ctx, cx + 4, hy + 6, PALETTE.cloakLight, 1, 3);
}

/**
 * Draws the downward sword slash facing South.
 */
function drawDownAttackSword(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  headY: number,
  frame: number
) {
  const ay = cy + 3 + headY;

  if (frame === 0) {
    // Windup - Sword held high at right shoulder
    p(ctx, cx - 6, ay, PALETTE.tunicMid, 3, 3);
    p(ctx, cx + 5, ay - 2, PALETTE.tunicMid, 3, 4);
    p(ctx, cx + 6, ay - 3, PALETTE.skinMid, 2, 2);

    // Sword raised vertically
    p(ctx, cx + 7, ay - 5, PALETTE.swordGuard, 4, 2);
    p(ctx, cx + 8, ay - 14, PALETTE.bladeEdge, 2, 9);
    p(ctx, cx + 9, ay - 13, PALETTE.bladeLight, 1, 8);
  } else if (frame === 1) {
    // Slashing down-across
    p(ctx, cx - 6, ay + 1, PALETTE.tunicMid, 3, 3);
    p(ctx, cx + 4, ay + 1, PALETTE.tunicMid, 4, 3);
    p(ctx, cx + 2, ay + 4, PALETTE.skinMid, 3, 2);

    // Blade slashing diagonal
    p(ctx, cx - 1, ay + 6, PALETTE.bladeEdge, 8, 2);
    p(ctx, cx + 2, ay + 5, PALETTE.swordGuard, 2, 4);

    // Crescent arc starting in front
    p(ctx, cx - 9, ay + 4, PALETTE.slashMid, 4, 3);
    p(ctx, cx - 6, ay + 8, PALETTE.slashCore, 8, 3);
    p(ctx, cx + 3, ay + 8, PALETTE.slashGlow, 5, 2);
  } else if (frame === 2) {
    // Full downward slash apex wave!
    p(ctx, cx - 4, ay + 2, PALETTE.skinMid, 2, 2);
    p(ctx, cx - 2, ay + 3, PALETTE.swordGuard, 5, 2);

    // Blade low
    p(ctx, cx - 7, ay + 5, PALETTE.bladeEdge, 9, 3);

    // Wide horizontal sweeping slash crescent in front of feet
    const arcY = cy + 13;
    p(ctx, cx - 14, arcY - 3, PALETTE.slashMid, 4, 3);
    p(ctx, cx - 11, arcY - 1, PALETTE.slashGlow, 5, 3);
    p(ctx, cx - 7, arcY + 1, PALETTE.slashCore, 14, 3);
    p(ctx, cx + 6, arcY - 1, PALETTE.slashGlow, 5, 3);
    p(ctx, cx + 10, arcY - 3, PALETTE.slashMid, 4, 3);

    // Sparks
    p(ctx, cx - 12, arcY + 4, PALETTE.slashGlow, 2, 2);
    p(ctx, cx + 11, arcY + 3, PALETTE.slashCore, 2, 2);
  } else if (frame === 3) {
    // Recovery
    p(ctx, cx - 5, ay + 1, PALETTE.tunicMid, 3, 4);
    p(ctx, cx + 3, ay + 1, PALETTE.tunicMid, 3, 4);
    p(ctx, cx + 3, ay + 5, PALETTE.skinMid, 2, 2);

    // Sword resting low
    p(ctx, cx + 3, ay + 7, PALETTE.swordGuard, 3, 2);
    p(ctx, cx + 4, ay + 9, PALETTE.bladeLight, 2, 6);

    // Fading motes
    p(ctx, cx - 8, cy + 13, PALETTE.slashTrail, 2, 1);
    p(ctx, cx + 8, cy + 13, PALETTE.slashTrail, 2, 1);
  }
}

/**
 * Draws the character sprite facing UP (North / Back view).
 */
function drawUpSprite(
  ctx: CanvasRenderingContext2D,
  anim: AnimState,
  frame: number
) {
  let headY = 0;
  let cloakY = 0;
  let cloakSwayX = 0;
  let cloakFlutterY = 0;
  let hairBobY = 0;
  let legLeftY = 0;
  let legRightY = 0;

  if (anim === 'walk') {
    switch (frame % 8) {
      case 0:
        legLeftY = -1;
        legRightY = 1;
        headY = 0;
        cloakSwayX = -2;
        cloakFlutterY = 0;
        break;
      case 1:
        legLeftY = 0;
        legRightY = 0;
        headY = 1;
        hairBobY = -1;
        cloakY = 1;
        cloakSwayX = -3;
        cloakFlutterY = -1;
        break;
      case 2:
        legLeftY = 1;
        legRightY = 0;
        headY = 0;
        cloakSwayX = -1;
        cloakFlutterY = 0;
        break;
      case 3:
        legLeftY = 1;
        legRightY = -1;
        headY = -1;
        hairBobY = 1;
        cloakY = -1;
        cloakSwayX = 0;
        cloakFlutterY = 1;
        break;
      case 4:
        legLeftY = 1;
        legRightY = -1;
        headY = 0;
        cloakSwayX = 2;
        cloakFlutterY = 0;
        break;
      case 5:
        legLeftY = 0;
        legRightY = 0;
        headY = 1;
        hairBobY = -1;
        cloakY = 1;
        cloakSwayX = 3;
        cloakFlutterY = -1;
        break;
      case 6:
        legLeftY = 0;
        legRightY = 1;
        headY = 0;
        cloakSwayX = 1;
        cloakFlutterY = 0;
        break;
      case 7:
        legLeftY = -1;
        legRightY = 1;
        headY = -1;
        hairBobY = 1;
        cloakY = -1;
        cloakSwayX = 0;
        cloakFlutterY = 1;
        break;
    }
  } else if (anim === 'idle') {
    headY = frame % 2 === 1 ? -1 : 0;
    cloakY = frame % 2 === 1 ? -1 : 0;
    cloakSwayX = frame % 2 === 1 ? -1 : 1;
    cloakFlutterY = frame % 2 === 1 ? 0 : 1;
  } else if (anim === 'attack') {
    headY = frame === 1 ? 1 : 0;
    cloakSwayX = frame === 1 ? -4 : frame === 2 ? 4 : 0;
    cloakFlutterY = frame === 1 ? 2 : 0;
  } else if (anim === 'bow') {
    headY = frame === 2 ? 1 : 0;
    cloakSwayX = frame === 1 ? -2 : 0;
  }

  const cx = PIVOT_X;
  const cy = PIVOT_Y - 16;

  // 1. LEGS beneath cloak
  const llx = cx - 4;
  const lly = cy + 9 + legLeftY;
  p(ctx, llx, lly, PALETTE.pantsShadow, 3, 2);
  p(ctx, llx - 1, lly + 2, PALETTE.bootShadow, 4, 4);
  p(ctx, llx - 1, lly + 5, PALETTE.bootSole, 4, 1);

  const rlx = cx + 1;
  const rly = cy + 9 + legRightY;
  p(ctx, rlx, rly, PALETTE.pantsShadow, 3, 2);
  p(ctx, rlx, rly + 2, PALETTE.bootShadow, 4, 4);
  p(ctx, rlx, rly + 5, PALETTE.bootSole, 4, 1);

  // 2. ARMS
  const ay = cy + 3 + headY;
  p(ctx, cx - 8, ay, PALETTE.cloakShadow, 3, 4);
  p(ctx, cx - 8, ay + 4, PALETTE.skinShadow, 2, 2);
  p(ctx, cx + 5, ay, PALETTE.cloakShadow, 3, 4);
  p(ctx, cx + 6, ay + 4, PALETTE.skinShadow, 2, 2);

  // 3. ENVELOPING CLOAK BODY (Full back view with rich burgundy folds and organic sway)
  const cyCloak = cy - 2 + cloakY;
  const sx = cx + cloakSwayX;

  // Cascading folds of Cape Body (flowing from shoulders down past thighs)
  // Left fold column
  p(ctx, sx - 8, cyCloak + 2, PALETTE.cloakDeep, 3, 11);
  p(ctx, sx - 7, cyCloak + 2, PALETTE.cloakShadow, 4, 11);
  p(ctx, sx - 5, cyCloak + 2, PALETTE.cloakMid, 2, 10);
  p(ctx, sx - 4, cyCloak + 3, PALETTE.cloakLight, 1, 8);

  // Broad midtone center expanse
  p(ctx, sx - 4, cyCloak + 2, PALETTE.cloakMid, 8, 9);
  p(ctx, sx - 3, cyCloak + 2, PALETTE.cloakLight, 6, 5);
  p(ctx, sx - 2, cyCloak + 3, PALETTE.cloakHighlight, 4, 3);

  // Center vertical crease/pleat shadow
  p(ctx, sx - 1, cyCloak + 2, PALETTE.cloakShadow, 2, 10);
  p(ctx, sx, cyCloak + 3, PALETTE.cloakDeep, 1, 9);

  // Right fold column
  p(ctx, sx + 2, cyCloak + 3, PALETTE.cloakLight, 1, 8);
  p(ctx, sx + 3, cyCloak + 2, PALETTE.cloakMid, 2, 10);
  p(ctx, sx + 4, cyCloak + 2, PALETTE.cloakShadow, 4, 11);
  p(ctx, sx + 6, cyCloak + 2, PALETTE.cloakDeep, 3, 11);

  // Undulating bottom hem
  p(ctx, sx - 8, cyCloak + 12 + cloakFlutterY, PALETTE.cloakDeep, 2, 1);
  p(ctx, sx - 6, cyCloak + 13 + cloakFlutterY, PALETTE.cloakShadow, 4, 1);
  p(ctx, sx - 2, cyCloak + 12 + cloakFlutterY, PALETTE.cloakMid, 4, 1);
  p(ctx, sx + 2, cyCloak + 13 + cloakFlutterY, PALETTE.cloakShadow, 4, 1);
  p(ctx, sx + 6, cyCloak + 12 + cloakFlutterY, PALETTE.cloakDeep, 2, 1);

  // 4. RAISED HOOD COVERING HEAD (Back View)
  const hy = cy - 8 + headY;

  // Raised hood main canopy enclosing the entire back of the head
  p(ctx, cx - 7, hy - 4, PALETTE.cloakDeep, 14, 11);
  p(ctx, cx - 6, hy - 4, PALETTE.cloakShadow, 12, 10);
  p(ctx, cx - 5, hy - 5, PALETTE.cloakMid, 10, 9);
  p(ctx, cx - 4, hy - 5, PALETTE.cloakLight, 8, 6);
  p(ctx, cx - 2, hy - 5, PALETTE.cloakHighlight, 4, 3);

  // Pointed peak point of hood
  p(ctx, cx - 2, hy - 6, PALETTE.cloakMid, 4, 2);
  p(ctx, cx - 1, hy - 6, PALETTE.cloakLight, 2, 1);

  // Hood fabric fold crease lines running down to cowl shoulder connection
  p(ctx, cx - 4, hy + 2, PALETTE.cloakShadow, 2, 4);
  p(ctx, cx + 2, hy + 2, PALETTE.cloakShadow, 2, 4);
  p(ctx, cx - 1, hy + 1, PALETTE.cloakDeep, 2, 5);

  // Cowl/mantle shoulder connection band
  p(ctx, cx - 6, hy + 6, PALETTE.cloakDeep, 12, 2);
  p(ctx, cx - 5, hy + 5, PALETTE.cloakShadow, 10, 2);

  // Subtle crest ridge highlight
  p(ctx, cx - 1, hy - 4, PALETTE.cloakHighlight, 2, 1);

  // Tiny fringe tips visible peeking around front rim edges
  p(ctx, cx - 8, hy + 1 + hairBobY, PALETTE.hairLight, 2, 2);
  p(ctx, cx + 6, hy + 1 + hairBobY, PALETTE.hairLight, 2, 2);
  p(ctx, cx - 8, hy + 3 + hairBobY, PALETTE.hairShadow, 1, 2);
  p(ctx, cx + 7, hy + 3 + hairBobY, PALETTE.hairShadow, 1, 2);

  // 5. ATTACK SWORD / BOW (Upward swipe or bow over top)
  if (anim === 'attack') {
    drawUpAttackSword(ctx, cx, cy, headY, frame % 4);
  } else if (anim === 'bow') {
    drawUpBow(ctx, cx, cy, headY, frame % 3);
  }
}

/**
 * Draws upward sword slash facing North.
 */
function drawUpAttackSword(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  headY: number,
  frame: number
) {
  const sy = cy - 8 + headY;

  if (frame === 0) {
    // Windup
    p(ctx, cx - 8, sy + 3, PALETTE.swordGuard, 2, 4);
    p(ctx, cx - 11, sy + 4, PALETTE.bladeLight, 3, 2);
  } else if (frame === 1) {
    // Slash cutting upwards
    p(ctx, cx - 3, sy - 5, PALETTE.bladeEdge, 2, 8);
    p(ctx, cx - 8, sy - 7, PALETTE.slashMid, 4, 3);
    p(ctx, cx - 5, sy - 9, PALETTE.slashCore, 8, 3);
  } else if (frame === 2) {
    // Apex upward crescent slash
    const arcY = sy - 11;
    p(ctx, cx - 12, arcY + 4, PALETTE.slashMid, 4, 3);
    p(ctx, cx - 9, arcY + 1, PALETTE.slashGlow, 4, 3);
    p(ctx, cx - 6, arcY - 1, PALETTE.slashCore, 12, 3);
    p(ctx, cx + 5, arcY + 1, PALETTE.slashGlow, 4, 3);
    p(ctx, cx + 8, arcY + 4, PALETTE.slashMid, 4, 3);

    p(ctx, cx + 3, sy - 6, PALETTE.bladeEdge, 2, 8);
  } else if (frame === 3) {
    // Recovery
    p(ctx, cx + 8, sy, PALETTE.swordGuard, 2, 3);
    p(ctx, cx + 9, sy + 2, PALETTE.bladeLight, 2, 6);
  }
}

/**
 * Draws the bow shooting action when facing RIGHT (or LEFT if mirrored).
 */
function drawSideBow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  headY: number,
  frame: number
) {
  const by = cy + 2 + headY;
  const bx = cx + 8;

  if (frame === 0) {
    // Frame 0: Bow raised forward, starting draw
    p(ctx, cx + 2, by + 1, PALETTE.tunicMid, 4, 3);
    p(ctx, cx + 6, by + 1, PALETTE.skinMid, 2, 2);

    // Right arm reaching for string
    p(ctx, cx - 1, by + 2, PALETTE.tunicMid, 3, 3);
    p(ctx, cx + 2, by + 2, PALETTE.skinMid, 2, 2);

    // Recurve Bow (facing right)
    p(ctx, bx, by - 7, PALETTE.bowWood, 2, 3);
    p(ctx, bx - 1, by - 4, PALETTE.bowWood, 2, 3);
    p(ctx, bx, by - 1, PALETTE.bowWoodLight, 2, 2);
    p(ctx, bx, by + 1, PALETTE.bowGrip, 2, 3);
    p(ctx, bx, by + 4, PALETTE.bowWoodLight, 2, 2);
    p(ctx, bx - 1, by + 6, PALETTE.bowWood, 2, 3);
    p(ctx, bx, by + 9, PALETTE.bowWood, 2, 3);

    // Bowstring
    p(ctx, bx - 2, by - 6, PALETTE.bowString, 1, 15);
  } else if (frame === 1) {
    // Frame 1: Full Draw Hold - Bow bent back under tension!
    p(ctx, cx + 3, by + 1, PALETTE.tunicMid, 5, 3);
    p(ctx, cx + 7, by + 1, PALETTE.skinMid, 2, 2);

    // Right arm pulled all the way back to jaw
    p(ctx, cx - 3, by + 1, PALETTE.tunicMid, 4, 3);
    p(ctx, cx + 1, by + 1, PALETTE.skinMid, 2, 2);

    // Flexed Recurve Bow
    p(ctx, bx - 1, by - 8, PALETTE.bowWood, 2, 3);
    p(ctx, bx, by - 5, PALETTE.bowWood, 2, 3);
    p(ctx, bx + 1, by - 2, PALETTE.bowWoodLight, 2, 3);
    p(ctx, bx + 1, by + 1, PALETTE.bowGrip, 2, 3);
    p(ctx, bx + 1, by + 4, PALETTE.bowWoodLight, 2, 3);
    p(ctx, bx, by + 7, PALETTE.bowWood, 2, 3);
    p(ctx, bx - 1, by + 10, PALETTE.bowWood, 2, 3);

    // Bowstring pulled back in sharp tension triangle
    p(ctx, bx - 2, by - 7, PALETTE.bowString, 1, 2);
    p(ctx, bx - 3, by - 5, PALETTE.bowString, 1, 2);
    p(ctx, bx - 5, by - 3, PALETTE.bowString, 1, 2);
    p(ctx, cx + 2, by + 1, PALETTE.bowString, 2, 2);
    p(ctx, bx - 5, by + 5, PALETTE.bowString, 1, 2);
    p(ctx, bx - 3, by + 7, PALETTE.bowString, 1, 2);
    p(ctx, bx - 2, by + 9, PALETTE.bowString, 1, 2);

    // Nocked Arrow resting on bow
    p(ctx, cx + 3, by + 1, PALETTE.arrowShaft, 10, 1);
    p(ctx, cx + 2, by, PALETTE.arrowFletch, 2, 1);
    p(ctx, cx + 2, by + 2, PALETTE.arrowFletch, 2, 1);
    // Glinting iron tip
    p(ctx, cx + 13, by + 1, PALETTE.arrowHead, 3, 1);
    p(ctx, cx + 15, by + 1, '#ffffff', 1, 1);
  } else if (frame === 2) {
    // Frame 2: Arrow loosed! Recoil & vibrating string
    p(ctx, cx + 2, by + 1, PALETTE.tunicMid, 5, 3);
    p(ctx, cx + 7, by + 1, PALETTE.skinMid, 2, 2);

    p(ctx, cx - 4, by + 2, PALETTE.tunicMid, 3, 3);
    p(ctx, cx - 2, by + 2, PALETTE.skinMid, 2, 2);

    // Bow snapped forward
    p(ctx, bx, by - 7, PALETTE.bowWood, 2, 3);
    p(ctx, bx + 1, by - 4, PALETTE.bowWood, 2, 3);
    p(ctx, bx + 1, by - 1, PALETTE.bowWoodLight, 2, 2);
    p(ctx, bx + 1, by + 1, PALETTE.bowGrip, 2, 3);
    p(ctx, bx + 1, by + 4, PALETTE.bowWoodLight, 2, 2);
    p(ctx, bx + 1, by + 6, PALETTE.bowWood, 2, 3);
    p(ctx, bx, by + 9, PALETTE.bowWood, 2, 3);

    // Bowstring vibrating flat
    p(ctx, bx - 1, by - 6, PALETTE.bowString, 1, 15);

    // Wind puff mote where arrow exited
    p(ctx, bx + 5, by, 'rgba(255,255,255,0.8)', 2, 1);
    p(ctx, bx + 7, by + 1, PALETTE.slashGlow, 3, 1);
    p(ctx, bx + 6, by + 2, 'rgba(255,255,255,0.7)', 2, 1);
  }
}

/**
 * Draws the bow shooting action when facing SOUTH (Down).
 */
function drawDownBow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  headY: number,
  frame: number
) {
  const ay = cy + 3 + headY;
  if (frame === 0) {
    // Draw: arms holding bow in front
    p(ctx, cx - 7, ay + 2, PALETTE.tunicMid, 3, 3);
    p(ctx, cx + 4, ay + 2, PALETTE.tunicMid, 3, 3);
    p(ctx, cx - 7, ay + 5, PALETTE.skinMid, 2, 2);
    p(ctx, cx + 5, ay + 5, PALETTE.skinMid, 2, 2);

    // Horizontal Bow
    p(ctx, cx - 9, ay + 6, PALETTE.bowWood, 18, 2);
    p(ctx, cx - 1, ay + 6, PALETTE.bowGrip, 3, 2);
    p(ctx, cx - 8, ay + 5, PALETTE.bowString, 16, 1);
  } else if (frame === 1) {
    // Full draw: bow curved down, string pulled up to chest, arrow pointing down
    p(ctx, cx - 7, ay + 3, PALETTE.tunicMid, 3, 3);
    p(ctx, cx + 4, ay + 3, PALETTE.tunicMid, 3, 3);
    p(ctx, cx - 6, ay + 6, PALETTE.skinMid, 2, 2);
    p(ctx, cx + 4, ay + 6, PALETTE.skinMid, 2, 2);

    // Bow curved down
    p(ctx, cx - 10, ay + 7, PALETTE.bowWood, 3, 2);
    p(ctx, cx - 7, ay + 8, PALETTE.bowWood, 4, 2);
    p(ctx, cx - 3, ay + 9, PALETTE.bowWoodLight, 6, 2);
    p(ctx, cx - 1, ay + 9, PALETTE.bowGrip, 3, 2);
    p(ctx, cx + 3, ay + 8, PALETTE.bowWood, 4, 2);
    p(ctx, cx + 7, ay + 7, PALETTE.bowWood, 3, 2);

    // String pulled up
    p(ctx, cx - 9, ay + 7, PALETTE.bowString, 4, 1);
    p(ctx, cx - 5, ay + 6, PALETTE.bowString, 4, 1);
    p(ctx, cx - 1, ay + 5, PALETTE.bowString, 2, 1);
    p(ctx, cx + 1, ay + 6, PALETTE.bowString, 4, 1);
    p(ctx, cx + 5, ay + 7, PALETTE.bowString, 4, 1);

    // Arrow pointed down
    p(ctx, cx, ay + 5, PALETTE.arrowFletch, 1, 2);
    p(ctx, cx, ay + 7, PALETTE.arrowShaft, 1, 6);
    p(ctx, cx - 1, ay + 13, PALETTE.arrowHead, 3, 2);
    p(ctx, cx, ay + 15, '#ffffff', 1, 1);
  } else if (frame === 2) {
    // Release
    p(ctx, cx - 7, ay + 2, PALETTE.tunicMid, 3, 3);
    p(ctx, cx + 4, ay + 2, PALETTE.tunicMid, 3, 3);
    p(ctx, cx - 7, ay + 5, PALETTE.skinMid, 2, 2);
    p(ctx, cx + 5, ay + 5, PALETTE.skinMid, 2, 2);

    // Bow flat
    p(ctx, cx - 9, ay + 8, PALETTE.bowWood, 18, 2);
    p(ctx, cx - 1, ay + 8, PALETTE.bowGrip, 3, 2);
    p(ctx, cx - 8, ay + 9, PALETTE.bowString, 16, 1);

    // Release puff
    p(ctx, cx, ay + 12, 'rgba(255,255,255,0.8)', 1, 3);
    p(ctx, cx - 1, ay + 13, PALETTE.slashGlow, 3, 1);
  }
}

/**
 * Draws the bow shooting action when facing NORTH (Up).
 */
function drawUpBow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  headY: number,
  frame: number
) {
  const ay = cy - 4 + headY;
  if (frame === 0) {
    // Raising bow
    p(ctx, cx - 7, ay, PALETTE.tunicShadow, 3, 3);
    p(ctx, cx + 4, ay, PALETTE.tunicShadow, 3, 3);
    p(ctx, cx - 8, ay - 3, PALETTE.bowWood, 16, 2);
    p(ctx, cx - 7, ay - 2, PALETTE.bowString, 14, 1);
  } else if (frame === 1) {
    // Full draw upward
    p(ctx, cx - 7, ay + 2, PALETTE.tunicShadow, 3, 3);
    p(ctx, cx + 4, ay + 2, PALETTE.tunicShadow, 3, 3);

    // Bow curved upward
    p(ctx, cx - 9, ay - 5, PALETTE.bowWood, 3, 2);
    p(ctx, cx - 6, ay - 6, PALETTE.bowWood, 4, 2);
    p(ctx, cx - 2, ay - 7, PALETTE.bowWoodLight, 4, 2);
    p(ctx, cx + 2, ay - 6, PALETTE.bowWood, 4, 2);
    p(ctx, cx + 6, ay - 5, PALETTE.bowWood, 3, 2);

    // String pulled down
    p(ctx, cx - 8, ay - 5, PALETTE.bowString, 4, 1);
    p(ctx, cx - 4, ay - 4, PALETTE.bowString, 4, 1);
    p(ctx, cx, ay - 3, PALETTE.bowString, 1, 1);
    p(ctx, cx + 1, ay - 4, PALETTE.bowString, 4, 1);
    p(ctx, cx + 4, ay - 5, PALETTE.bowString, 4, 1);

    // Arrow pointing up
    p(ctx, cx - 1, ay - 11, '#ffffff', 2, 2);
    p(ctx, cx, ay - 9, PALETTE.arrowShaft, 1, 6);
  } else if (frame === 2) {
    // Released
    p(ctx, cx - 7, ay, PALETTE.tunicShadow, 3, 3);
    p(ctx, cx + 4, ay, PALETTE.tunicShadow, 3, 3);
    p(ctx, cx - 8, ay - 6, PALETTE.bowWood, 16, 2);
    p(ctx, cx - 7, ay - 5, PALETTE.bowString, 14, 1);
    p(ctx, cx, ay - 10, PALETTE.slashGlow, 1, 3);
  }
}

/**
 * Draws an Arrow flying through the air with Moonlighter styling.
 */
export function drawArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Arrow length ~22px
  // Shadow underneath
  ctx.fillStyle = 'rgba(10, 28, 30, 0.4)';
  ctx.fillRect(-10, 2, 18, 1);

  // Wooden shaft
  ctx.fillStyle = PALETTE.arrowShaftShadow;
  ctx.fillRect(-10, 0, 16, 1);
  ctx.fillStyle = PALETTE.arrowShaft;
  ctx.fillRect(-10, -1, 16, 1);

  // Steel Arrowhead
  ctx.fillStyle = PALETTE.arrowHeadShadow;
  ctx.fillRect(5, -2, 4, 3);
  ctx.fillStyle = PALETTE.arrowHead;
  ctx.fillRect(6, -1, 3, 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(8, -0.5, 2, 1);

  // Teal fletching feathers
  ctx.fillStyle = PALETTE.arrowFletch;
  ctx.fillRect(-11, -3, 3, 1);
  ctx.fillRect(-10, -2, 3, 1);
  ctx.fillRect(-11, 2, 3, 1);
  ctx.fillRect(-10, 1, 3, 1);

  ctx.restore();
}

/**
 * Draws the Moonlighter Forest Slime Golem enemy.
 */
export function drawSlimeEnemy(
  ctx: CanvasRenderingContext2D,
  anim: 'idle' | 'walk',
  frame: number,
  isHit = false
) {
  const cx = ENEMY_PIVOT_X;
  const cy = ENEMY_PIVOT_Y - 8;

  let bodyY = 0;
  let bodyW = 18;
  let bodyH = 14;
  let hornWobble = 0;
  let feetY = 0;

  if (anim === 'idle') {
    switch (frame % 4) {
      case 0:
        bodyY = 0;
        bodyW = 18;
        bodyH = 14;
        break;
      case 1:
        bodyY = 1;
        bodyW = 20;
        bodyH = 13;
        hornWobble = 1;
        break;
      case 2:
        bodyY = -1;
        bodyW = 17;
        bodyH = 15;
        hornWobble = -1;
        break;
      case 3:
        bodyY = 0;
        bodyW = 18;
        bodyH = 14;
        break;
    }
  } else {
    // walk / hop
    switch (frame % 4) {
      case 0: // squash prep
        bodyY = 2;
        bodyW = 21;
        bodyH = 11;
        feetY = 0;
        break;
      case 1: // airborne leap!
        bodyY = -5;
        bodyW = 16;
        bodyH = 16;
        feetY = -2;
        hornWobble = 1;
        break;
      case 2: // apex float
        bodyY = -4;
        bodyW = 17;
        bodyH = 15;
        feetY = -2;
        hornWobble = -1;
        break;
      case 3: // impact squash
        bodyY = 1;
        bodyW = 21;
        bodyH = 12;
        feetY = 0;
        break;
    }
  }

  // Soft shadow
  p(ctx, cx - Math.floor(bodyW / 2), ENEMY_PIVOT_Y + 1, PALETTE.shadow, bodyW, 3);

  // Feet (2 little dark stubs)
  const footCol = isHit ? '#ffffff' : PALETTE.slimeFoot;
  p(ctx, cx - 6, cy + 6 + feetY, footCol, 3, 2);
  p(ctx, cx + 3, cy + 6 + feetY, footCol, 3, 2);

  // Main Slime Body (Curved dome)
  const bx = cx - Math.floor(bodyW / 2);
  const by = cy - 4 + bodyY;

  const baseCol = isHit ? '#ffffff' : PALETTE.slimeMid;
  const shadowCol = isHit ? '#ffc2c2' : PALETTE.slimeShadow;
  const lightCol = isHit ? '#ffffff' : PALETTE.slimeLight;
  const highCol = isHit ? '#ffffff' : PALETTE.slimeHighlight;
  const darkCol = isHit ? '#ff4d4d' : PALETTE.slimeDark;

  // Outline / shadow base
  p(ctx, bx + 2, by, darkCol, bodyW - 4, bodyH);
  p(ctx, bx, by + 2, darkCol, bodyW, bodyH - 3);

  // Inner body
  p(ctx, bx + 1, by + 1, shadowCol, bodyW - 2, bodyH - 2);
  p(ctx, bx + 2, by + 2, baseCol, bodyW - 4, bodyH - 4);

  // Highlight on top-left of jelly
  p(ctx, bx + 3, by + 2, lightCol, bodyW - 7, 3);
  p(ctx, bx + 4, by + 3, highCol, 4, 2);

  // Crystal / Sprout Horn on head
  const hx = cx + hornWobble;
  const hy = by - 4;
  const hornCol = isHit ? '#ffffff' : PALETTE.slimeHorn;
  const hornLight = isHit ? '#ffffff' : PALETTE.slimeHornLight;
  p(ctx, hx - 1, hy, hornCol, 2, 4);
  p(ctx, hx, hy - 1, hornLight, 2, 2);
  p(ctx, hx + 1, hy + 1, hornLight, 1, 2);

  // Eyes (Two expressive round eyes with glint)
  const eyeCol = isHit ? '#ff0000' : PALETTE.slimeEye;
  const glintCol = '#ffffff';

  const eyeY = by + 5;
  p(ctx, cx - 5, eyeY, eyeCol, 3, 3);
  p(ctx, cx - 5, eyeY, glintCol, 1, 1);

  p(ctx, cx + 2, eyeY, eyeCol, 3, 3);
  p(ctx, cx + 2, eyeY, glintCol, 1, 1);
}

export class SpriteSheetManager {
  private cache: Map<string, HTMLCanvasElement> = new Map();

  constructor() {
    this.prebakeAllSprites();
  }

  private getKey(direction: Direction, anim: AnimState, frame: number): string {
    return `${direction}_${anim}_${frame}`;
  }

  private prebakeAllSprites() {
    const directions: Direction[] = ['down', 'up', 'right', 'left'];
    const anims: AnimState[] = ['idle', 'walk', 'attack', 'bow'];

    for (const dir of directions) {
      for (const anim of anims) {
        const frameCount = anim === 'walk' ? 8 : anim === 'bow' ? 3 : 4;
        for (let f = 0; f < frameCount; f++) {
          const canvas = document.createElement('canvas');
          canvas.width = SPRITE_WIDTH;
          canvas.height = SPRITE_HEIGHT;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          ctx.imageSmoothingEnabled = false;

          if (dir === 'right') {
            drawSideSprite(ctx, anim, f);
          } else if (dir === 'left') {
            // Flip horizontally for Left
            ctx.save();
            ctx.translate(SPRITE_WIDTH, 0);
            ctx.scale(-1, 1);
            drawSideSprite(ctx, anim, f);
            ctx.restore();
          } else if (dir === 'down') {
            drawDownSprite(ctx, anim, f);
          } else if (dir === 'up') {
            drawUpSprite(ctx, anim, f);
          }

          this.cache.set(this.getKey(dir, anim, f), canvas);
        }
      }
    }

    // Prebake Enemy Sprites (both normal & hit flash states)
    const enemyAnims: ('idle' | 'walk')[] = ['idle', 'walk'];
    for (const anim of enemyAnims) {
      for (let f = 0; f < 4; f++) {
        for (const isHit of [false, true]) {
          const canvas = document.createElement('canvas');
          canvas.width = ENEMY_WIDTH;
          canvas.height = ENEMY_HEIGHT;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          ctx.imageSmoothingEnabled = false;
          drawSlimeEnemy(ctx, anim, f, isHit);

          const key = `enemy_${anim}_${f}_${isHit ? 'hit' : 'normal'}`;
          this.cache.set(key, canvas);
        }
      }
    }
  }

  public getFrame(direction: Direction, anim: AnimState, frameIndex: number): HTMLCanvasElement | null {
    const maxFrames = anim === 'walk' ? 8 : anim === 'bow' ? 3 : 4;
    const safeFrame = frameIndex % maxFrames;
    const key = this.getKey(direction, anim, safeFrame);
    return this.cache.get(key) || null;
  }

  public getEnemyFrame(anim: 'idle' | 'walk', frameIndex: number, isHit: boolean): HTMLCanvasElement | null {
    const key = `enemy_${anim}_${frameIndex % 4}_${isHit ? 'hit' : 'normal'}`;
    return this.cache.get(key) || null;
  }
}
