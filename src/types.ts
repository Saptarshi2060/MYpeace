/**
 * Type declarations for "Agnimitra's Exam Survival Adventure"
 */

export type GameStage = 
  | 'start' 
  | 'instructions' 
  | 'playing' 
  | 'boss' 
  | 'victory' 
  | 'gameover' 
  | 'paused' 
  | 'about';

export interface Collectible {
  id: string;
  x: number;
  y: number;
  type: 'star' | 'book' | 'coffee' | 'heart' | 'support' | 'teddy';
  width: number;
  height: number;
  pulseSpeed: number;
  pulseTimer: number;
  message: string;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  type: 'stress' | 'negative' | 'social';
  width: number;
  height: number;
  vx: number;
  vy: number;
  label?: string; // e.g. for Negative Thoughts like "What if I fail?"
  animFrame: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
  shape: 'star' | 'circle' | 'heart' | 'bubble';
}

export interface PopupMessage {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number; // upward float speed
}

export interface BossEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  vx: number;
  vy: number;
  pulse: number;
  attackCooldown: number;
}

export interface BossProjectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  type: 'stress_orb' | 'doubt_boulder';
}
