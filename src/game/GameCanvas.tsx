import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Direction, AnimState, DustParticle, BowArrow, Enemy, AmbientMote, DefeatEffect, DamagePopup, DefeatParticle, EnergyOrb } from '../types';
import {
  SpriteSheetManager,
  SPRITE_WIDTH,
  SPRITE_HEIGHT,
  PIVOT_X,
  PIVOT_Y,
  PALETTE,
  drawArrow,
  ENEMY_PIVOT_X,
  ENEMY_PIVOT_Y,
} from './spriteSheets';
import { DungeonEnvironment } from './environment';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Gauge, RotateCcw, Sword, ZoomIn, Crosshair, Heart, Sparkles, Shield, Skull } from 'lucide-react';

interface SlashSpark {
  id: number;
  x: number;
  y: number;
  size: number;
  alpha: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
}

const createAmbientMotes = (count: number, roomWidth: number, roomHeight: number): AmbientMote[] => {
  const motes: AmbientMote[] = [];
  const colors = ['#6df2e2', '#3ec7b5', '#ffd166', '#f59e0b', '#ffffff', '#a7f3d0'];
  for (let i = 0; i < count; i++) {
    motes.push({
      id: i,
      x: 180 + Math.random() * (roomWidth - 210),
      y: 50 + Math.random() * (roomHeight - 100),
      vx: Math.random() * 8 - 4,
      vy: -(Math.random() * 9 + 4),
      size: Math.random() > 0.85 ? 2.5 : Math.random() > 0.45 ? 2.0 : 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      baseAlpha: 0.35 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 1.2 + Math.random() * 2.0,
    });
  }
  return motes;
};

const createDefaultEnemies = (): Enemy[] => [
  {
    id: 1,
    x: 540,
    y: 300,
    vx: 0,
    vy: 0,
    direction: 'down',
    frame: 0,
    animTimer: 0,
    stateTimer: 0,
    isMoving: true,
    hp: 10,
    maxHp: 10,
    hitFlashTimer: 0,
    knockbackVx: 0,
    knockbackVy: 0,
    radius: 13,
    wanderAngle: 0.9,
    speed: 38,
  },
  {
    id: 2,
    x: 760,
    y: 440,
    vx: 0,
    vy: 0,
    direction: 'left',
    frame: 1,
    animTimer: 0,
    stateTimer: 0.7,
    isMoving: false,
    hp: 10,
    maxHp: 10,
    hitFlashTimer: 0,
    knockbackVx: 0,
    knockbackVy: 0,
    radius: 13,
    wanderAngle: 2.5,
    speed: 42,
  },
  {
    id: 3,
    x: 640,
    y: 700,
    vx: 0,
    vy: 0,
    direction: 'up',
    frame: 2,
    animTimer: 0,
    stateTimer: 1.3,
    isMoving: true,
    hp: 10,
    maxHp: 10,
    hitFlashTimer: 0,
    knockbackVx: 0,
    knockbackVy: 0,
    radius: 13,
    wanderAngle: -1.3,
    speed: 36,
  },
  {
    id: 4,
    x: 960,
    y: 360,
    vx: 0,
    vy: 0,
    direction: 'right',
    frame: 3,
    animTimer: 0,
    stateTimer: 0.4,
    isMoving: true,
    hp: 10,
    maxHp: 10,
    hitFlashTimer: 0,
    knockbackVx: 0,
    knockbackVy: 0,
    radius: 13,
    wanderAngle: 3.1,
    speed: 40,
  },
  {
    id: 5,
    x: 880,
    y: 660,
    vx: 0,
    vy: 0,
    direction: 'down',
    frame: 0,
    animTimer: 0,
    stateTimer: 1.9,
    isMoving: false,
    hp: 10,
    maxHp: 10,
    hitFlashTimer: 0,
    knockbackVx: 0,
    knockbackVy: 0,
    radius: 13,
    wanderAngle: 1.6,
    speed: 38,
  },
];

export const GameCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game state held in refs for 60fps loop performance
  const charPos = useRef({ x: 380, y: 360 });
  const charVel = useRef({ vx: 0, vy: 0 });
  const attackLunge = useRef({ vx: 0, vy: 0 });
  const charDirection = useRef<Direction>('right');
  const charAnimState = useRef<AnimState>('idle');
  const charFrame = useRef<number>(0);
  const animTimer = useRef<number>(0);
  const dustTimer = useRef<number>(0);
  const dustParticles = useRef<DustParticle[]>([]);
  const slashSparks = useRef<SlashSpark[]>([]);
  const ambientMotes = useRef<AmbientMote[]>(createAmbientMotes(45, 1400, 1000));
  const screenShake = useRef<number>(0);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const lastTime = useRef<number>(performance.now());
  const speedMultiplier = useRef<number>(1);
  const isPaused = useRef<boolean>(false);

  // Bow attack state & projectiles
  const arrows = useRef<BowArrow[]>([]);

  // Enemies roaming the dungeon
  const enemies = useRef<Enemy[]>(createDefaultEnemies());
  const nextEnemyId = useRef<number>(6);
  const defeatedCount = useRef<number>(0);

  // Defeat explosion effects & floating combat popups
  const defeatEffects = useRef<DefeatEffect[]>([]);
  const damagePopups = useRef<DamagePopup[]>([]);

  // Player Health & Currency / XP System (Base 10 HP bars, 1 damage per hit)
  const playerHp = useRef<number>(10);
  const playerOrbs = useRef<number>(0);
  const energyOrbs = useRef<EnergyOrb[]>([]);

  // Weapon Upgrade Progression (Counter up to 10/10 -> +1 DMG)
  const swordLevel = useRef<number>(1);
  const swordProgress = useRef<number>(0);
  const bowLevel = useRef<number>(1);
  const bowProgress = useRef<number>(0);

  // Player Damage animation state (invulnerability & knockback)
  const playerHurtTimer = useRef<number>(0);
  const playerKnockback = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });

  // Zoom level: default stock view zoomed out further (1.8x)
  const currentZoom = useRef<number>(1.8);
  const [zoomDisplay, setZoomDisplay] = useState<number>(1.8);

  // Read-only UI state for HUD display
  const [hudState, setHudState] = useState({
    direction: 'right' as Direction,
    animState: 'idle' as AnimState,
    frame: 0,
    speed: 1,
    isMoving: false,
    isHurt: false,
    enemyCount: 5,
    defeatedCount: 0,
    playerHp: 10,
    playerOrbs: 0,
    swordProgress: 0,
    swordLevel: 1,
    bowProgress: 0,
    bowLevel: 1,
    activeKeys: {
      up: false,
      down: false,
      left: false,
      right: false,
      attack: false,
      bow: false,
    },
  });

  const spriteManager = useRef<SpriteSheetManager | null>(null);
  const environment = useRef<DungeonEnvironment | null>(null);

  // Helper to spawn impact / effect sparks
  const spawnSparks = (x: number, y: number, colors: string[], count = 6, baseSpeed = 80) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = baseSpeed * (0.5 + Math.random() * 0.8);
      slashSparks.current.push({
        id: Math.random(),
        x: x + (Math.random() * 6 - 3),
        y: y + (Math.random() * 6 - 3),
        size: 1.5 + Math.random() * 2,
        alpha: 1,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: 0.18 + Math.random() * 0.14,
      });
    }
  };

  // Spawn slash sparks when sword hits apex
  const spawnSlashSparks = (x: number, y: number, dir: Direction) => {
    let baseOffsetX = 0;
    let baseOffsetY = -10;
    let dirVx = 0;
    let dirVy = 0;

    if (dir === 'right') {
      baseOffsetX = 18;
      dirVx = 55;
    } else if (dir === 'left') {
      baseOffsetX = -18;
      dirVx = -55;
    } else if (dir === 'down') {
      baseOffsetY = 12;
      dirVy = 55;
    } else if (dir === 'up') {
      baseOffsetY = -24;
      dirVy = -55;
    }

    const colors = ['#ffffff', '#6df2e2', '#bbf7f0', '#2fb8a9'];

    for (let i = 0; i < 7; i++) {
      slashSparks.current.push({
        id: Math.random(),
        x: x + baseOffsetX + (Math.random() * 8 - 4),
        y: y + baseOffsetY + (Math.random() * 8 - 4),
        size: 1.5 + Math.random() * 2,
        alpha: 1,
        vx: dirVx + (Math.random() * 50 - 25),
        vy: dirVy + (Math.random() * 50 - 25),
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: 0.22 + Math.random() * 0.12,
      });
    }
  };

  // Randomly spawn in a new enemy nearby with arcane summoning emergence
  const spawnNewEnemyNearby = useCallback((originX: number, originY: number) => {
    const env = environment.current;
    const minX = env ? env.pitWidth + 40 : 220;
    const maxX = env ? env.roomWidth - 60 : 1340;
    const minY = 70;
    const maxY = env ? env.roomHeight - 70 : 930;

    let spawnX = originX;
    let spawnY = originY;
    let valid = false;

    // Search for a suitable nearby location (130px to 260px offset)
    for (let attempts = 0; attempts < 16; attempts++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 130 + Math.random() * 140;
      const testX = originX + Math.cos(angle) * dist;
      const testY = originY + Math.sin(angle) * dist;

      if (testX >= minX && testX <= maxX && testY >= minY && testY <= maxY) {
        let collidesProp = false;
        if (env) {
          for (const prop of env.props) {
            if (Math.hypot(testX - prop.x, testY - prop.y) < prop.colliderRadius + 22) {
              collidesProp = true;
              break;
            }
          }
        }
        if (!collidesProp) {
          spawnX = testX;
          spawnY = testY;
          valid = true;
          break;
        }
      }
    }

    if (!valid) {
      spawnX = Math.max(minX, Math.min(maxX, originX + (Math.random() * 160 - 80)));
      spawnY = Math.max(minY, Math.min(maxY, originY + (Math.random() * 160 - 80)));
    }

    const directions: Direction[] = ['down', 'left', 'right', 'up'];
    const newEnemy: Enemy = {
      id: nextEnemyId.current++,
      x: spawnX,
      y: spawnY,
      vx: 0,
      vy: 0,
      direction: directions[Math.floor(Math.random() * directions.length)],
      frame: 0,
      animTimer: 0,
      stateTimer: Math.random() * 1.5,
      isMoving: true,
      hp: 10,
      maxHp: 10,
      hitFlashTimer: 0.15,
      knockbackVx: 0,
      knockbackVy: 0,
      radius: 13,
      wanderAngle: Math.random() * Math.PI * 2,
      speed: 36 + Math.random() * 8,
      spawnTimer: 0.65, // Emergence summoning animation
    };

    enemies.current.push(newEnemy);

    // Summoning emergence particles
    spawnSparks(spawnX, spawnY - 6, ['#ffffff', '#6df2e2', '#3ec7b5', '#ffd166'], 12, 100);
  }, []);

  // Trigger satisfying defeat animation for an enemy and spawn a replacement nearby
  const triggerEnemyDefeat = useCallback((defeatedEnemy: Enemy) => {
    // 1. Visceral tactile impact crunch
    screenShake.current = Math.max(screenShake.current, 5.2);
    defeatedCount.current += 1;

    // 2. Exploding slime droplets + soul motes + golden essence shards
    const particles: DefeatParticle[] = [];
    const colors = ['#ffffff', '#6df2e2', '#3ec7b5', '#249082', '#ffd166', '#f59e0b', '#a7f3d0'];

    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const speed = 70 + Math.random() * 210;
      particles.push({
        x: defeatedEnemy.x + (Math.random() * 8 - 4),
        y: defeatedEnemy.y - 8 + (Math.random() * 8 - 4),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50, // Upward burst
        size: 2.2 + Math.random() * 3.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 0.7 + Math.random() * 0.45,
      });
    }

    // 3. Shockwave rings expanding out
    const rings = [
      { radius: 6, maxRadius: 46, color: '#5eead4', lineWidth: 3 },
      { radius: 2, maxRadius: 70, color: '#ffffff', lineWidth: 1.8 },
      { radius: 4, maxRadius: 88, color: '#ffd166', lineWidth: 1.2 },
    ];

    defeatEffects.current.push({
      id: Math.random(),
      x: defeatedEnemy.x,
      y: defeatedEnemy.y - 8,
      life: 0,
      maxLife: 0.95,
      particles,
      rings,
    });

    // 4. Floating "DEFEATED!" combat banner
    damagePopups.current.push({
      id: Math.random(),
      x: defeatedEnemy.x,
      y: defeatedEnemy.y - 28,
      damage: 0,
      label: 'DEFEATED!',
      color: '#ffd166',
      subColor: '#ffffff',
      vy: -45,
      alpha: 1,
      life: 0,
      maxLife: 1.1,
      scale: 1.25,
    });

    // 5. Drop one small, green orb of energy upon defeat
    energyOrbs.current.push({
      id: Math.random(),
      x: defeatedEnemy.x,
      y: defeatedEnemy.y - 8,
      vx: (Math.random() - 0.5) * 45,
      vy: -35 - Math.random() * 30,
      radius: 4,
      bobPhase: Math.random() * Math.PI * 2,
      life: 0,
    });

    // 6. Randomly spawn in a new enemy nearby
    spawnNewEnemyNearby(defeatedEnemy.x, defeatedEnemy.y);
  }, [spawnNewEnemyNearby]);

  // Player Defeat Handler: Reset in center of dungeon with all weapon values reset and orbs lost
  const handlePlayerDeath = useCallback(() => {
    const env = environment.current;
    const centerX = env ? Math.round((env.roomWidth + env.pitWidth) / 2) : 750;
    const centerY = env ? Math.round(env.roomHeight / 2) : 500;

    charPos.current = { x: centerX, y: centerY };
    charDirection.current = 'down';
    charAnimState.current = 'idle';
    playerKnockback.current = { vx: 0, vy: 0 };
    playerHurtTimer.current = 1.2; // brief iframe protection on respawn

    // Reset health, orbs, and weapon upgrades
    playerHp.current = 10;
    playerOrbs.current = 0;
    swordProgress.current = 0;
    swordLevel.current = 1;
    bowProgress.current = 0;
    bowLevel.current = 1;

    screenShake.current = 6.5;
    spawnSparks(centerX, centerY - 10, ['#ef4444', '#f87171', '#ffffff', '#fbbf24'], 22, 170);

    damagePopups.current.push({
      id: Math.random(),
      x: centerX,
      y: centerY - 32,
      damage: 0,
      label: 'FALLEN! RESET TO CENTER & LOST ALL ORBS',
      color: '#ff4d4d',
      subColor: '#ffffff',
      vy: -40,
      alpha: 1,
      life: 0,
      maxLife: 1.8,
      scale: 1.35,
    });
  }, []);

  // Spend Orbs: Heal 1 Health Bar (Costs 1 Orb)
  const handleSpendHeal = useCallback(() => {
    if (playerOrbs.current < 1 || playerHp.current >= 10) return;

    playerOrbs.current -= 1;
    playerHp.current = Math.min(10, playerHp.current + 1);

    spawnSparks(charPos.current.x, charPos.current.y - 10, ['#4ade80', '#22c55e', '#86efac', '#ffffff'], 14, 120);

    damagePopups.current.push({
      id: Math.random(),
      x: charPos.current.x,
      y: charPos.current.y - 28,
      damage: 0,
      label: '+1 HP [HEALED]',
      color: '#4ade80',
      vy: -50,
      alpha: 1,
      life: 0,
      maxLife: 0.9,
      scale: 1.15,
    });
  }, []);

  // Spend Orbs: Sword Upgrade (+1 counter, reaches 10/10 -> +1 DMG)
  const handleSpendSword = useCallback(() => {
    if (playerOrbs.current < 1) return;

    playerOrbs.current -= 1;
    swordProgress.current += 1;

    if (swordProgress.current >= 10) {
      swordProgress.current = 0;
      swordLevel.current += 1;
      const newDmg = 6 + (swordLevel.current - 1);

      screenShake.current = 4.5;
      spawnSparks(charPos.current.x, charPos.current.y - 12, ['#ffd166', '#f59e0b', '#ffffff', '#fcd34d'], 22, 170);

      damagePopups.current.push({
        id: Math.random(),
        x: charPos.current.x,
        y: charPos.current.y - 32,
        damage: 0,
        label: `SWORD UPGRADED! (Lv.${swordLevel.current} • ${newDmg} DMG)`,
        color: '#ffd166',
        subColor: '#ffffff',
        vy: -45,
        alpha: 1,
        life: 0,
        maxLife: 1.5,
        scale: 1.3,
      });
    } else {
      spawnSparks(charPos.current.x, charPos.current.y - 10, ['#fcd34d', '#f59e0b', '#ffffff'], 8, 90);
      damagePopups.current.push({
        id: Math.random(),
        x: charPos.current.x,
        y: charPos.current.y - 24,
        damage: 0,
        label: `SWORD [${swordProgress.current}/10]`,
        color: '#fbbf24',
        vy: -50,
        alpha: 1,
        life: 0,
        maxLife: 0.8,
        scale: 1.05,
      });
    }
  }, []);

  // Spend Orbs: Bow Upgrade (+1 counter, reaches 10/10 -> +1 DMG)
  const handleSpendBow = useCallback(() => {
    if (playerOrbs.current < 1) return;

    playerOrbs.current -= 1;
    bowProgress.current += 1;

    if (bowProgress.current >= 10) {
      bowProgress.current = 0;
      bowLevel.current += 1;
      const bowBonus = bowLevel.current - 1;

      screenShake.current = 4.5;
      spawnSparks(charPos.current.x, charPos.current.y - 12, ['#5eead4', '#2dd4bf', '#ffffff', '#99f6e4'], 22, 170);

      damagePopups.current.push({
        id: Math.random(),
        x: charPos.current.x,
        y: charPos.current.y - 32,
        damage: 0,
        label: `BOW UPGRADED! (Lv.${bowLevel.current} • ${4 + bowBonus}/${3 + bowBonus}/${2 + bowBonus} DMG)`,
        color: '#5eead4',
        subColor: '#ffffff',
        vy: -45,
        alpha: 1,
        life: 0,
        maxLife: 1.5,
        scale: 1.3,
      });
    } else {
      spawnSparks(charPos.current.x, charPos.current.y - 10, ['#5eead4', '#2dd4bf', '#ffffff'], 8, 90);
      damagePopups.current.push({
        id: Math.random(),
        x: charPos.current.x,
        y: charPos.current.y - 24,
        damage: 0,
        label: `BOW [${bowProgress.current}/10]`,
        color: '#2dd4bf',
        vy: -50,
        alpha: 1,
        life: 0,
        maxLife: 0.8,
        scale: 1.05,
      });
    }
  }, []);

  // Trigger sword attack
  const triggerAttack = useCallback(() => {
    if (charAnimState.current === 'attack' || charAnimState.current === 'bow') return;

    charAnimState.current = 'attack';
    charFrame.current = 0;
    animTimer.current = 0;

    // Lunge step in facing direction
    const lungeForce = 110;
    if (charDirection.current === 'right') {
      attackLunge.current = { vx: lungeForce, vy: 0 };
    } else if (charDirection.current === 'left') {
      attackLunge.current = { vx: -lungeForce, vy: 0 };
    } else if (charDirection.current === 'down') {
      attackLunge.current = { vx: 0, vy: lungeForce };
    } else if (charDirection.current === 'up') {
      attackLunge.current = { vx: 0, vy: -lungeForce };
    }

    // Kinetic screenshake & audio-visual feel
    screenShake.current = Math.max(screenShake.current, 2.2);

    // Dust kickup from rapid step
    for (let i = 0; i < 4; i++) {
      dustParticles.current.push({
        id: Math.random(),
        x: charPos.current.x + (Math.random() * 10 - 5),
        y: charPos.current.y + (Math.random() * 6 - 3),
        size: 2.5 + Math.random() * 2,
        alpha: 0.8,
        vx: (Math.random() - 0.5) * 40 - attackLunge.current.vx * 0.2,
        vy: -15 + Math.random() * 10,
        life: 0,
        maxLife: 0.32,
      });
    }
  }, []);

  // Trigger bow and arrow attack toward target world coordinate
  const triggerBowAttack = useCallback((targetX: number, targetY: number) => {
    // If currently swinging sword, do not interrupt
    if (charAnimState.current === 'attack') return;

    charAnimState.current = 'bow';
    charFrame.current = 0;
    animTimer.current = 0;

    const originX = charPos.current.x;
    const originY = charPos.current.y - 12;
    const angle = Math.atan2(targetY - originY, targetX - originX);

    // Update facing direction based on click quadrant
    const deg = ((angle * 180) / Math.PI + 360) % 360;
    if (deg >= 45 && deg < 135) {
      charDirection.current = 'down';
    } else if (deg >= 135 && deg < 225) {
      charDirection.current = 'left';
    } else if (deg >= 225 && deg < 315) {
      charDirection.current = 'up';
    } else {
      charDirection.current = 'right';
    }

    // Spawn arrow flying swiftly through the air (640 px/s)
    const arrowSpeed = 640;
    const spawnX = originX + Math.cos(angle) * 12;
    const spawnY = originY + Math.sin(angle) * 12;
    arrows.current.push({
      id: Math.random(),
      x: spawnX,
      y: spawnY,
      startX: spawnX,
      startY: spawnY,
      vx: Math.cos(angle) * arrowSpeed,
      vy: Math.sin(angle) * arrowSpeed,
      angle,
      life: 0,
      maxLife: 1.6,
      trailTimer: 0,
    });

    // Archer release recoil
    attackLunge.current = {
      vx: -Math.cos(angle) * 35,
      vy: -Math.sin(angle) * 35,
    };

    // Subtle screenshake
    screenShake.current = Math.max(screenShake.current, 1.2);

    // Release wind puff
    spawnSparks(originX + Math.cos(angle) * 12, originY + Math.sin(angle) * 12, ['#ffffff', '#6df2e2', '#bbf7f0'], 4, 45);
  }, []);

  // Mouse click on canvas triggers bow attack
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const env = environment.current;
    if (!canvas || !env) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const zoom = currentZoom.current;
    const cx = canvas.width / (2 * zoom);
    const cy = canvas.height / (2 * zoom);

    let camX = charPos.current.x - cx;
    let camY = charPos.current.y - cy;
    camX = Math.max(0, Math.min(env.roomWidth - canvas.width / zoom, camX));
    camY = Math.max(0, Math.min(env.roomHeight - canvas.height / zoom, camY));

    const worldX = screenX / zoom + camX;
    const worldY = screenY / zoom + camY;

    triggerBowAttack(worldX, worldY);
  };

  // Button to trigger bow in current facing direction
  const triggerForwardBow = useCallback(() => {
    let targetX = charPos.current.x;
    let targetY = charPos.current.y - 12;
    if (charDirection.current === 'right') targetX += 260;
    else if (charDirection.current === 'left') targetX -= 260;
    else if (charDirection.current === 'down') targetY += 260;
    else if (charDirection.current === 'up') targetY -= 260;
    triggerBowAttack(targetX, targetY);
  }, [triggerBowAttack]);

  // Initialize graphics engines and handle responsive resize
  useEffect(() => {
    spriteManager.current = new SpriteSheetManager();
    environment.current = new DungeonEnvironment();

    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (container && canvas) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width > 0 && height > 0 && (canvas.width !== width || canvas.height !== height)) {
          canvas.width = width;
          canvas.height = height;
        }
      }
    };

    handleResize();
    const ro = new ResizeObserver(handleResize);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    // Auto-focus container so arrow keys and space work immediately
    containerRef.current?.focus();

    return () => ro.disconnect();
  }, []);

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code) || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
        e.preventDefault(); // Prevent page scroll
      }

      if (code === 'Space' || key === ' ') {
        triggerAttack();
        keysPressed.current['Space'] = true;
        return;
      }

      keysPressed.current[code] = true;
      keysPressed.current[key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key;
      keysPressed.current[code] = false;
      keysPressed.current[key] = false;
    };

    const handleBlur = () => {
      keysPressed.current = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [triggerAttack]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animFrameId: number;

    const gameLoop = (currentTime: number) => {
      animFrameId = requestAnimationFrame(gameLoop);

      const dt = Math.min((currentTime - lastTime.current) / 1000, 0.1);
      lastTime.current = currentTime;
      const globalTime = currentTime * 0.001;

      if (isPaused.current) return;

      const keys = keysPressed.current;
      const env = environment.current;
      const sprites = spriteManager.current;

      // 1. Process directional input (Arrow Keys + WASD)
      const up = !!(keys['ArrowUp'] || keys['KeyW'] || keys['w'] || keys['W']);
      const down = !!(keys['ArrowDown'] || keys['KeyS'] || keys['s'] || keys['S']);
      const left = !!(keys['ArrowLeft'] || keys['KeyA'] || keys['a'] || keys['A']);
      const right = !!(keys['ArrowRight'] || keys['KeyD'] || keys['d'] || keys['D']);
      const spacePressed = !!(keys['Space'] || keys[' ']);

      let dx = 0;
      let dy = 0;

      if (left) dx -= 1;
      if (right) dx += 1;
      if (up) dy -= 1;
      if (down) dy += 1;

      const isMoving = dx !== 0 || dy !== 0;

      // Only update facing direction if not locked in attack or bow
      if (isMoving && charAnimState.current !== 'attack' && charAnimState.current !== 'bow') {
        if (dx > 0) charDirection.current = 'right';
        else if (dx < 0) charDirection.current = 'left';
        else if (dy > 0) charDirection.current = 'down';
        else if (dy < 0) charDirection.current = 'up';
      }

      // Movement & Attack State Machine
      const baseSpeed = 125 * speedMultiplier.current;

      if (charAnimState.current === 'attack') {
        // Sword Attack Animation & Lunge
        animTimer.current += dt;

        // Apply lunge impulse
        charPos.current.x += attackLunge.current.vx * dt;
        charPos.current.y += attackLunge.current.vy * dt;
        attackLunge.current.vx *= Math.pow(0.08, dt);
        attackLunge.current.vy *= Math.pow(0.08, dt);

        // Bounds check
        if (env) {
          const minX = env.pitWidth + 24;
          const maxX = env.roomWidth - 50;
          const minY = 60;
          const maxY = env.roomHeight - 60;
          charPos.current.x = Math.max(minX, Math.min(maxX, charPos.current.x));
          charPos.current.y = Math.max(minY, Math.min(maxY, charPos.current.y));
        }

        // 4 attack frames at 75ms each = 300ms total swipe
        const attackFrameDuration = 0.075;
        if (animTimer.current >= attackFrameDuration) {
          animTimer.current = 0;
          const nextFrame = charFrame.current + 1;

          if (nextFrame === 1 || nextFrame === 2) {
            spawnSlashSparks(charPos.current.x, charPos.current.y, charDirection.current);
          }

          if (nextFrame >= 4) {
            // Attack completed! Return smoothly to walk or idle
            charAnimState.current = isMoving ? 'walk' : 'idle';
            charFrame.current = 0;
            animTimer.current = 0;
          } else {
            charFrame.current = nextFrame;
          }
        }
      } else if (charAnimState.current === 'bow') {
        // Bow and Arrow Shooting Animation (3 frames: Draw, Aim, Release)
        animTimer.current += dt;

        // Subtle archer recoil
        charPos.current.x += attackLunge.current.vx * dt;
        charPos.current.y += attackLunge.current.vy * dt;
        attackLunge.current.vx *= Math.pow(0.08, dt);
        attackLunge.current.vy *= Math.pow(0.08, dt);

        if (env) {
          const minX = env.pitWidth + 24;
          const maxX = env.roomWidth - 50;
          const minY = 60;
          const maxY = env.roomHeight - 60;
          charPos.current.x = Math.max(minX, Math.min(maxX, charPos.current.x));
          charPos.current.y = Math.max(minY, Math.min(maxY, charPos.current.y));
        }

        const bowFrameDuration = 0.075;
        if (animTimer.current >= bowFrameDuration) {
          animTimer.current = 0;
          const nextFrame = charFrame.current + 1;
          if (nextFrame >= 3) {
            charAnimState.current = isMoving ? 'walk' : 'idle';
            charFrame.current = 0;
          } else {
            charFrame.current = nextFrame;
          }
        }
      } else if (isMoving) {
        // Walking State
        charAnimState.current = 'walk';

        const len = Math.hypot(dx, dy);
        charVel.current.vx = (dx / len) * baseSpeed;
        charVel.current.vy = (dy / len) * baseSpeed;

        charPos.current.x += charVel.current.vx * dt;
        charPos.current.y += charVel.current.vy * dt;

        // Room boundaries check
        if (env) {
          const minX = env.pitWidth + 24;
          const maxX = env.roomWidth - 50;
          const minY = 60;
          const maxY = env.roomHeight - 60;

          charPos.current.x = Math.max(minX, Math.min(maxX, charPos.current.x));
          charPos.current.y = Math.max(minY, Math.min(maxY, charPos.current.y));

          // Soft prop collision for organic sliding around dungeon props
          for (const prop of env.props) {
            const pdx = charPos.current.x - prop.x;
            const pdy = charPos.current.y - prop.y;
            const pdist = Math.hypot(pdx, pdy);
            const pmin = prop.colliderRadius + 10;
            if (pdist < pmin && pdist > 0.001) {
              const push = pmin - pdist;
              charPos.current.x += (pdx / pdist) * push;
              charPos.current.y += (pdy / pdist) * push;
            }
          }
        }

        // 8-frame walk cycle at 0.088s/frame (~11.3 fps)
        animTimer.current += dt;
        const walkFrameDuration = 0.088;
        if (animTimer.current >= walkFrameDuration) {
          animTimer.current = 0;
          charFrame.current = (charFrame.current + 1) % 8;
        }

        // Walking dust motes
        dustTimer.current += dt;
        if (dustTimer.current > 0.11) {
          dustTimer.current = 0;
          dustParticles.current.push({
            id: Math.random(),
            x: charPos.current.x + (Math.random() * 8 - 4),
            y: charPos.current.y + (Math.random() * 4 - 2),
            size: 2 + Math.random() * 2,
            alpha: 0.6,
            vx: -charVel.current.vx * 0.14 + (Math.random() * 8 - 4),
            vy: -8 + Math.random() * 5,
            life: 0,
            maxLife: 0.35,
          });
        }
      } else {
        // Idle State
        charAnimState.current = 'idle';
        charVel.current.vx = 0;
        charVel.current.vy = 0;

        // 4-frame idle cycle at 0.38s/frame
        animTimer.current += dt;
        const idleFrameDuration = 0.38;
        if (animTimer.current >= idleFrameDuration) {
          animTimer.current = 0;
          charFrame.current = (charFrame.current + 1) % 4;
        }
      }

      // Update Player Hurt State (Invulnerability timer & damage knockback)
      if (playerHurtTimer.current > 0) {
        playerHurtTimer.current = Math.max(0, playerHurtTimer.current - dt);

        charPos.current.x += playerKnockback.current.vx * dt;
        charPos.current.y += playerKnockback.current.vy * dt;
        playerKnockback.current.vx *= Math.pow(0.04, dt);
        playerKnockback.current.vy *= Math.pow(0.04, dt);

        if (env) {
          const minX = env.pitWidth + 24;
          const maxX = env.roomWidth - 50;
          const minY = 60;
          const maxY = env.roomHeight - 60;
          charPos.current.x = Math.max(minX, Math.min(maxX, charPos.current.x));
          charPos.current.y = Math.max(minY, Math.min(maxY, charPos.current.y));
        }
      }

      // Update Flying Arrows & Check Collisions
      arrows.current = arrows.current.filter((arrow) => {
        arrow.x += arrow.vx * dt;
        arrow.y += arrow.vy * dt;
        arrow.life += dt;
        arrow.trailTimer += dt;

        // Wind stream particle behind arrow
        if (arrow.trailTimer >= 0.022) {
          arrow.trailTimer = 0;
          slashSparks.current.push({
            id: Math.random(),
            x: arrow.x - Math.cos(arrow.angle) * 8 + (Math.random() * 4 - 2),
            y: arrow.y - Math.sin(arrow.angle) * 8 + (Math.random() * 4 - 2),
            size: 1.5,
            alpha: 0.8,
            vx: -arrow.vx * 0.05 + (Math.random() * 10 - 5),
            vy: -arrow.vy * 0.05 + (Math.random() * 10 - 5),
            color: '#6df2e2',
            life: 0,
            maxLife: 0.12,
          });
        }

        // Room wall boundaries check
        if (env) {
          if (
            arrow.x <= env.pitWidth + 10 ||
            arrow.x >= env.roomWidth - 36 ||
            arrow.y <= 42 ||
            arrow.y >= env.roomHeight - 42
          ) {
            spawnSparks(arrow.x, arrow.y, ['#ffffff', '#c2854e', '#ab6533', '#8ea6b8'], 5, 75);
            return false;
          }

          // Check collision against dungeon props
          for (const prop of env.props) {
            const pdist = Math.hypot(arrow.x - prop.x, arrow.y - (prop.y - 8));
            if (pdist < prop.colliderRadius + 7) {
              spawnSparks(arrow.x, arrow.y, ['#ffffff', '#f5c342', '#ab6533', '#8ea6b8'], 6, 85);
              return false;
            }
          }
        }

        // Check collision against roaming enemies (Bow: 4 close, 3 mid, 2 far + upgrade bonus)
        for (let i = enemies.current.length - 1; i >= 0; i--) {
          const enemy = enemies.current[i];
          const dist = Math.hypot(arrow.x - enemy.x, arrow.y - (enemy.y - 8));
          if (dist < enemy.radius + 8) {
            // Calculate distance arrow flew from release point
            const flightDist = Math.hypot(arrow.x - arrow.startX, arrow.y - arrow.startY);
            const bowBonus = bowLevel.current - 1;

            let dmg = 2 + bowBonus;
            let rangeLabel = `-${dmg} [FAR]`;
            let popupColor = '#9fe8e2';

            if (flightDist <= 150) {
              dmg = 4 + bowBonus;
              rangeLabel = `-${dmg} [CLOSE]`;
              popupColor = '#ffd166';
            } else if (flightDist <= 320) {
              dmg = 3 + bowBonus;
              rangeLabel = `-${dmg} [MID]`;
              popupColor = '#5eead4';
            } else {
              dmg = 2 + bowBonus;
              rangeLabel = `-${dmg} [FAR]`;
              popupColor = '#a5c7cc';
            }

            enemy.hp = Math.max(0, enemy.hp - dmg);
            enemy.hitFlashTimer = 0.28;
            enemy.knockbackVx = Math.cos(arrow.angle) * 230;
            enemy.knockbackVy = Math.sin(arrow.angle) * 230;

            // Emerald slime splash particles
            spawnSparks(arrow.x, arrow.y, ['#ffffff', '#83f5e3', '#3ec7b5', '#16524b'], 8, 110);
            screenShake.current = Math.max(screenShake.current, 2.4);

            // Floating damage popup
            damagePopups.current.push({
              id: Math.random(),
              x: enemy.x,
              y: enemy.y - 20,
              damage: dmg,
              label: rangeLabel,
              color: popupColor,
              vy: -55,
              alpha: 1,
              life: 0,
              maxLife: 0.85,
              scale: flightDist <= 150 ? 1.15 : 1.0,
            });

            if (enemy.hp <= 0) {
              enemies.current.splice(i, 1);
              triggerEnemyDefeat(enemy);
            }

            return false; // Arrow consumed on impact
          }
        }

        return arrow.life < arrow.maxLife;
      });

      // Sword attack collision with enemies (Sword does 6 damage + upgrade bonus)
      if (charAnimState.current === 'attack' && (charFrame.current === 1 || charFrame.current === 2)) {
        let strikeX = charPos.current.x;
        let strikeY = charPos.current.y - 10;
        if (charDirection.current === 'right') strikeX += 22;
        else if (charDirection.current === 'left') strikeX -= 22;
        else if (charDirection.current === 'down') strikeY += 20;
        else if (charDirection.current === 'up') strikeY -= 20;

        for (let i = enemies.current.length - 1; i >= 0; i--) {
          const enemy = enemies.current[i];
          if (enemy.hitFlashTimer <= 0.05) {
            const dist = Math.hypot(strikeX - enemy.x, strikeY - (enemy.y - 8));
            if (dist < enemy.radius + 18) {
              const swordBonus = swordLevel.current - 1;
              const dmg = 6 + swordBonus;
              enemy.hp = Math.max(0, enemy.hp - dmg);
              enemy.hitFlashTimer = 0.28;
              const kbAngle = Math.atan2(enemy.y - charPos.current.y, enemy.x - charPos.current.x);
              enemy.knockbackVx = Math.cos(kbAngle) * 270;
              enemy.knockbackVy = Math.sin(kbAngle) * 270;

              spawnSparks(enemy.x, enemy.y - 8, ['#ffffff', '#6df2e2', '#2fb8a9'], 9, 125);
              screenShake.current = Math.max(screenShake.current, 3.5);

              // Floating damage popup: -{dmg} [SWORD] in bold vermilion
              damagePopups.current.push({
                id: Math.random(),
                x: enemy.x,
                y: enemy.y - 20,
                damage: dmg,
                label: `-${dmg} [SWORD]`,
                color: '#ff5e57',
                subColor: '#ffe5e5',
                vy: -60,
                alpha: 1,
                life: 0,
                maxLife: 0.9,
                scale: 1.25,
              });

              if (enemy.hp <= 0) {
                enemies.current.splice(i, 1);
                triggerEnemyDefeat(enemy);
              }
            }
          }
        }
      }

      // Update Enemies AI, movement, bounds & player contact
      for (const enemy of enemies.current) {
        // Spawn emergence animation decay
        if (enemy.spawnTimer && enemy.spawnTimer > 0) {
          enemy.spawnTimer = Math.max(0, enemy.spawnTimer - dt);
        }

        // Hit flash decay
        if (enemy.hitFlashTimer > 0) {
          enemy.hitFlashTimer = Math.max(0, enemy.hitFlashTimer - dt);
        }

        // Knockback decay
        enemy.knockbackVx *= Math.pow(0.06, dt);
        enemy.knockbackVy *= Math.pow(0.06, dt);

        // AI behavior state update
        enemy.stateTimer += dt;
        if (enemy.stateTimer > 2.0 + (enemy.id % 3) * 0.5) {
          enemy.stateTimer = 0;
          enemy.isMoving = Math.random() > 0.35;
          if (enemy.isMoving) {
            enemy.wanderAngle = Math.random() * Math.PI * 2;
          }
        }

        // Move enemy
        let mvx = enemy.knockbackVx;
        let mvy = enemy.knockbackVy;
        if (enemy.isMoving) {
          mvx += Math.cos(enemy.wanderAngle) * enemy.speed;
          mvy += Math.sin(enemy.wanderAngle) * enemy.speed;

          // Update facing direction
          if (Math.abs(mvx) > Math.abs(mvy)) {
            enemy.direction = mvx > 0 ? 'right' : 'left';
          } else {
            enemy.direction = mvy > 0 ? 'down' : 'up';
          }
        }

        enemy.x += mvx * dt;
        enemy.y += mvy * dt;

        // Boundaries & bouncing away from room walls
        if (env) {
          const minEx = env.pitWidth + 30;
          const maxEx = env.roomWidth - 60;
          const minEy = 65;
          const maxEy = env.roomHeight - 65;

          if (enemy.x <= minEx) {
            enemy.x = minEx;
            enemy.wanderAngle = Math.PI - enemy.wanderAngle;
          } else if (enemy.x >= maxEx) {
            enemy.x = maxEx;
            enemy.wanderAngle = Math.PI - enemy.wanderAngle;
          }

          if (enemy.y <= minEy) {
            enemy.y = minEy;
            enemy.wanderAngle = -enemy.wanderAngle;
          } else if (enemy.y >= maxEy) {
            enemy.y = maxEy;
            enemy.wanderAngle = -enemy.wanderAngle;
          }

          // Obstacle / Prop Collisions for enemies
          for (const prop of env.props) {
            const pdx = enemy.x - prop.x;
            const pdy = enemy.y - prop.y;
            const pdist = Math.hypot(pdx, pdy);
            const pmin = prop.colliderRadius + enemy.radius;
            if (pdist < pmin && pdist > 0.001) {
              const push = pmin - pdist;
              enemy.x += (pdx / pdist) * push;
              enemy.y += (pdy / pdist) * push;
              enemy.wanderAngle = Math.atan2(pdy, pdx) + (Math.random() - 0.5);
            }
          }
        }

        // Enemy animation cycle
        enemy.animTimer += dt;
        const enemyFrameDuration = enemy.isMoving ? 0.11 : 0.32;
        if (enemy.animTimer >= enemyFrameDuration) {
          enemy.animTimer = 0;
          enemy.frame = (enemy.frame + 1) % 4;
        }

        // Check CONTACT with Player: Trigger Damage Animation & 1 HP damage!
        const distToPlayer = Math.hypot(charPos.current.x - enemy.x, (charPos.current.y - 8) - (enemy.y - 8));
        if (distToPlayer < 22) {
          if (playerHurtTimer.current <= 0) {
            // Player hit!
            playerHurtTimer.current = 0.85; // 850ms of damage animation & iframe flashing
            playerHp.current = Math.max(0, playerHp.current - 1);

            const hurtAngle = Math.atan2(charPos.current.y - enemy.y, charPos.current.x - enemy.x);
            playerKnockback.current = {
              vx: Math.cos(hurtAngle) * 230,
              vy: Math.sin(hurtAngle) * 230,
            };

            // Screenshake for punchy impact
            screenShake.current = 4.8;

            // Damage impact sparks
            spawnSparks(charPos.current.x, charPos.current.y - 12, ['#ff4d4d', '#ffd166', '#ffffff', '#ff8585'], 11, 140);

            // Floating -1 HP popup
            damagePopups.current.push({
              id: Math.random(),
              x: charPos.current.x,
              y: charPos.current.y - 28,
              damage: 1,
              label: '-1 HP',
              color: '#ff4d4d',
              vy: -55,
              alpha: 1,
              life: 0,
              maxLife: 0.85,
              scale: 1.2,
            });

            // If player reaches zero health, reset in center with all weapons reset and lost orbs
            if (playerHp.current <= 0) {
              handlePlayerDeath();
            }
          }
        }
      }

      // Update dust particles
      dustParticles.current = dustParticles.current
        .map((p) => ({
          ...p,
          x: p.x + p.vx * dt,
          y: p.y + p.vy * dt,
          life: p.life + dt,
          alpha: (1 - p.life / p.maxLife) * 0.6,
        }))
        .filter((p) => p.life < p.maxLife);

      // Update slash sparks
      slashSparks.current = slashSparks.current
        .map((s) => ({
          ...s,
          x: s.x + s.vx * dt,
          y: s.y + s.vy * dt,
          life: s.life + dt,
          alpha: Math.max(0, 1 - s.life / s.maxLife),
        }))
        .filter((s) => s.life < s.maxLife);

      // Update defeat effects & particles
      defeatEffects.current = defeatEffects.current.filter((effect) => {
        effect.life += dt;
        for (const p of effect.particles) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 75 * dt; // gravity arc
          p.vx *= Math.pow(0.18, dt); // air resistance
          p.vy *= Math.pow(0.18, dt);
          p.life += dt;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        }
        return effect.life < effect.maxLife;
      });

      // Update floating damage numbers
      damagePopups.current = damagePopups.current.filter((popup) => {
        popup.life += dt;
        popup.y += popup.vy * dt;
        popup.vy *= Math.pow(0.12, dt); // gentle upward deceleration
        popup.alpha = Math.max(0, 1 - popup.life / popup.maxLife);
        return popup.life < popup.maxLife;
      });

      // Update Energy Orbs dropped by enemies (bobbing, magnetic pull, and absorption on contact)
      energyOrbs.current = energyOrbs.current.filter((orb) => {
        orb.life += dt;
        orb.bobPhase += dt * 4;

        // Friction on initial burst velocity
        orb.vx *= Math.pow(0.08, dt);
        orb.vy *= Math.pow(0.08, dt);
        orb.x += orb.vx * dt;
        orb.y += orb.vy * dt;

        // Distance to player sprite pivot
        const dx = charPos.current.x - orb.x;
        const dy = (charPos.current.y - 8) - orb.y;
        const dist = Math.hypot(dx, dy);

        // Magnetic attraction when player is nearby (within 80px)
        if (dist < 80 && dist > 0.001) {
          const pullSpeed = (80 - dist) * 6.5;
          orb.x += (dx / dist) * pullSpeed * dt;
          orb.y += (dy / dist) * pullSpeed * dt;
        }

        // Contact with player sprite: absorbed into player's bank of orbs
        if (dist < 22) {
          playerOrbs.current += 1;

          // Sparkling absorption motes
          spawnSparks(charPos.current.x, charPos.current.y - 8, ['#4ade80', '#22c55e', '#86efac', '#ffffff'], 9, 110);

          // Floating "+1 ORB" combat indicator
          damagePopups.current.push({
            id: Math.random(),
            x: charPos.current.x,
            y: charPos.current.y - 24,
            damage: 0,
            label: '+1 ORB',
            color: '#4ade80',
            vy: -55,
            alpha: 1,
            life: 0,
            maxLife: 0.8,
            scale: 1.1,
          });

          return false; // Orb absorbed
        }

        return true;
      });

      // Update ambient bioluminescent motes & embers drifting in dungeon air
      if (env) {
        for (const mote of ambientMotes.current) {
          mote.x += mote.vx * dt + Math.sin(globalTime * 1.5 + mote.phase) * 0.4;
          mote.y += mote.vy * dt;
          if (mote.y < 35) {
            mote.y = env.roomHeight - 55;
            mote.x = env.pitWidth + 20 + Math.random() * (env.roomWidth - env.pitWidth - 50);
          }
          if (mote.x < env.pitWidth) mote.x = env.roomWidth - 50;
          if (mote.x > env.roomWidth - 40) mote.x = env.pitWidth + 20;
        }
      }

      // Screenshake decay
      let shakeX = 0;
      let shakeY = 0;
      if (screenShake.current > 0.05) {
        shakeX = (Math.random() - 0.5) * screenShake.current * 2;
        shakeY = (Math.random() - 0.5) * screenShake.current * 2;
        screenShake.current = Math.max(0, screenShake.current - dt * 10);
      }

      // Render to Canvas
      const canvas = canvasRef.current;
      if (canvas && env && sprites) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;

          // Clear frame
          ctx.clearRect(0, 0, width, height);

          // Camera zoom (stock view is 1.8x zoomed out)
          const zoom = currentZoom.current;
          const cx = width / (2 * zoom);
          const cy = height / (2 * zoom);

          // Camera offsets centered on player + subtle screenshake
          let camX = charPos.current.x - cx + shakeX;
          let camY = charPos.current.y - cy + shakeY;

          // Clamp camera inside room
          camX = Math.max(0, Math.min(env.roomWidth - width / zoom, camX));
          camY = Math.max(0, Math.min(env.roomHeight - height / zoom, camY));

          ctx.save();
          // Crisp pixel art settings
          ctx.imageSmoothingEnabled = false;

          // Apply camera transform
          ctx.scale(zoom, zoom);
          ctx.translate(-Math.floor(camX), -Math.floor(camY));

          // 1. Draw Floor, Pit Abyss, Floor Seams, and Arcane Ritual Seal
          env.renderFloor(ctx, globalTime);

          // 2. Draw Dust particles from movement
          for (const dp of dustParticles.current) {
            ctx.fillStyle = `rgba(180, 215, 210, ${dp.alpha})`;
            ctx.fillRect(Math.floor(dp.x), Math.floor(dp.y), dp.size, dp.size);
          }

          // 3. Draw Ambient Bioluminescent Motes & Spores
          for (const mote of ambientMotes.current) {
            const pulse = Math.sin(globalTime * mote.pulseSpeed + mote.phase) * 0.25 + 0.75;
            ctx.save();
            ctx.fillStyle = mote.color;
            ctx.globalAlpha = mote.baseAlpha * pulse;
            ctx.fillRect(Math.floor(mote.x), Math.floor(mote.y), mote.size, mote.size);
            ctx.restore();
          }

          // 4. Collect and Sort Entities by Y for True 3/4 Isometric Depth
          interface RenderableEntity {
            y: number;
            render: () => void;
          }
          const renderList: RenderableEntity[] = [];

          // Add Dungeon Props (Crystals, Crates, Urns, Torches)
          for (const prop of env.props) {
            renderList.push({
              y: prop.y,
              render: () => prop.render(ctx, globalTime),
            });
          }

          // Add Roaming Slime Enemies
          for (const enemy of enemies.current) {
            renderList.push({
              y: enemy.y,
              render: () => {
                // Arcane emergence rune circle if newly spawned
                if (enemy.spawnTimer && enemy.spawnTimer > 0) {
                  const spawnRatio = Math.max(0, 1 - enemy.spawnTimer / 0.65);
                  ctx.save();
                  ctx.beginPath();
                  ctx.strokeStyle = '#5eead4';
                  ctx.lineWidth = 1.5;
                  ctx.ellipse(enemy.x, enemy.y + 1, 14 * spawnRatio, 5 * spawnRatio, 0, 0, Math.PI * 2);
                  ctx.stroke();
                  ctx.beginPath();
                  ctx.fillStyle = 'rgba(94, 234, 212, 0.25)';
                  ctx.ellipse(enemy.x, enemy.y + 1, 10 * spawnRatio, 3.5 * spawnRatio, 0, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.restore();
                }

                // Enemy Drop Shadow
                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = 'rgba(4, 18, 16, 0.45)';
                ctx.ellipse(enemy.x, enemy.y + 1, 9, 3.8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                const enemyFrame = sprites.getEnemyFrame(
                  enemy.isMoving ? 'walk' : 'idle',
                  enemy.frame,
                  enemy.hitFlashTimer > 0.04
                );

                if (enemyFrame) {
                  if (enemy.spawnTimer && enemy.spawnTimer > 0) {
                    const spawnRatio = Math.max(0, 1 - enemy.spawnTimer / 0.65);
                    const scaleY = Math.min(1, 0.25 + 0.75 * spawnRatio);
                    const scaleX = Math.max(0.7, 1.35 - 0.35 * spawnRatio);
                    ctx.save();
                    ctx.translate(enemy.x, enemy.y);
                    ctx.scale(scaleX, scaleY);
                    ctx.drawImage(enemyFrame, -ENEMY_PIVOT_X, -ENEMY_PIVOT_Y);
                    ctx.restore();
                  } else {
                    ctx.drawImage(
                      enemyFrame,
                      Math.floor(enemy.x - ENEMY_PIVOT_X),
                      Math.floor(enemy.y - ENEMY_PIVOT_Y)
                    );
                  }
                }

                // Draw Enemy Health Bar (Base 10 HP)
                const barW = 28;
                const barH = 4;
                const barX = Math.floor(enemy.x - barW / 2);
                const barY = Math.floor(enemy.y - 25);

                ctx.save();
                // Dark backplate container
                ctx.fillStyle = 'rgba(4, 16, 18, 0.9)';
                ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
                ctx.strokeStyle = '#1e4b52';
                ctx.lineWidth = 1;
                ctx.strokeRect(barX - 0.5, barY - 0.5, barW + 1, barH + 1);

                // Health fill
                const hpRatio = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));
                const fillW = Math.round(barW * hpRatio);
                let hpColor = '#10b981'; // Healthy full
                if (enemy.hp <= 4) hpColor = '#f59e0b'; // Amber (e.g. after 6 dmg sword hit)
                if (enemy.hp <= 2) hpColor = '#ef4444'; // Red critical

                if (fillW > 0) {
                  ctx.fillStyle = hpColor;
                  ctx.fillRect(barX, barY, fillW, barH);
                }

                // Micro tick marks for each 2 HP segment (at 20%, 40%, 60%, 80%)
                ctx.fillStyle = 'rgba(3, 10, 12, 0.55)';
                for (let t = 1; t <= 4; t++) {
                  const tx = Math.floor(barX + (barW * t) / 5);
                  ctx.fillRect(tx, barY, 1, barH);
                }

                // Numerical HP text (e.g. "4/10" or "10/10")
                ctx.font = 'bold 8px monospace';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(`${enemy.hp}/10`, Math.floor(enemy.x), barY - 3);
                ctx.restore();
              },
            });
          }

          // Add Dropped Energy Orbs (Glow, floating bob, ground shadow, specular highlight)
          for (const orb of energyOrbs.current) {
            renderList.push({
              y: orb.y + 6,
              render: () => {
                const bobY = Math.sin(orb.bobPhase) * 3;
                const orbY = orb.y + bobY;

                ctx.save();
                // 1. Soft ground shadow
                ctx.beginPath();
                ctx.fillStyle = 'rgba(6, 28, 14, 0.45)';
                ctx.ellipse(orb.x, orb.y + 7, 5, 2.2, 0, 0, Math.PI * 2);
                ctx.fill();

                // 2. Bioluminescent Green Glow Halo
                const glowGrad = ctx.createRadialGradient(orb.x, orbY, 1, orb.x, orbY, 12);
                glowGrad.addColorStop(0, 'rgba(74, 222, 128, 0.55)');
                glowGrad.addColorStop(0.5, 'rgba(34, 197, 94, 0.25)');
                glowGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');
                ctx.fillStyle = glowGrad;
                ctx.beginPath();
                ctx.arc(orb.x, orbY, 12, 0, Math.PI * 2);
                ctx.fill();

                // 3. Crisp Orb Sphere Body
                const orbGrad = ctx.createRadialGradient(orb.x - 1, orbY - 1, 0.8, orb.x, orbY, 4.5);
                orbGrad.addColorStop(0, '#ffffff');
                orbGrad.addColorStop(0.3, '#86efac');
                orbGrad.addColorStop(0.7, '#22c55e');
                orbGrad.addColorStop(1, '#15803d');
                ctx.fillStyle = orbGrad;
                ctx.beginPath();
                ctx.arc(orb.x, orbY, 4.2, 0, Math.PI * 2);
                ctx.fill();

                // 4. Emerald Outer Border
                ctx.strokeStyle = '#14532d';
                ctx.lineWidth = 0.8;
                ctx.stroke();

                // 5. Specular highlight glint
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(Math.floor(orb.x - 1.5), Math.floor(orbY - 1.8), 1.2, 1.2);
                ctx.restore();
              },
            });
          }

          // Add Player Character
          renderList.push({
            y: charPos.current.y,
            render: () => {
              // Character Drop Shadow
              ctx.save();
              ctx.beginPath();
              ctx.fillStyle = PALETTE.shadow;
              const shadowYOffset = charAnimState.current === 'walk' && charFrame.current % 4 === 1 ? 1 : 0;
              ctx.ellipse(
                charPos.current.x,
                charPos.current.y + 1 + shadowYOffset,
                charAnimState.current === 'attack' ? 12 : 9.5,
                4.2,
                0,
                0,
                Math.PI * 2
              );
              ctx.fill();
              ctx.restore();

              // Character Sprite with Hurt Animation (Invulnerability flicker + red damage flash)
              const isHurtFlashing = playerHurtTimer.current > 0;
              const isFlickerOff = isHurtFlashing && Math.floor(playerHurtTimer.current * 32) % 2 === 1;

              if (!isFlickerOff) {
                const spriteFrame = sprites.getFrame(
                  charDirection.current,
                  charAnimState.current,
                  charFrame.current
                );

                if (spriteFrame) {
                  const drawX = Math.floor(charPos.current.x - PIVOT_X);
                  const drawY = Math.floor(charPos.current.y - PIVOT_Y);

                  if (playerHurtTimer.current > 0.62) {
                    // Red damage flash overlay on initial hit impact
                    ctx.save();
                    ctx.drawImage(spriteFrame, drawX, drawY);
                    ctx.globalCompositeOperation = 'source-atop';
                    ctx.fillStyle = 'rgba(255, 60, 60, 0.75)';
                    ctx.fillRect(drawX, drawY, SPRITE_WIDTH, SPRITE_HEIGHT);
                    ctx.restore();
                  } else {
                    ctx.drawImage(spriteFrame, drawX, drawY);
                  }
                }
              }

              // Damage Shockwave Feedback Ring
              if (playerHurtTimer.current > 0.52) {
                const ringProgress = (0.85 - playerHurtTimer.current) / 0.33;
                ctx.save();
                ctx.strokeStyle = `rgba(255, 95, 95, ${1 - ringProgress})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(charPos.current.x, charPos.current.y - 10, 8 + ringProgress * 22, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
              }
            },
          });

          // Sort in ascending Y order
          renderList.sort((a, b) => a.y - b.y);
          for (const item of renderList) {
            item.render();
          }

          // 5. Draw Flying Arrows
          for (const arrow of arrows.current) {
            drawArrow(ctx, Math.floor(arrow.x), Math.floor(arrow.y), arrow.angle);
          }

          // 6. Draw Slash Spark motes & impact particles in front of entities
          for (const sp of slashSparks.current) {
            ctx.fillStyle = sp.color;
            ctx.globalAlpha = sp.alpha;
            ctx.fillRect(Math.floor(sp.x), Math.floor(sp.y), sp.size, sp.size);
          }
          ctx.globalAlpha = 1.0;

          // 7. Draw Satisfying Defeat Effects (Shockwaves, ascending soul wisps & splatter droplets)
          for (const effect of defeatEffects.current) {
            const progress = effect.life / effect.maxLife;

            ctx.save();
            // Expanding shockwave rings
            for (const ring of effect.rings) {
              const curRadius = ring.radius + (ring.maxRadius - ring.radius) * progress;
              ctx.beginPath();
              ctx.strokeStyle = ring.color;
              ctx.globalAlpha = Math.max(0, (1 - progress) * 0.95);
              ctx.lineWidth = Math.max(0.6, ring.lineWidth * (1 - progress));
              ctx.arc(effect.x, effect.y, curRadius, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Ascending soul spirit wisp in center
            const soulY = effect.y - progress * 28;
            const soulAlpha = Math.max(0, Math.sin((1 - progress) * Math.PI));
            ctx.globalAlpha = soulAlpha;
            ctx.fillStyle = '#6df2e2';
            ctx.beginPath();
            ctx.arc(effect.x, soulY, 3.5 * (1 - progress * 0.5), 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(effect.x, soulY, 1.8 * (1 - progress * 0.5), 0, Math.PI * 2);
            ctx.fill();

            // Slime droplets & golden essence shards
            for (const p of effect.particles) {
              ctx.fillStyle = p.color;
              ctx.globalAlpha = p.alpha;
              ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
            }
            ctx.restore();
          }

          // 8. Dynamic Emissive & Layered Lighting Pass
          env.renderLighting(ctx, charPos.current.x, charPos.current.y, globalTime);

          // 9. Draw Floating Damage Numbers & Combat Text (High contrast, crisp text over lighting)
          for (const popup of damagePopups.current) {
            ctx.save();
            ctx.globalAlpha = popup.alpha;
            ctx.font = `bold ${Math.round(10 * popup.scale)}px monospace`;
            ctx.textAlign = 'center';

            // High contrast outline
            ctx.fillStyle = 'rgba(3, 10, 12, 0.95)';
            ctx.fillText(popup.label, Math.floor(popup.x) + 1, Math.floor(popup.y) + 1);
            ctx.fillText(popup.label, Math.floor(popup.x) - 1, Math.floor(popup.y) - 1);
            ctx.fillText(popup.label, Math.floor(popup.x) + 1, Math.floor(popup.y) - 1);
            ctx.fillText(popup.label, Math.floor(popup.x) - 1, Math.floor(popup.y) + 1);

            // Fill color
            ctx.fillStyle = popup.color;
            ctx.fillText(popup.label, Math.floor(popup.x), Math.floor(popup.y));
            ctx.restore();
          }

          ctx.restore();
        }
      }

      // Update light HUD state every ~60ms
      if (Math.floor(currentTime) % 4 === 0) {
        setHudState({
          direction: charDirection.current,
          animState: charAnimState.current,
          frame: charFrame.current,
          speed: speedMultiplier.current,
          isMoving,
          isHurt: playerHurtTimer.current > 0,
          enemyCount: enemies.current.length,
          defeatedCount: defeatedCount.current,
          playerHp: playerHp.current,
          playerOrbs: playerOrbs.current,
          swordProgress: swordProgress.current,
          swordLevel: swordLevel.current,
          bowProgress: bowProgress.current,
          bowLevel: bowLevel.current,
          activeKeys: {
            up,
            down,
            left,
            right,
            attack: charAnimState.current === 'attack' || spacePressed,
            bow: charAnimState.current === 'bow',
          },
        });
      }
    };

    animFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrameId);
  }, [triggerAttack, triggerBowAttack, handlePlayerDeath]);

  // Handle virtual button press
  const setVirtualKey = useCallback((code: string, isDown: boolean) => {
    keysPressed.current[code] = isDown;
  }, []);

  const resetPosition = () => {
    const env = environment.current;
    const centerX = env ? Math.round((env.roomWidth + env.pitWidth) / 2) : 750;
    const centerY = env ? Math.round(env.roomHeight / 2) : 500;

    charPos.current = { x: centerX, y: centerY };
    charDirection.current = 'down';
    charAnimState.current = 'idle';
    playerHurtTimer.current = 0;
    playerHp.current = 10;
    playerOrbs.current = 0;
    swordProgress.current = 0;
    swordLevel.current = 1;
    bowProgress.current = 0;
    bowLevel.current = 1;
    enemies.current = createDefaultEnemies();
    arrows.current = [];
    energyOrbs.current = [];
    defeatEffects.current = [];
    damagePopups.current = [];
    defeatedCount.current = 0;
  };

  const toggleSpeed = () => {
    speedMultiplier.current = speedMultiplier.current === 1 ? 1.65 : 1;
  };

  const cycleZoom = () => {
    const zoomLevels = [1.8, 2.2, 2.8];
    const currentIndex = zoomLevels.findIndex((z) => Math.abs(z - currentZoom.current) < 0.1);
    const nextIndex = (currentIndex + 1) % zoomLevels.length;
    currentZoom.current = zoomLevels[nextIndex];
    setZoomDisplay(zoomLevels[nextIndex]);
  };

  return (
    <div
      ref={containerRef}
      id="game-viewport-container"
      className="relative w-full h-screen bg-[#071315] select-none overflow-hidden flex flex-col font-sans outline-none"
      tabIndex={0}
      onClick={() => containerRef.current?.focus()}
    >
      {/* Moonlighter Top HUD */}
      <div
        id="game-header-bar"
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-3 bg-[#08181b]/90 backdrop-blur-md border-b border-[#184248]/90 text-[#d8e5e8] shadow-[0_4px_24px_rgba(3,10,12,0.6)]"
      >
        {/* Left: Moonlighter Chamber & Seal */}
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#d4af37] via-[#996515] to-[#5a3809] p-[1.5px] shadow-[0_0_10px_rgba(212,175,55,0.4)]">
            <div className="w-full h-full rounded-full bg-[#092226] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#5eead4] animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold tracking-widest text-[#f5d77f] uppercase font-sans">
                Golem Cradle
              </h1>
              <span className="px-1.5 py-0.2 text-[10px] bg-[#11393f] text-[#6df2e2] rounded font-mono font-medium border border-[#1e5860]">
                Floor 1
              </span>
            </div>
            <p className="text-[11px] text-[#6e969c] font-sans tracking-wide">
              Ancient Dungeon Sanctuary
            </p>
          </div>
        </div>

        {/* Center: Line of 10 Player Health Bars, Bank of Orbs & Weapon Badges */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Line of 10 Segmented Health Bars */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#092024]/90 border border-[#1b4e57] shadow-inner">
            <div className="flex items-center gap-1.5">
              <Heart
                className={`w-3.5 h-3.5 fill-current transition-colors ${
                  hudState.playerHp <= 3
                    ? 'text-[#ef4444] animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                    : hudState.playerHp <= 6
                    ? 'text-[#f59e0b]'
                    : 'text-[#10b981]'
                }`}
              />
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#93b7bc] font-bold">
                HP
              </span>
            </div>

            {/* Line of 10 Small Health Bars (1 damage per hit) */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 10 }).map((_, idx) => {
                const isFilled = idx < hudState.playerHp;
                return (
                  <div
                    key={idx}
                    className={`w-2.5 sm:w-3 h-4 rounded-xs transition-all duration-200 border ${
                      isFilled
                        ? hudState.playerHp <= 3
                          ? 'bg-gradient-to-t from-[#dc2626] to-[#ef4444] border-[#fca5a5] shadow-[0_0_5px_rgba(239,68,68,0.6)]'
                          : hudState.playerHp <= 6
                          ? 'bg-gradient-to-t from-[#d97706] to-[#f59e0b] border-[#fde68a] shadow-[0_0_5px_rgba(245,158,11,0.5)]'
                          : 'bg-gradient-to-t from-[#059669] to-[#10b981] border-[#6ee7b7] shadow-[0_0_5px_rgba(16,185,129,0.5)]'
                        : 'bg-[#061416] border-[#133036] opacity-35'
                    }`}
                  />
                );
              })}
            </div>

            <span className="text-[11px] font-mono font-bold text-[#e2f1f3] ml-1">
              {hudState.playerHp}/10
            </span>
          </div>

          {/* Player Bank of Energy Orbs */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#092b1a]/90 border border-[#1b5d38] shadow-[0_0_14px_rgba(34,197,94,0.2)]">
            <div className="relative flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80] animate-pulse" />
              <div className="absolute -top-0.5 -left-0.5 w-1 h-1 rounded-full bg-white" />
            </div>
            <span className="text-[11px] font-mono text-[#a7f3d0]">
              <strong className="text-[#4ade80] font-bold text-xs">{hudState.playerOrbs}</strong> Orbs
            </span>
          </div>

          {/* Active Weapon Badges with Live Upgraded Damage */}
          <div className="hidden xl:flex items-center gap-2">
            {/* Sword Slot */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition duration-200 ${
                hudState.animState === 'attack'
                  ? 'bg-[#1e4e4a] border-[#5eead4] text-white shadow-[0_0_14px_rgba(94,234,212,0.4)]'
                  : 'bg-[#0e272b] border-[#1d4d54] text-[#8cb0b6]'
              }`}
            >
              <Sword className="w-3.5 h-3.5 text-[#f5c342]" />
              <span className="text-[11px] font-bold tracking-wide font-sans">
                Sword <span className="text-[#f5c342] font-mono font-normal text-[10px]">Lv.{hudState.swordLevel}</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-[#ff7676] bg-[#2a1215] px-1.5 py-0.2 rounded border border-[#522026]">
                {6 + (hudState.swordLevel - 1)} DMG
              </span>
              <span className="text-[9px] font-mono text-[#fbbf24] bg-[#2b1f09] px-1 rounded border border-[#573e13]">
                {hudState.swordProgress}/10
              </span>
            </div>

            {/* Bow Slot */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition duration-200 ${
                hudState.animState === 'bow'
                  ? 'bg-[#18444a] border-[#3ec7b5] text-white shadow-[0_0_14px_rgba(62,199,181,0.4)]'
                  : 'bg-[#0e272b] border-[#1d4d54] text-[#8cb0b6]'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5 text-[#6df2e2]" />
              <span className="text-[11px] font-bold tracking-wide font-sans">
                Bow <span className="text-[#6df2e2] font-mono font-normal text-[10px]">Lv.{hudState.bowLevel}</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-[#5eead4] bg-[#0c2c31] px-1.5 py-0.2 rounded border border-[#1b555e]">
                {4 + (hudState.bowLevel - 1)}/{3 + (hudState.bowLevel - 1)}/{2 + (hudState.bowLevel - 1)} DMG
              </span>
              <span className="text-[9px] font-mono text-[#2dd4bf] bg-[#082226] px-1 rounded border border-[#174850]">
                {hudState.bowProgress}/10
              </span>
            </div>
          </div>
        </div>

        {/* Right: Enemy Radar, Defeated Count, Zoom & Controls */}
        <div className="flex items-center space-x-2.5 text-xs font-mono">
          {/* Active Slimes Badge */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0c262a] border border-[#1d4f55]">
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
            <span className="text-[#a5c7cc] text-[11px]">
              <strong className="text-[#64e4d5]">{hudState.enemyCount}</strong> Slimes (10 HP)
            </span>
          </div>

          {/* Slain Counter Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0c262a] border border-[#1d4f55]">
            <Skull className="w-3.5 h-3.5 text-[#f5c342]" />
            <span className="text-[#a5c7cc] text-[11px]">
              <strong className="text-[#f5d77f]">{hudState.defeatedCount}</strong> Slain
            </span>
          </div>

          {/* Facing & State Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0c262a] border border-[#1d4f55]">
            <span className="text-[#6d9196] capitalize">{hudState.direction}</span>
            <span className="text-[#2a5d63]">•</span>
            <span
              className={`font-semibold capitalize ${
                hudState.isHurt
                  ? 'text-[#ff4d4d] animate-pulse'
                  : hudState.animState === 'attack'
                  ? 'text-[#ff7676]'
                  : hudState.animState === 'bow'
                  ? 'text-[#5eead4]'
                  : 'text-[#e5ca78]'
              }`}
            >
              {hudState.isHurt ? 'Hurt' : hudState.animState}
            </span>
          </div>

          {/* Zoom Toggle */}
          <button
            id="zoom-toggle-btn"
            onClick={cycleZoom}
            title="Cycle Camera Zoom Level"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#113136] hover:bg-[#184248] active:bg-[#1e5058] border border-[#21535b] text-[#c2eae6] transition cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5 text-[#5eead4]" />
            <span className="text-[11px] font-sans font-medium">
              {zoomDisplay === 1.8 ? '1.8x' : zoomDisplay === 2.2 ? '2.2x' : '2.8x'}
            </span>
          </button>

          {/* Speed Toggle */}
          <button
            id="speed-toggle-btn"
            onClick={toggleSpeed}
            title="Toggle Sprint / Walk Speed"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#113136] hover:bg-[#184248] active:bg-[#1e5058] border border-[#21535b] text-[#c2eae6] transition cursor-pointer"
          >
            <Gauge className="w-3.5 h-3.5 text-[#5eead4]" />
            <span className="text-[11px] font-sans font-medium">{hudState.speed > 1 ? 'Sprint' : 'Walk'}</span>
          </button>

          {/* Reset position */}
          <button
            id="reset-pos-btn"
            onClick={resetPosition}
            title="Reset Character & Chamber"
            className="p-1.5 rounded-lg bg-[#113136] hover:bg-[#184248] border border-[#21535b] text-[#c2eae6] transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Game Screen Canvas */}
      <div className="flex-1 w-full h-full flex items-center justify-center relative overflow-hidden">
        <canvas
          id="character-game-canvas"
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          className="w-full h-full block cursor-crosshair"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Ambient Dark Corner Vignette */}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(4,14,16,0.85)]" />
      </div>

      {/* On-Screen Controls Overlay (Bottom-Left) */}
      <div
        id="onscreen-arrow-controls"
        className="absolute bottom-5 left-5 z-20 flex items-center gap-3 bg-[#0a1b1d]/90 backdrop-blur-md border border-[#1b4348] p-3 rounded-xl shadow-2xl"
      >
        {/* D-Pad */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#699196] mb-1.5 font-semibold">
            Move
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <div />
            <button
              id="arrow-up-btn"
              onMouseDown={() => setVirtualKey('ArrowUp', true)}
              onMouseUp={() => setVirtualKey('ArrowUp', false)}
              onMouseLeave={() => setVirtualKey('ArrowUp', false)}
              onTouchStart={() => setVirtualKey('ArrowUp', true)}
              onTouchEnd={() => setVirtualKey('ArrowUp', false)}
              className={`w-11 h-11 flex items-center justify-center rounded-lg border transition cursor-pointer active:scale-95 ${
                hudState.activeKeys.up
                  ? 'bg-[#297882] border-[#56d9c8] text-white shadow-[0_0_12px_rgba(86,217,200,0.5)]'
                  : 'bg-[#102b2f] hover:bg-[#163a3f] border-[#1f4a50] text-[#a0c5cb]'
              }`}
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div />

            <button
              id="arrow-left-btn"
              onMouseDown={() => setVirtualKey('ArrowLeft', true)}
              onMouseUp={() => setVirtualKey('ArrowLeft', false)}
              onMouseLeave={() => setVirtualKey('ArrowLeft', false)}
              onTouchStart={() => setVirtualKey('ArrowLeft', true)}
              onTouchEnd={() => setVirtualKey('ArrowLeft', false)}
              className={`w-11 h-11 flex items-center justify-center rounded-lg border transition cursor-pointer active:scale-95 ${
                hudState.activeKeys.left
                  ? 'bg-[#297882] border-[#56d9c8] text-white shadow-[0_0_12px_rgba(86,217,200,0.5)]'
                  : 'bg-[#102b2f] hover:bg-[#163a3f] border-[#1f4a50] text-[#a0c5cb]'
              }`}
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              id="arrow-down-btn"
              onMouseDown={() => setVirtualKey('ArrowDown', true)}
              onMouseUp={() => setVirtualKey('ArrowDown', false)}
              onMouseLeave={() => setVirtualKey('ArrowDown', false)}
              onTouchStart={() => setVirtualKey('ArrowDown', true)}
              onTouchEnd={() => setVirtualKey('ArrowDown', false)}
              className={`w-11 h-11 flex items-center justify-center rounded-lg border transition cursor-pointer active:scale-95 ${
                hudState.activeKeys.down
                  ? 'bg-[#297882] border-[#56d9c8] text-white shadow-[0_0_12px_rgba(86,217,200,0.5)]'
                  : 'bg-[#102b2f] hover:bg-[#163a3f] border-[#1f4a50] text-[#a0c5cb]'
              }`}
            >
              <ArrowDown className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              id="arrow-right-btn"
              onMouseDown={() => setVirtualKey('ArrowRight', true)}
              onMouseUp={() => setVirtualKey('ArrowRight', false)}
              onMouseLeave={() => setVirtualKey('ArrowRight', false)}
              onTouchStart={() => setVirtualKey('ArrowRight', true)}
              onTouchEnd={() => setVirtualKey('ArrowRight', false)}
              className={`w-11 h-11 flex items-center justify-center rounded-lg border transition cursor-pointer active:scale-95 ${
                hudState.activeKeys.right
                  ? 'bg-[#297882] border-[#56d9c8] text-white shadow-[0_0_12px_rgba(86,217,200,0.5)]'
                  : 'bg-[#102b2f] hover:bg-[#163a3f] border-[#1f4a50] text-[#a0c5cb]'
              }`}
            >
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-28 w-px bg-[#193e43]" />

        {/* Dual Actions: Sword & Bow */}
        <div className="flex items-center gap-2">
          {/* Sword Attack Button */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#699196] mb-1.5 font-semibold">
              Melee
            </span>
            <button
              id="sword-attack-btn"
              onClick={triggerAttack}
              title={`Swing Sword (SPACEBAR) - ${6 + (hudState.swordLevel - 1)} DMG`}
              className={`w-18 h-24 flex flex-col items-center justify-center gap-1.5 rounded-xl border transition cursor-pointer active:scale-95 ${
                hudState.activeKeys.attack
                  ? 'bg-gradient-to-t from-[#c93b3b] to-[#ff6b6b] border-[#ffb3b3] text-white shadow-[0_0_18px_rgba(255,107,107,0.7)]'
                  : 'bg-gradient-to-t from-[#123136] to-[#1a444a] hover:from-[#173e44] hover:to-[#22565e] border-[#29646c] text-[#78ebe0]'
              }`}
            >
              <Sword className="w-5 h-5 stroke-[2.2]" />
              <span className="text-xs font-bold font-mono tracking-wide">SWORD</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-[#091b1d]/70 rounded font-mono text-[#ff9999] font-bold">
                {6 + (hudState.swordLevel - 1)} DMG
              </span>
            </button>
          </div>

          {/* Bow & Arrow Button */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#699196] mb-1.5 font-semibold">
              Ranged
            </span>
            <button
              id="bow-attack-btn"
              onClick={triggerForwardBow}
              title={`Fire Bow & Arrow (CLICK to Aim) - ${4 + (hudState.bowLevel - 1)} Close / ${3 + (hudState.bowLevel - 1)} Mid / ${2 + (hudState.bowLevel - 1)} Far`}
              className={`w-18 h-24 flex flex-col items-center justify-center gap-1.5 rounded-xl border transition cursor-pointer active:scale-95 ${
                hudState.activeKeys.bow
                  ? 'bg-gradient-to-t from-[#1b6d77] to-[#38b2ac] border-[#81e6d9] text-white shadow-[0_0_18px_rgba(56,178,172,0.7)]'
                  : 'bg-gradient-to-t from-[#102b2f] to-[#153e44] hover:from-[#14393f] hover:to-[#1a4a52] border-[#204d54] text-[#64e4d5]'
              }`}
            >
              <Crosshair className="w-5 h-5 stroke-[2.2]" />
              <span className="text-xs font-bold font-mono tracking-wide">BOW</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-[#091b1d]/70 rounded font-mono text-[#5eead4] font-bold">
                {2 + (hudState.bowLevel - 1)}-{4 + (hudState.bowLevel - 1)} DMG
              </span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-28 w-px bg-[#193e43]" />

        {/* Spend Orbs Menu */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#4ade80] mb-1.5 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_6px_#4ade80] animate-pulse" />
            Spend Orbs ({hudState.playerOrbs})
          </span>

          <div className="flex items-center gap-2">
            {/* Heal Button */}
            <button
              id="spend-heal-btn"
              onClick={handleSpendHeal}
              disabled={hudState.playerOrbs < 1 || hudState.playerHp >= 10}
              title={
                hudState.playerHp >= 10
                  ? 'Health Full (10/10)'
                  : hudState.playerOrbs < 1
                  ? 'Requires 1 Energy Orb'
                  : 'Heal 1 Health Bar (Costs 1 Orb)'
              }
              className={`w-18 h-24 flex flex-col items-center justify-center gap-1 rounded-xl border transition cursor-pointer active:scale-95 ${
                hudState.playerOrbs >= 1 && hudState.playerHp < 10
                  ? 'bg-gradient-to-t from-[#0e3321] to-[#165335] hover:from-[#13442c] hover:to-[#1c6943] border-[#22c55e] text-[#86efac] shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                  : 'bg-[#091b16] border-[#143d2c] text-[#427a5f] opacity-60 cursor-not-allowed'
              }`}
            >
              <Heart className="w-5 h-5 fill-current" />
              <span className="text-xs font-bold font-mono tracking-wide">HEAL</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-[#05140e]/80 rounded font-mono text-[#4ade80] font-semibold">
                1 ORB
              </span>
              <span className="text-[8px] font-mono text-[#a7f3d0]/80">
                +1 HP
              </span>
            </button>

            {/* Sword Upgrade Button */}
            <button
              id="spend-sword-btn"
              onClick={handleSpendSword}
              disabled={hudState.playerOrbs < 1}
              title={
                hudState.playerOrbs < 1
                  ? 'Requires 1 Energy Orb'
                  : `Upgrade Sword (${hudState.swordProgress}/10 towards +1 DMG)`
              }
              className={`w-21 h-24 flex flex-col items-center justify-center gap-0.5 px-1 rounded-xl border transition cursor-pointer active:scale-95 ${
                hudState.playerOrbs >= 1
                  ? 'bg-gradient-to-t from-[#3a220b] to-[#5c3710] hover:from-[#4a2c0f] hover:to-[#734515] border-[#f59e0b] text-[#fcd34d] shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-[#1e1509] border-[#3d2c12] text-[#7a5e30] opacity-60 cursor-not-allowed'
              }`}
            >
              <Sword className="w-4 h-4 stroke-[2.2]" />
              <span className="text-xs font-bold font-mono tracking-wide">SWORD</span>
              <div className="w-full px-1.5">
                <div className="text-[10px] font-mono font-bold text-center text-[#fbbf24]">
                  {hudState.swordProgress}/10
                </div>
                <div className="w-full h-1.5 bg-[#140e05] rounded-full overflow-hidden border border-[#523c1a] mt-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] transition-all duration-200"
                    style={{ width: `${(hudState.swordProgress / 10) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-[8px] font-mono text-[#fde68a]/90">
                Lv.{hudState.swordLevel} (+1 DMG)
              </span>
            </button>

            {/* Bow Upgrade Button */}
            <button
              id="spend-bow-btn"
              onClick={handleSpendBow}
              disabled={hudState.playerOrbs < 1}
              title={
                hudState.playerOrbs < 1
                  ? 'Requires 1 Energy Orb'
                  : `Upgrade Bow (${hudState.bowProgress}/10 towards +1 DMG)`
              }
              className={`w-21 h-24 flex flex-col items-center justify-center gap-0.5 px-1 rounded-xl border transition cursor-pointer active:scale-95 ${
                hudState.playerOrbs >= 1
                  ? 'bg-gradient-to-t from-[#0e2a2c] to-[#15464a] hover:from-[#13383c] hover:to-[#1b585d] border-[#2dd4bf] text-[#99f6e4] shadow-[0_0_12px_rgba(45,212,191,0.3)]'
                  : 'bg-[#091a1c] border-[#16383c] text-[#3e7278] opacity-60 cursor-not-allowed'
              }`}
            >
              <Crosshair className="w-4 h-4 stroke-[2.2]" />
              <span className="text-xs font-bold font-mono tracking-wide">BOW</span>
              <div className="w-full px-1.5">
                <div className="text-[10px] font-mono font-bold text-center text-[#2dd4bf]">
                  {hudState.bowProgress}/10
                </div>
                <div className="w-full h-1.5 bg-[#061517] rounded-full overflow-hidden border border-[#1d4f55] mt-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#14b8a6] to-[#2dd4bf] transition-all duration-200"
                    style={{ width: `${(hudState.bowProgress / 10) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-[8px] font-mono text-[#99f6e4]/90">
                Lv.{hudState.bowLevel} (+1 DMG)
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Helpful Controls Instruction Pill (Bottom-Right) */}
      <div
        id="instructions-panel"
        className="absolute bottom-5 right-5 z-20 flex items-center gap-3 bg-[#0a1b1d]/90 backdrop-blur-md border border-[#1b4348] px-4 py-2.5 rounded-xl text-xs text-[#a3c3c7] font-mono shadow-xl"
      >
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_6px_#4ade80]" />
          <span className="text-[#e2f1f3] font-sans font-medium">Orbs</span>
          <span className="text-[10px] text-[#4ade80] font-mono">Heal & Upgrade</span>
        </div>
        <div className="h-3 w-px bg-[#1e484e]" />
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-[#143439] border border-[#235056] rounded text-[#38b2ac] text-[11px] font-bold">
            CLICK
          </kbd>
          <span className="text-[#e2f1f3] font-sans font-medium">Bow</span>
        </div>
        <div className="h-3 w-px bg-[#1e484e]" />
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-[#143439] border border-[#235056] rounded text-[#ff7676] text-[11px] font-bold">
            SPACE
          </kbd>
          <span className="text-[#e2f1f3] font-sans font-medium">Sword</span>
        </div>
        <div className="h-3 w-px bg-[#1e484e]" />
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-[#143439] border border-[#235056] rounded text-[#4ade80] text-[11px]">
            ↑
          </kbd>
          <kbd className="px-1.5 py-0.5 bg-[#143439] border border-[#235056] rounded text-[#4ade80] text-[11px]">
            ↓
          </kbd>
          <kbd className="px-1.5 py-0.5 bg-[#143439] border border-[#235056] rounded text-[#4ade80] text-[11px]">
            ←
          </kbd>
          <kbd className="px-1.5 py-0.5 bg-[#143439] border border-[#235056] rounded text-[#4ade80] text-[11px]">
            →
          </kbd>
          <span className="text-[#a3c3c7] font-sans">Move</span>
        </div>
      </div>
    </div>
  );
};
