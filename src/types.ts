export type Direction = 'down' | 'up' | 'left' | 'right';

export type AnimState = 'idle' | 'walk' | 'attack' | 'bow';

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface CharacterState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  direction: Direction;
  animState: AnimState;
  frameIndex: number;
  animTimer: number;
  dustTimer: number;
  isMoving: boolean;
}

export interface DustParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  alpha: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export interface BowArrow {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  vx: number;
  vy: number;
  angle: number;
  life: number;
  maxLife: number;
  trailTimer: number;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  direction: Direction;
  frame: number;
  animTimer: number;
  stateTimer: number;
  isMoving: boolean;
  hp: number;
  maxHp: number;
  hitFlashTimer: number;
  knockbackVx: number;
  knockbackVy: number;
  radius: number;
  wanderAngle: number;
  speed: number;
  spawnTimer?: number;
}

export interface DefeatParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface DefeatEffect {
  id: number;
  x: number;
  y: number;
  life: number;
  maxLife: number;
  particles: DefeatParticle[];
  rings: {
    radius: number;
    maxRadius: number;
    color: string;
    lineWidth: number;
  }[];
}

export interface DamagePopup {
  id: number;
  x: number;
  y: number;
  damage: number;
  label?: string;
  color: string;
  subColor?: string;
  vy: number;
  alpha: number;
  life: number;
  maxLife: number;
  scale: number;
}

export interface AmbientMote {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  baseAlpha: number;
  phase: number;
  pulseSpeed: number;
}

export interface EnergyOrb {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  bobPhase: number;
  life: number;
}
