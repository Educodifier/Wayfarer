import { Direction } from '../types';

export interface DungeonProp {
  id: string;
  type: 'pillar_crystal' | 'crate_stack' | 'urn_cluster' | 'urn_single' | 'torch_sconce' | 'relic_altar';
  x: number;
  y: number;
  width: number;
  height: number;
  colliderRadius: number;
  render: (ctx: CanvasRenderingContext2D, time: number) => void;
}

export interface LightSource {
  x: number;
  y: number;
  radius: number;
  colorInner: string;
  colorOuter: string;
  intensity: number;
  flickerSpeed?: number;
}

export class DungeonEnvironment {
  private floorCanvas: HTMLCanvasElement;
  public roomWidth = 1400;
  public roomHeight = 1000;
  public pitWidth = 190; // Left abyss/chasm
  public props: DungeonProp[] = [];
  public lights: LightSource[] = [];

  constructor() {
    this.floorCanvas = document.createElement('canvas');
    this.floorCanvas.width = this.roomWidth;
    this.floorCanvas.height = this.roomHeight;
    this.initPropsAndLights();
    this.generateFloorTexture();
  }

  private initPropsAndLights() {
    // 1. Ancient Crystal Pillars (Electric purple & neon cyan bioluminescent tech)
    const crystalLocations = [
      { x: 440, y: 220, color: 'cyan' },
      { x: 1200, y: 240, color: 'purple' },
      { x: 500, y: 790, color: 'purple' },
      { x: 1140, y: 780, color: 'cyan' },
    ];

    crystalLocations.forEach((loc, idx) => {
      this.props.push({
        id: `crystal_${idx}`,
        type: 'pillar_crystal',
        x: loc.x,
        y: loc.y,
        width: 32,
        height: 52,
        colliderRadius: 16,
        render: (ctx, time) => this.drawCrystalPillar(ctx, loc.x, loc.y, loc.color as 'cyan' | 'purple', time),
      });

      this.lights.push({
        x: loc.x,
        y: loc.y - 20,
        radius: 175,
        colorInner: loc.color === 'cyan' ? 'rgba(109, 242, 226, 0.28)' : 'rgba(192, 132, 252, 0.28)',
        colorOuter: loc.color === 'cyan' ? 'rgba(34, 131, 119, 0.02)' : 'rgba(112, 50, 168, 0.02)',
        intensity: 0.9,
        flickerSpeed: 2.1,
      });
    });

    // 2. Wooden Merchant Supply Crates & Pottery Jars (Warm cozy golds & rich wood browns)
    this.props.push({
      id: 'crates_top_left',
      type: 'crate_stack',
      x: 350,
      y: 150,
      width: 44,
      height: 38,
      colliderRadius: 20,
      render: (ctx) => this.drawCrateStack(ctx, 350, 150),
    });

    this.props.push({
      id: 'urns_top_center',
      type: 'urn_cluster',
      x: 780,
      y: 130,
      width: 36,
      height: 28,
      colliderRadius: 15,
      render: (ctx) => this.drawUrnCluster(ctx, 780, 130),
    });

    this.props.push({
      id: 'crates_bottom_left',
      type: 'crate_stack',
      x: 370,
      y: 840,
      width: 44,
      height: 38,
      colliderRadius: 20,
      render: (ctx) => this.drawCrateStack(ctx, 370, 840),
    });

    this.props.push({
      id: 'crates_bottom_right',
      type: 'crate_stack',
      x: 1240,
      y: 710,
      width: 44,
      height: 38,
      colliderRadius: 20,
      render: (ctx) => this.drawCrateStack(ctx, 1240, 710),
    });

    this.props.push({
      id: 'urns_ritual_side',
      type: 'urn_single',
      x: 970,
      y: 440,
      width: 20,
      height: 22,
      colliderRadius: 10,
      render: (ctx) => this.drawUrnSingle(ctx, 970, 440),
    });

    // 3. Wall Torches / Braziers (Warm amber firelight casting cozy glow)
    const torchCoords = [
      { x: 310, y: 44 },
      { x: 670, y: 44 },
      { x: 990, y: 44 },
      { x: 1260, y: 44 },
      { x: 670, y: 956 },
      { x: 990, y: 956 },
    ];

    torchCoords.forEach((t, idx) => {
      this.props.push({
        id: `torch_${idx}`,
        type: 'torch_sconce',
        x: t.x,
        y: t.y,
        width: 16,
        height: 26,
        colliderRadius: 8,
        render: (ctx, time) => this.drawTorchSconce(ctx, t.x, t.y, time),
      });

      this.lights.push({
        x: t.x,
        y: t.y + 4,
        radius: 195,
        colorInner: 'rgba(255, 184, 77, 0.32)',
        colorOuter: 'rgba(217, 119, 6, 0.02)',
        intensity: 0.95,
        flickerSpeed: 4.8 + (idx % 3) * 0.7,
      });
    });

    // 4. Central Grand Ritual Stone Rune Glow
    this.lights.push({
      x: 820,
      y: 500,
      radius: 240,
      colorInner: 'rgba(80, 240, 220, 0.22)',
      colorOuter: 'rgba(20, 95, 90, 0.01)',
      intensity: 0.85,
      flickerSpeed: 1.5,
    });
  }

  private generateFloorTexture() {
    const ctx = this.floorCanvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    // 1. Deep dungeon abyssal foundation
    ctx.fillStyle = '#081619';
    ctx.fillRect(0, 0, this.roomWidth, this.roomHeight);

    const tileSize = 48;
    const cols = Math.ceil(this.roomWidth / tileSize);
    const rows = Math.ceil(this.roomHeight / tileSize);

    let seed = 1337;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // 2. Modern 16-bit Slate & Deep Cyan Flagstone Palette
    const stoneColors = [
      '#1a3a3e',
      '#1c4044',
      '#173437',
      '#1e464a',
      '#163235',
      '#214a4f',
    ];

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = c * tileSize;
        const y = r * tileSize;

        // Skip abyss area on left
        if (x < this.pitWidth - 10) continue;

        const colIdx = Math.floor(random() * stoneColors.length);
        ctx.fillStyle = stoneColors[colIdx];
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

        // Top-left 3D beveled light seam (Moonlighter top-down lighting)
        ctx.fillStyle = 'rgba(100, 200, 195, 0.12)';
        ctx.fillRect(x + 1, y + 1, tileSize - 2, 1);
        ctx.fillRect(x + 1, y + 1, 1, tileSize - 2);

        // Bottom-right 3D beveled shadow
        ctx.fillStyle = 'rgba(5, 14, 16, 0.55)';
        ctx.fillRect(x + 1, y + tileSize - 2, tileSize - 2, 1);
        ctx.fillRect(x + tileSize - 2, y + 1, 1, tileSize - 2);

        // Grout line depth
        ctx.fillStyle = '#0a1a1d';
        ctx.fillRect(x, y, tileSize, 1);
        ctx.fillRect(x, y, 1, tileSize);

        // Occasional stone texture micro-details
        const rnd = random();
        if (rnd > 0.82) {
          // Fine stone crack
          ctx.fillStyle = '#0a1618';
          ctx.fillRect(x + 10, y + 14, 5, 1);
          ctx.fillRect(x + 14, y + 15, 7, 1);
          ctx.fillRect(x + 20, y + 16, 4, 1);
          ctx.fillStyle = 'rgba(85, 185, 180, 0.1)';
          ctx.fillRect(x + 14, y + 16, 7, 1);
        } else if (rnd > 0.68) {
          // Embedded flagstone pebble / wear
          ctx.fillStyle = '#29575d';
          ctx.fillRect(x + 18, y + 20, 5, 4);
          ctx.fillStyle = '#0f2427';
          ctx.fillRect(x + 18, y + 24, 5, 1);
          ctx.fillStyle = '#4da2a8';
          ctx.fillRect(x + 18, y + 20, 4, 1);
        } else if (rnd < 0.15) {
          // Organic ground moss patch (emerald & forest green accents)
          ctx.fillStyle = '#143d34';
          ctx.fillRect(x + 24, y + 28, 8, 5);
          ctx.fillStyle = '#1f574a';
          ctx.fillRect(x + 26, y + 29, 5, 3);
          ctx.fillStyle = '#3eb89a';
          ctx.fillRect(x + 27, y + 30, 2, 1);
        }
      }
    }

    // 3. Ancient Floor Inlays & Grand Ritual Seal (Moonlighter signature carved floor runes)
    this.drawRitualFloorCircle(ctx, 820, 500);

    // Minor decorative floor glyphs at dais waypoints
    this.drawMiniRuneGlyph(ctx, 500, 340, '#3ec7b5');
    this.drawMiniRuneGlyph(ctx, 1140, 340, '#f5c342');
    this.drawMiniRuneGlyph(ctx, 580, 680, '#f5c342');
    this.drawMiniRuneGlyph(ctx, 1060, 680, '#3ec7b5');

    // 4. Left Deep Chasm / Abyss with multi-layer rock strata & glowing crystals
    // Void base
    ctx.fillStyle = '#030809';
    ctx.fillRect(0, 0, this.pitWidth, this.roomHeight);

    // Abyss cliff jagged rocky rim with depth layers
    for (let y = 0; y < this.roomHeight; y += 6) {
      const wobble = Math.sin(y * 0.04) * 10 + Math.cos(y * 0.11) * 14;
      const cliffX = this.pitWidth + wobble;

      // Dark under-strata
      ctx.fillStyle = '#071214';
      ctx.fillRect(0, y, cliffX - 4, 6);

      // Mid rock face
      ctx.fillStyle = '#0f272a';
      ctx.fillRect(cliffX - 8, y, 6, 6);

      // Rocky highlight on top lip
      ctx.fillStyle = '#1a4146';
      ctx.fillRect(cliffX - 3, y, 3, 6);
      ctx.fillStyle = '#3a878e';
      ctx.fillRect(cliffX - 1, y + 1, 2, 4);

      // Occasional glowing cyan crystal shard embedded in the cliff edge
      if (Math.sin(y * 0.2) > 0.85) {
        ctx.fillStyle = '#6df2e2';
        ctx.fillRect(cliffX - 2, y + 1, 3, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cliffX - 1, y + 1, 1, 1);
      }
    }

    // 5. Perimeter Ancient Dungeon Walls & Moulding
    const wallThick = 44;

    // Top Wall (Stone masonry with hanging ivy & decorative cornice)
    ctx.fillStyle = '#071416';
    ctx.fillRect(0, 0, this.roomWidth, wallThick);

    // Wall stone blocks
    for (let x = this.pitWidth; x < this.roomWidth; x += 40) {
      ctx.fillStyle = '#0c2226';
      ctx.fillRect(x, 2, 38, wallThick - 10);
      ctx.fillStyle = '#13353b';
      ctx.fillRect(x + 1, 3, 36, 2);
      ctx.fillStyle = '#061113';
      ctx.fillRect(x, wallThick - 9, 38, 1);
    }

    // Bottom Wall
    ctx.fillStyle = '#061214';
    ctx.fillRect(0, this.roomHeight - wallThick, this.roomWidth, wallThick);
    ctx.fillStyle = '#1b4146';
    ctx.fillRect(this.pitWidth, this.roomHeight - wallThick, this.roomWidth, 3);
    ctx.fillStyle = '#0e262a';
    ctx.fillRect(this.pitWidth, this.roomHeight - wallThick + 3, this.roomWidth, 5);

    // Right Wall
    ctx.fillStyle = '#081719';
    ctx.fillRect(this.roomWidth - wallThick, 0, wallThick, this.roomHeight);
    ctx.fillStyle = '#183c41';
    ctx.fillRect(this.roomWidth - wallThick, 0, 3, this.roomHeight);

    // Decorative Hanging Ivy / Overgrown Dungeon Vines from top wall
    this.drawWallIvy(ctx);
  }

  // Draw intricate circular ritual seal in the chamber center
  private drawRitualFloorCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    ctx.save();
    // Outer stone bezel
    ctx.beginPath();
    ctx.arc(cx, cy, 110, 0, Math.PI * 2);
    ctx.strokeStyle = '#122f33';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 106, 0, Math.PI * 2);
    ctx.strokeStyle = '#275e65';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inlaid gold ring
    ctx.beginPath();
    ctx.arc(cx, cy, 96, 0, Math.PI * 2);
    ctx.strokeStyle = '#85621f';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 95, 0, Math.PI * 2);
    ctx.strokeStyle = '#d4a23b';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner glowing cyan rune circle
    ctx.beginPath();
    ctx.arc(cx, cy, 74, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(109, 242, 226, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Radial spokes & runes
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const x1 = cx + Math.cos(angle) * 36;
      const y1 = cy + Math.sin(angle) * 36;
      const x2 = cx + Math.cos(angle) * 74;
      const y2 = cy + Math.sin(angle) * 74;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = 'rgba(78, 194, 180, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rune node circles
      ctx.beginPath();
      ctx.arc(x2, y2, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#6df2e2';
      ctx.fill();
    }

    // Central sunburst medallion
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#163a3e';
    ctx.fill();
    ctx.strokeStyle = '#d4a23b';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#2b787b';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#6df2e2';
    ctx.fill();

    ctx.restore();
  }

  // Draw small arcane floor glyph
  private drawMiniRuneGlyph(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(20, 50, 54, 0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Cross glyph
    ctx.fillStyle = color;
    ctx.fillRect(x - 8, y - 1, 16, 2);
    ctx.fillRect(x - 1, y - 8, 2, 16);
    ctx.fillRect(x - 2, y - 2, 4, 4);
    ctx.restore();
  }

  // Hanging ivy creeping from walls
  private drawWallIvy(ctx: CanvasRenderingContext2D) {
    const ivySpawns = [280, 420, 560, 720, 890, 1050, 1200, 1310];
    ivySpawns.forEach((ix, i) => {
      const length = 16 + (i % 3) * 10;
      ctx.fillStyle = '#0f382f';
      ctx.fillRect(ix, 42, 12, length);
      ctx.fillStyle = '#1d5e50';
      ctx.fillRect(ix + 2, 44, 8, length - 4);
      ctx.fillStyle = '#39ad91';
      ctx.fillRect(ix + 3, 46, 5, length - 8);
      // Leaves cluster
      ctx.fillStyle = '#5eead4';
      ctx.fillRect(ix + 4, 42 + length - 3, 4, 3);
      ctx.fillRect(ix + 1, 42 + length - 6, 3, 3);
    });
  }

  // Prop: Bioluminescent Crystal Pillar (Ancient Dungeon Tech)
  private drawCrystalPillar(ctx: CanvasRenderingContext2D, x: number, y: number, color: 'cyan' | 'purple', time: number) {
    // Drop Shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y + 2, 18, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(3, 10, 12, 0.6)';
    ctx.fill();

    // Carved Stone Base Pedestal
    const bx = x - 14;
    const by = y - 16;
    ctx.fillStyle = '#0d2225';
    ctx.fillRect(bx, by, 28, 16);
    ctx.fillStyle = '#1c4449';
    ctx.fillRect(bx + 2, by + 2, 24, 12);
    ctx.fillStyle = '#2b656c';
    ctx.fillRect(bx + 2, by + 2, 24, 2); // Highlight
    ctx.fillStyle = '#081719';
    ctx.fillRect(bx, by + 15, 28, 2); // Shadow

    // Inlaid brass rune plate
    ctx.fillStyle = '#b0811a';
    ctx.fillRect(x - 5, by + 5, 10, 7);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(x - 3, by + 7, 6, 3);

    // Glowing Crystal Core (Vertical faceted spire)
    const pulse = Math.sin(time * 2.8 + x) * 0.18 + 0.82;
    const cx = x - 7;
    const cy = by - 32;

    const baseCol = color === 'cyan' ? '#1b7d72' : '#6b21a8';
    const midCol = color === 'cyan' ? '#3ec7b5' : '#a855f7';
    const lightCol = color === 'cyan' ? '#83f5e3' : '#d8b4fe';
    const coreCol = '#ffffff';

    // Crystal Shards
    ctx.fillStyle = baseCol;
    ctx.beginPath();
    ctx.moveTo(x, cy - 6);
    ctx.lineTo(x + 8, cy + 20);
    ctx.lineTo(x - 8, cy + 20);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = midCol;
    ctx.beginPath();
    ctx.moveTo(x, cy - 6);
    ctx.lineTo(x + 4, cy + 20);
    ctx.lineTo(x - 6, cy + 20);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = lightCol;
    ctx.beginPath();
    ctx.moveTo(x - 1, cy - 4);
    ctx.lineTo(x + 3, cy + 18);
    ctx.lineTo(x - 3, cy + 18);
    ctx.closePath();
    ctx.fill();

    // High energy glint
    ctx.fillStyle = coreCol;
    ctx.fillRect(x - 1, cy + 2, 2, 8);

    // Crystal floating aura
    ctx.save();
    ctx.globalAlpha = pulse * 0.45;
    ctx.fillStyle = color === 'cyan' ? '#6df2e2' : '#c084fc';
    ctx.beginPath();
    ctx.arc(x, cy + 10, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // Prop: Wooden Supply Crates (Warm Oak & Brass Corners - cozy merchant aesthetic)
  private drawCrateStack(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    // Drop shadow
    ctx.beginPath();
    ctx.ellipse(x + 2, y + 2, 22, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(3, 10, 12, 0.6)';
    ctx.fill();

    // Bottom Crate
    const cx1 = x - 18;
    const cy1 = y - 22;
    // Wood body
    ctx.fillStyle = '#3a1e0b';
    ctx.fillRect(cx1, cy1, 28, 22);
    ctx.fillStyle = '#6e3917';
    ctx.fillRect(cx1 + 1, cy1 + 1, 26, 20);
    // Planks
    ctx.fillStyle = '#8f4f22';
    ctx.fillRect(cx1 + 3, cy1 + 2, 22, 5);
    ctx.fillRect(cx1 + 3, cy1 + 9, 22, 5);
    ctx.fillRect(cx1 + 3, cy1 + 16, 22, 4);
    // Brass corner braces & cross strap
    ctx.fillStyle = '#eab308';
    ctx.fillRect(cx1 + 1, cy1 + 1, 4, 4);
    ctx.fillRect(cx1 + 23, cy1 + 1, 4, 4);
    ctx.fillRect(cx1 + 1, cy1 + 17, 4, 4);
    ctx.fillRect(cx1 + 23, cy1 + 17, 4, 4);
    ctx.fillStyle = '#261307';
    ctx.fillRect(cx1 + 12, cy1 + 1, 4, 20);

    // Top Smaller Crate resting offset
    const cx2 = x - 4;
    const cy2 = y - 36;
    ctx.fillStyle = '#3a1e0b';
    ctx.fillRect(cx2, cy2, 20, 16);
    ctx.fillStyle = '#7a401a';
    ctx.fillRect(cx2 + 1, cy2 + 1, 18, 14);
    ctx.fillStyle = '#9e5626';
    ctx.fillRect(cx2 + 2, cy2 + 2, 16, 5);
    ctx.fillRect(cx2 + 2, cy2 + 8, 16, 5);
    // Brass buckle
    ctx.fillStyle = '#fde047';
    ctx.fillRect(cx2 + 8, cy2 + 6, 4, 4);
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(cx2 + 9, cy2 + 7, 2, 2);

    // Ceramic vase sitting next to crates
    this.drawUrnSingle(ctx, x + 16, y - 4);

    ctx.restore();
  }

  // Prop: Single Ceramic Dungeon Urn
  private drawUrnSingle(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    // Shadow
    ctx.beginPath();
    ctx.ellipse(x, y + 1, 8, 3.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(3, 10, 12, 0.55)';
    ctx.fill();

    const ux = x - 7;
    const uy = y - 18;
    // Terracotta clay body
    ctx.fillStyle = '#4a2511';
    ctx.fillRect(ux, uy, 14, 18);
    ctx.fillStyle = '#a85d31';
    ctx.fillRect(ux + 1, uy + 1, 12, 16);
    ctx.fillStyle = '#cf7d48';
    ctx.fillRect(ux + 2, uy + 2, 6, 14);
    // Glazed teal decorative band
    ctx.fillStyle = '#1d5e56';
    ctx.fillRect(ux + 1, uy + 6, 12, 4);
    ctx.fillStyle = '#4ee2cf';
    ctx.fillRect(ux + 2, uy + 7, 10, 2);
    // Lip rim
    ctx.fillStyle = '#df8f5a';
    ctx.fillRect(ux + 2, uy - 1, 10, 2);
    ctx.restore();
  }

  // Prop: Cluster of 2 Ceramic Urns
  private drawUrnCluster(ctx: CanvasRenderingContext2D, x: number, y: number) {
    this.drawUrnSingle(ctx, x - 8, y);
    this.drawUrnSingle(ctx, x + 8, y + 2);
  }

  // Prop: Wall Torch Sconce with animated flame
  private drawTorchSconce(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
    ctx.save();
    // Iron bracket
    ctx.fillStyle = '#091517';
    ctx.fillRect(x - 2, y, 4, 16);
    ctx.fillStyle = '#1b3f44';
    ctx.fillRect(x - 3, y + 12, 6, 3);
    ctx.fillStyle = '#305f66';
    ctx.fillRect(x - 4, y + 2, 8, 3); // Cup holder

    // Animated Fire Flame
    const flicker = Math.sin(time * 12 + x) * 1.5;
    const fx = x - 4;
    const fy = y - 8 + flicker * 0.4;

    // Outer amber fire
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(fx, fy + 8);
    ctx.lineTo(fx + 8, fy + 8);
    ctx.lineTo(fx + 5 + flicker * 0.4, fy);
    ctx.closePath();
    ctx.fill();

    // Inner bright yellow flame
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(fx + 2, fy + 7);
    ctx.lineTo(fx + 6, fy + 7);
    ctx.lineTo(fx + 4, fy + 2);
    ctx.closePath();
    ctx.fill();

    // White core spark
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx + 3, fy + 4, 2, 3);

    ctx.restore();
  }

  // Main Render Call: Draws Floor and base static layers
  public renderFloor(ctx: CanvasRenderingContext2D, time: number) {
    ctx.drawImage(this.floorCanvas, 0, 0);

    // Dynamic Chasm Abyss Mist (Floating ethereal vapor over left pit)
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const mistY = ((time * 25 + i * 260) % (this.roomHeight + 100)) - 50;
      const mistWobble = Math.sin(time * 1.2 + i) * 20;
      const mistGrad = ctx.createRadialGradient(
        this.pitWidth * 0.5 + mistWobble,
        mistY,
        15,
        this.pitWidth * 0.5 + mistWobble,
        mistY,
        110
      );
      mistGrad.addColorStop(0, 'rgba(46, 125, 120, 0.12)');
      mistGrad.addColorStop(0.6, 'rgba(20, 65, 65, 0.05)');
      mistGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = mistGrad;
      ctx.beginPath();
      ctx.arc(this.pitWidth * 0.5 + mistWobble, mistY, 110, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Emissive & Layered Lighting Pass: Simulated dynamic lighting & soft dark vignette
  public renderLighting(ctx: CanvasRenderingContext2D, charX: number, charY: number, time: number) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // 1. Player's Personal Lantern Aura (Warm cream & bioluminescent cyan core)
    const playerLight = ctx.createRadialGradient(charX, charY - 10, 8, charX, charY - 10, 240);
    playerLight.addColorStop(0, 'rgba(120, 245, 235, 0.26)');
    playerLight.addColorStop(0.35, 'rgba(45, 160, 165, 0.14)');
    playerLight.addColorStop(0.75, 'rgba(15, 60, 65, 0.04)');
    playerLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = playerLight;
    ctx.fillRect(charX - 240, charY - 250, 480, 480);

    // 2. Room Emissive Lights (Crystal pillars, wall torches, arcane runes)
    for (const light of this.lights) {
      const flickSpeed = light.flickerSpeed || 2.0;
      const flick = 1.0 + Math.sin(time * flickSpeed + light.x) * 0.08;
      const rad = light.radius * flick;

      const g = ctx.createRadialGradient(light.x, light.y, 6, light.x, light.y, rad);
      g.addColorStop(0, light.colorInner);
      g.addColorStop(1, light.colorOuter);
      ctx.fillStyle = g;
      ctx.fillRect(light.x - rad, light.y - rad, rad * 2, rad * 2);
    }

    ctx.restore();

    // 3. Cinematic Color-Grade / Vignette around dungeon perimeter
    ctx.save();
    const vignette = ctx.createRadialGradient(
      this.roomWidth * 0.5,
      this.roomHeight * 0.5,
      350,
      this.roomWidth * 0.5,
      this.roomHeight * 0.5,
      760
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.65, 'rgba(4, 14, 16, 0.15)');
    vignette.addColorStop(1, 'rgba(2, 6, 8, 0.45)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, this.roomWidth, this.roomHeight);
    ctx.restore();
  }
}
