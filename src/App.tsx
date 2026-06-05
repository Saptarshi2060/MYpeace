import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  RotateCcw, 
  BookOpen, 
  Sparkles, 
  Coffee, 
  Heart, 
  Trophy, 
  HelpCircle, 
  Info, 
  Shield, 
  Gift, 
  MessageCircle, 
  Maximize2 
} from 'lucide-react';
import { soundEngine } from './utils/audio';
import { 
  drawAgnimitra, 
  drawCollectible, 
  drawEnemy, 
  drawParticle, 
  drawBoss, 
  drawBossProjectile, 
  drawBackground 
} from './utils/gameDrawer';
import { 
  GameStage, 
  Collectible, 
  Enemy, 
  Particle, 
  PopupMessage, 
  BossEntity, 
  BossProjectile 
} from './types';

// Hardcoded aspect ratio for crisp rendering and consistent game physics
const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;

export default function App() {
  // Game states
  const [stage, setStage] = useState<GameStage>('start');
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('agnimitra_highscore')) || 0;
    } catch {
      return 0;
    }
  });

  // Game stats
  const [confidence, setConfidence] = useState(25);
  const [energy, setEnergy] = useState(100);
  const [stress, setStress] = useState(0);
  const [teddyBearsCollected, setTeddyBearsCollected] = useState(0);
  const [score, setScore] = useState(0);

  // Sound state
  const [isMuted, setIsMuted] = useState(false);

  // Message lists
  const [motivationText, setMotivationText] = useState('');
  const [showMotivationPopup, setShowMotivationPopup] = useState(false);
  const [activeOverlayMessage, setActiveOverlayMessage] = useState<string | null>(null);
  const overlayTimerRef = useRef(0);

  // Surprise letter state
  const [showSaptarshiMessage, setShowSaptarshiMessage] = useState(false);
  const [typedLetter, setTypedLetter] = useState('');
  const [typewriterComplete, setTypewriterComplete] = useState(false);

  // Secret Easter Egg state
  const [showEasterEggModal, setShowEasterEggModal] = useState(false);

  // References for Game Loop and Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef({
    x: 100,
    y: 350,
    width: 32,
    height: 48,
    vx: 0,
    vy: 0,
    direction: 'right' as 'left' | 'right',
    isMoving: false,
    speedMultiplier: 1.0,
    invulnerableTime: 0,
    hasShield: false,
    slowTimer: 0,
    isDazed: false,
  });

  // Level Entities Refs
  const collectiblesRef = useRef<Collectible[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const popupMessagesRef = useRef<PopupMessage[]>([]);
  const controllerKeysRef = useRef<{ [key: string]: boolean }>({});

  // Boss Battle Refs
  const isBossSpawnedRef = useRef(false);
  const bossEntityRef = useRef<BossEntity>({
    x: GAME_WIDTH / 2 - 50,
    y: 60,
    width: 100,
    height: 100,
    hp: 10,
    maxHp: 10,
    vx: 2,
    vy: 0,
    pulse: 0,
    attackCooldown: 60,
  });
  const bossProjectilesRef = useRef<BossProjectile[]>([]);
  const isBossDefeatedRef = useRef(false);

  // Timing counters
  const tickRef = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const lastMotivationTime = useRef(Date.now());
  const coffeeDepleteTimerRef = useRef(0);
  const bossDefeatedTimer = useRef(0);

  // Onscreen motivational cues
  const MOTIVATIONS = [
    "You're working harder than you realize. Keep pushing! ⭐",
    "Progress matters far more than perfection. Take it step by step! 🌱",
    "One exam doesn't define your future, other gorgeous things await you! 🌸",
    "Keep moving forward, Agnimitra! You are incredibly strong! 💪",
    "You've already come so far! I am cheering for you! ❤️"
  ];

  const NEGATIVE_THOUGHT_LABELS = [
    "What if I fail?",
    "Others are better than me.",
    "I am not ready.",
    "I'll forget everything!",
    "Too much syllabus!"
  ];

  // Load sound configurations on start
  useEffect(() => {
    // Sync muted state
    const muted = soundEngine.getMutedState();
    setIsMuted(muted);
  }, []);

  // Sync music transitions depending on the stage
  useEffect(() => {
    if (stage === 'playing') {
      soundEngine.startMusic('game');
    } else if (stage === 'boss') {
      soundEngine.startMusic('boss');
    } else if (stage === 'victory') {
      soundEngine.startMusic('victory');
    } else {
      soundEngine.stopMusic();
    }
    return () => {
      soundEngine.stopMusic();
    };
  }, [stage]);

  // Handle highscores
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem('agnimitra_highscore', String(score));
      } catch (e) {
        console.error("Could not write high score", e);
      }
    }
  }, [score, highScore]);

  // Saptarshi letter typewriter effect
  useEffect(() => {
    if (showSaptarshiMessage) {
      const fullText = `Hi bb,

I know you've been worried about your exams.
But I want you to remember something.

Your marks can measure a paper.
They cannot measure your kindness.
They cannot measure your effort.
They cannot measure how special you are.

I am proud of you for studying.
I am proud of you for trying.
I am proud of you even before the results.

Now go show those exams who's boss.

Love,
Saptarshi ❤️`;

      let timer: any;
      let currentIndex = 0;
      setTypedLetter('');
      setTypewriterComplete(false);

      const type = () => {
        if (currentIndex < fullText.length) {
          setTypedLetter(fullText.substring(0, currentIndex + 1));
          soundEngine.playTypewriter();
          currentIndex++;
          timer = setTimeout(type, 35);
        } else {
          setTypewriterComplete(true);
        }
      };

      timer = setTimeout(type, 400);
      return () => clearTimeout(timer);
    }
  }, [showSaptarshiMessage]);

  // Periodically prompt motivation system (every 30 seconds)
  useEffect(() => {
    if (stage !== 'playing' && stage !== 'boss') return;

    const interval = setInterval(() => {
      const timeDiff = Date.now() - lastMotivationTime.current;
      if (timeDiff >= 30000) {
        // Trigger motivation
        const randomIndex = Math.floor(Math.random() * MOTIVATIONS.length);
        setMotivationText(MOTIVATIONS[randomIndex]);
        setShowMotivationPopup(true);
        soundEngine.playCollectStar();
        lastMotivationTime.current = Date.now();

        // Auto dismiss after 6 seconds
        setTimeout(() => {
          setShowMotivationPopup(false);
        }, 6000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [stage]);

  // Trigger floating text popup helper
  const addPopupMsg = (x: number, y: number, text: string, color: string = '#ffd32a') => {
    popupMessagesRef.current.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      life: 0,
      maxLife: 45,
      vy: -1.2,
    });
  };

  // Sparkle generator helper
  const createExplosion = (x: number, y: number, color: string, count: number = 8, shape: 'star' | 'circle' | 'heart' | 'bubble' = 'circle') => {
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count + Math.random() * 0.5;
      const speed = 1.5 + Math.random() * 2.5;
      particlesRef.current.push({
        id: Math.random().toString(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (shape === 'bubble' ? 1.0 : 0.5),
        color,
        life: 0,
        maxLife: 30 + Math.floor(Math.random() * 20),
        size: 3 + Math.random() * 4,
        shape,
      });
    }
  };

  // Sound Toggle click
  const muteToggle = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    // Restart music if playing
    if (!muted) {
      if (stage === 'playing') soundEngine.startMusic('game');
      else if (stage === 'boss') soundEngine.startMusic('boss');
      else if (stage === 'victory') soundEngine.startMusic('victory');
    } else {
      soundEngine.stopMusic();
    }
  };

  /**
   * Main game loop and frame ticker
   */
  const handleGameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    tickRef.current++;
    const tick = tickRef.current;

    // 1. Draw Background
    drawBackground(ctx, GAME_WIDTH, GAME_HEIGHT, tick, stage);

    const player = playerRef.current;

    // --- PLAYER MOVEMENT ---
    let dx = 0;
    let dy = 0;

    // Standard desktop controller binds
    if (controllerKeysRef.current['ArrowLeft'] || controllerKeysRef.current['KeyA']) {
      dx = -3.8;
      player.direction = 'left';
    }
    if (controllerKeysRef.current['ArrowRight'] || controllerKeysRef.current['KeyD']) {
      dx = 3.8;
      player.direction = 'right';
    }
    if (controllerKeysRef.current['ArrowUp'] || controllerKeysRef.current['KeyW']) {
      dy = -3.8;
    }
    if (controllerKeysRef.current['ArrowDown'] || controllerKeysRef.current['KeyS']) {
      dy = 3.8;
    }

    // Handle Slowdown from Social Distractions
    if (player.slowTimer > 0) {
      player.slowTimer--;
      player.speedMultiplier = 0.45;
      player.isDazed = true;
      // Emit distraction bubbles from player
      if (tick % 10 === 0) {
        particlesRef.current.push({
          id: Math.random().toString(),
          x: player.x + player.width / 2,
          y: player.y + player.height / 3,
          vx: (Math.random() - 0.5) * 1,
          vy: -1.5,
          color: '#54a0ff',
          life: 0,
          maxLife: 25,
          size: 4 + Math.random() * 3,
          shape: 'bubble',
        });
      }
    } else {
      player.speedMultiplier = 1.0;
      player.isDazed = false;
    }

    // Deplete coffee energy gradually
    coffeeDepleteTimerRef.current++;
    if (coffeeDepleteTimerRef.current >= 45) {
      coffeeDepleteTimerRef.current = 0;
      setEnergy((prev) => {
        const next = Math.max(0, prev - 1);
        if (next <= 0) {
          player.speedMultiplier *= 0.6; // Out of energetic stamina
        }
        return next;
      });
    }

    // Apply movement
    player.x += dx * player.speedMultiplier;
    player.y += dy * player.speedMultiplier;
    player.isMoving = dx !== 0 || dy !== 0;

    // Bound box checking
    if (player.x < 10) player.x = 10;
    if (player.x > GAME_WIDTH - player.width - 10) player.x = GAME_WIDTH - player.width - 10;
    if (player.y < 80) player.y = 80; // Keep space for HUD
    if (player.y > GAME_HEIGHT - player.height - 15) player.y = GAME_HEIGHT - player.height - 15;

    // Handle temporary vulnerability frame timer
    if (player.invulnerableTime > 0) {
      player.invulnerableTime--;
    }

    // 2. Draw Agnimitra (The Character!)
    drawAgnimitra(
      ctx,
      player.x,
      player.y,
      player.width,
      player.height,
      player.direction,
      player.isMoving,
      tick,
      player.hasShield,
      player.invulnerableTime > 0,
      player.isDazed
    );

    // --- GAME STAGE TRANSITIONS & BOSS TRIGGERS ---
    // If player reaches 80 confidence points and boss is not spawned yet, initiate Boss fight stage!
    if (confidence >= 80 && !isBossSpawnedRef.current && stage === 'playing') {
      isBossSpawnedRef.current = true;
      setStage('boss');
      soundEngine.playBossSpawn();
      setActiveOverlayMessage("ULTIMATE EXAM STRESS SPAWNED! 👹\nCollect 10 Stars to beat it!");
      overlayTimerRef.current = 180; // 3 seconds delay countdown message (180 frames at 60 FPS)
      // Spawn Boss
      bossEntityRef.current = {
        x: GAME_WIDTH / 2 - 50,
        y: 80,
        width: 100,
        height: 100,
        hp: 10,
        maxHp: 10,
        vx: 2.2,
        vy: 0,
        pulse: 0,
        attackCooldown: 60,
      };
      // Clear standard enemies to focus on the boss battle
      enemiesRef.current = [];
    }

    // Decrease message overlay timer
    if (overlayTimerRef.current > 0) {
      overlayTimerRef.current--;
      if (overlayTimerRef.current === 0) {
        setActiveOverlayMessage(null);
      }
    }

    // --- RENDERING BOSS BATTLE EXTRAS ---
    if (stage === 'boss') {
      const boss = bossEntityRef.current;
      boss.pulse += 0.05;

      // Move Boss horizontally bouncing off walls
      boss.x += boss.vx;
      if (boss.x < 40 || boss.x > GAME_WIDTH - boss.width - 40) {
        boss.vx = -boss.vx;
      }

      // Draw Boss
      drawBoss(ctx, boss, tick);

      // Boss launches projectile attacks
      boss.attackCooldown--;
      if (boss.attackCooldown <= 0) {
        boss.attackCooldown = 85 + Math.random() * 50; // Random delay
        // Shoot 2 or 3 projectles pointing downwards at Agnimitra
        soundEngine.playGetHit();
        const startX = boss.x + boss.width / 2;
        const startY = boss.y + boss.height - 10;
        
        // Calculate angle pointing at player
        const targetAngle = Math.atan2(player.y - startY, player.x - startX);

        bossProjectilesRef.current.push({
          id: Math.random().toString(),
          x: startX,
          y: startY,
          vx: Math.cos(targetAngle) * 3.2,
          vy: Math.sin(targetAngle) * 3.2,
          size: 14,
          color: '#ff4757',
          type: 'stress_orb',
        });

        // Chance to double shoot doubt boulders
        if (Math.random() > 0.45) {
          bossProjectilesRef.current.push({
            id: Math.random().toString(),
            x: startX + (Math.random() * 40 - 20),
            y: startY,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 2.8,
            size: 18,
            color: '#4b6584',
            type: 'doubt_boulder',
          });
        }
      }

      // Update and Draw Projectiles
      const newProjList: BossProjectile[] = [];
      bossProjectilesRef.current.forEach((proj) => {
        proj.x += proj.vx;
        proj.y += proj.vy;

        // Render project
        drawBossProjectile(ctx, proj, tick);

        // Collision bounds with Player
        const dist = Math.hypot((player.x + player.width / 2) - proj.x, (player.y + player.height / 2) - proj.y);
        if (dist < proj.size + 15) {
          // Player hit!
          handlePlayerHit(15);
          createExplosion(proj.x, proj.y, '#e74c3c', 6);
        } else if (proj.y < GAME_HEIGHT + 20 && proj.x > -20 && proj.x < GAME_WIDTH + 20) {
          // Recycle
          newProjList.push(proj);
        }
      });
      bossProjectilesRef.current = newProjList;
    }

    // --- SPAWNING ENEMIES ---
    // Periodic random spawning logic (more aggressive spawns if playing normally)
    if (stage === 'playing') {
      const spawnRate = tick % 110 === 0;
      if (spawnRate && enemiesRef.current.length < 8) {
        // Choose enemy type
        const val = Math.random();
        let type: 'stress' | 'negative' | 'social' = 'stress';
        let enemyLabel = '';
        let width = 30;
        let height = 30;

        if (val < 0.4) {
          type = 'stress';
          width = 32;
          height = 32;
        } else if (val < 0.8) {
          type = 'negative';
          width = 120; // broad room to write text
          height = 24;
          enemyLabel = NEGATIVE_THOUGHT_LABELS[Math.floor(Math.random() * NEGATIVE_THOUGHT_LABELS.length)];
        } else {
          type = 'social';
          width = 24;
          height = 30;
        }

        // Spawn on random edge
        const spawnFromLeft = Math.random() > 0.5;
        const sx = spawnFromLeft ? -width : GAME_WIDTH;
        const sy = 90 + Math.random() * (GAME_HEIGHT - 170);
        const vx = (spawnFromLeft ? 1.2 : -1.2) * (1 + Math.random() * 1.5);

        enemiesRef.current.push({
          id: Math.random().toString(),
          x: sx,
          y: sy,
          type,
          width,
          height,
          vx,
          vy: type === 'negative' ? 0.2 : (Math.random() - 0.5) * 0.8, // subtle wavy vertical pattern
          label: enemyLabel,
          animFrame: 0,
        });
      }
    }

    // --- MOVING AND RENDER ENEMIES ---
    const activeEnemies: Enemy[] = [];
    enemiesRef.current.forEach((enemy) => {
      enemy.x += enemy.vx;
      enemy.y += enemy.vy;

      // Keep them moving inside or handle edge bounce
      if (enemy.y < 85 || enemy.y > GAME_HEIGHT - enemy.height - 15) {
        enemy.vy = -enemy.vy;
      }

      drawEnemy(ctx, enemy, tick);

      // Check collision with Player
      let hit = false;
      const px = player.x + player.width / 2;
      const py = player.y + player.height / 2;
      const ex = enemy.x + enemy.width / 2;
      const ey = enemy.y + enemy.height / 2;

      // Customize hit-boxes (skinny height blocks/bounds or circle bounds)
      const horizontalDist = Math.abs(px - ex);
      const verticalDist = Math.abs(py - ey);

      if (horizontalDist < (player.width / 2 + enemy.width / 2.2) && 
          verticalDist < (player.height / 2 + enemy.height / 2.2)) {
        hit = true;
      }

      if (hit) {
        if (enemy.type === 'stress') {
          handlePlayerHit(15, "Oh no! Stress Cloud washed away confidence!");
          createExplosion(ex, ey, '#485460', 10);
        } else if (enemy.type === 'negative') {
          handlePlayerHit(10, `Avoid thought: "${enemy.label}"`);
          createExplosion(ex, ey, '#95afc0', 7);
        } else if (enemy.type === 'social') {
          handleSocialDistractHit();
          createExplosion(ex, ey, '#54a0ff', 8);
        }
      } else if (enemy.x > -200 && enemy.x < GAME_WIDTH + 200) {
        // Recycle enemy remaining on screens
        activeEnemies.push(enemy);
      }
    });
    enemiesRef.current = activeEnemies;

    // --- SPAWNING COLLECTIBLES ---
    // Spawn normal stars, books, coffees randomly
    if (tick % 75 === 0) {
      const colRand = Math.random();
      let type: 'star' | 'book' | 'coffee' | 'heart' | 'support' | 'teddy' = 'star';
      let message = "You're doing amazing!";
      let size = 26;

      if (colRand < 0.45) {
        type = 'star';
        message = Math.random() > 0.5 ? "Confidence restored!" : "Keep going bb!";
        size = 24;
      } else if (colRand < 0.72) {
        type = 'book';
        message = "知識 Knowledge Gained!";
        size = 22;
      } else if (colRand < 0.88) {
        type = 'coffee';
        message = "Stamina Restored! ⚡";
        size = 22;
      } else if (colRand < 0.94) {
        type = 'heart';
        message = "Gained Protection Shield! ❤️";
        size = 24;
      } else if (colRand < 0.97) {
        type = 'support';
        message = "Best Friend active!";
        size = 32;
      } else {
        // Secret Teddy Bear easter eggs
        type = 'teddy';
        message = "Secret Teddy Found! 🧸";
        size = 26;
      }

      // Constrain collectibles count in level
      if (collectiblesRef.current.length < 5) {
        collectiblesRef.current.push({
          id: Math.random().toString(),
          x: 40 + Math.random() * (GAME_WIDTH - 80),
          y: 95 + Math.random() * (GAME_HEIGHT - 160),
          type,
          width: size,
          height: size,
          pulseSpeed: 0.05 + Math.random() * 0.05,
          pulseTimer: 0,
          message,
        });
      }
    }

    // --- MOVING AND RENDERING COLLECTIBLES ---
    const activeCollectibles: Collectible[] = [];
    collectiblesRef.current.forEach((collect) => {
      drawCollectible(ctx, collect, tick);

      // Check Collision with Player
      let hit = false;
      const px = player.x + player.width / 2;
      const py = player.y + player.height / 2;
      const cx = collect.x + collect.width / 2;
      const cy = collect.y + collect.height / 2;

      if (Math.hypot(px - cx, py - cy) < (player.width / 2 + collect.width / 2)) {
        hit = true;
      }

      if (hit) {
        handleCollectItem(collect);
      } else {
        activeCollectibles.push(collect);
      }
    });
    collectiblesRef.current = activeCollectibles;

    // --- RENDERING FLOATING POPUPS AND TEXT ---
    const activePopups: PopupMessage[] = [];
    popupMessagesRef.current.forEach((pop) => {
      pop.life++;
      pop.y += pop.vy;

      ctx.save();
      const op = 1 - pop.life / pop.maxLife;
      ctx.globalAlpha = op;
      ctx.fillStyle = pop.color;
      ctx.lineWidth = 1.5;
      ctx.font = '600 11px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      // Little cloud capsule outline
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();

      if (pop.life < pop.maxLife) {
        activePopups.push(pop);
      }
    });
    popupMessagesRef.current = activePopups;

    // --- RENDERING PARTICLES ---
    const activeParticles: Particle[] = [];
    particlesRef.current.forEach((part) => {
      part.life++;
      part.x += part.vx;
      part.y += part.vy;

      drawParticle(ctx, part);

      if (part.life < part.maxLife) {
        activeParticles.push(part);
      }
    });
    particlesRef.current = activeParticles;

    // Call next iteration
    animationFrameId.current = requestAnimationFrame(handleGameLoop);
  };

  // Run or Pause game frame triggers
  useEffect(() => {
    if (stage === 'playing' || stage === 'boss') {
      animationFrameId.current = requestAnimationFrame(handleGameLoop);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [stage, confidence, energy, stress, teddyBearsCollected]);

  /**
   * Action Handling triggered from events
   */

  // Event keys listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      controllerKeysRef.current[e.code] = true;

      // Handle pause using Space/Escape
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (stage === 'playing') {
          setStage('paused');
        } else if (stage === 'paused') {
          setStage('playing');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      controllerKeysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [stage]);

  // Handling standard Player Hit Damage
  const handlePlayerHit = (amt: number, logMsg?: string) => {
    const player = playerRef.current;
    if (player.invulnerableTime > 0) return;

    // Check temporary energy shield
    if (player.hasShield) {
      player.hasShield = false;
      player.invulnerableTime = 75; // 1.2 seconds safe
      soundEngine.playShieldBreak();
      addPopupMsg(player.x + 16, player.y - 12, "Shield Broken! 🛡️", "#ff4d4d");
      createExplosion(player.x + 16, player.y + 16, '#2bcbba', 12, 'bubble');
      return;
    }

    // Apply Damage
    soundEngine.playGetHit();
    player.invulnerableTime = 60; // 1 second safe delay
    
    // Decrease confidence points
    setConfidence((prev) => {
      const next = Math.max(0, prev - amt);
      return next;
    });

    // Increase stress points
    setStress((prev) => {
      const next = Math.min(100, prev + amt);
      if (next >= 100) {
        // Stress maximum reached -> Game Over!
        setStage('gameover');
      }
      return next;
    });

    // Score loss
    setScore((p) => Math.max(0, p - 3));

    if (logMsg) {
      addPopupMsg(player.x + player.width / 2, player.y - 15, `-${amt} Confidence 💔`, '#ff4d4d');
    }
  };

  const handleSocialDistractHit = () => {
    const player = playerRef.current;
    if (player.invulnerableTime > 0) return;

    soundEngine.playGetHit();
    player.invulnerableTime = 40;
    player.slowTimer = 160; // slow player down

    setStress((prev) => Math.min(100, prev + 5));
    addPopupMsg(player.x + 16, player.y - 15, "Dazed by Feed! 📱", "#54a0ff");
  };

  // Handling item collection
  const handleCollectItem = (item: Collectible) => {
    const player = playerRef.current;

    switch (item.type) {
      case 'star':
        soundEngine.playCollectStar();
        setConfidence((prev) => {
          const next = Math.min(100, prev + 10);
          return next;
        });
        setScore((p) => p + 15);
        addPopupMsg(item.x, item.y, "+10 Confidence ⭐", '#ffd32a');
        createExplosion(item.x, item.y, '#ffd32a', 15, 'star');

        // If in Boss battle, collecting stars damages the boss!
        if (stage === 'boss') {
          bossEntityRef.current.hp -= 1;
          createExplosion(bossEntityRef.current.x + bossEntityRef.current.width/2, bossEntityRef.current.y + bossEntityRef.current.height/2, '#ff4757', 20, 'star');
          soundEngine.playShieldBreak();
          addPopupMsg(bossEntityRef.current.x + 50, bossEntityRef.current.y, "Boss Hit! 💥", "#ff4757");

          if (bossEntityRef.current.hp <= 0) {
            // Defeated Boss! Celebration
            soundEngine.playSupportClear();
            createExplosion(bossEntityRef.current.x + 50, bossEntityRef.current.y + 50, '#ffda79', 50, 'star');
            setStage('victory');
          }
        }
        break;

      case 'book':
        soundEngine.playCollectBook();
        setConfidence((prev) => Math.min(100, prev + 15));
        setScore((p) => p + 25);
        addPopupMsg(item.x, item.y, "+15 Knowledge 📚", '#2ed573');
        createExplosion(item.x, item.y, '#7bed9f', 12);
        break;

      case 'coffee':
        soundEngine.playCollectCoffee();
        setEnergy((prev) => Math.min(100, prev + 35));
        addPopupMsg(item.x, item.y, "+35 Energy ☕", '#ff7f50');
        createExplosion(item.x, item.y, '#ffbe76', 8);
        break;

      case 'heart':
        soundEngine.playCollectCoffee(); // sweet sound!
        player.hasShield = true;
        addPopupMsg(item.x, item.y, "Shield Gained ❤️", '#ff4d4d');
        createExplosion(item.x, item.y, '#ff4d4d', 10, 'heart');
        break;

      case 'support':
        soundEngine.playSupportClear();
        // Clear all obstacles on screen and award massive boost!
        createExplosion(GAME_WIDTH / 2, GAME_HEIGHT / 2, '#381c5c', 40, 'star');
        addPopupMsg(item.x, item.y, "Best Friend Support activated! Clear Screen! 🌟", '#badc58');
        setConfidence((prev) => Math.min(100, prev + 20));
        setStress((prev) => Math.max(0, prev - 25));
        enemiesRef.current = [];
        bossProjectilesRef.current = [];
        break;

      case 'teddy':
        soundEngine.playTeddyBear();
        setTeddyBearsCollected((prev) => {
          const next = prev + 1;
          if (next === 5) {
            // Trigger Easter Egg Unlock Modal!
            setShowEasterEggModal(true);
            soundEngine.playSupportClear();
          }
          return next;
        });
        addPopupMsg(item.x, item.y, `Teddy Bear Collected! 🧸 (${teddyBearsCollected + 1}/5)`, '#ffb8b8');
        createExplosion(item.x, item.y, '#ffb8b8', 10, 'heart');
        break;
    }
  };

  // Reset the stats for restart
  const handleRestartGame = () => {
    setConfidence(25);
    setEnergy(100);
    setStress(0);
    setTeddyBearsCollected(0);
    setScore(0);
    
    playerRef.current = {
      x: 100,
      y: 350,
      width: 32,
      height: 48,
      vx: 0,
      vy: 0,
      direction: 'right',
      isMoving: false,
      speedMultiplier: 1.0,
      invulnerableTime: 0,
      hasShield: false,
      slowTimer: 0,
      isDazed: false,
    };

    collectiblesRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    popupMessagesRef.current = [];
    bossProjectilesRef.current = [];
    isBossSpawnedRef.current = false;
    isBossDefeatedRef.current = false;
    lastMotivationTime.current = Date.now();
    setActiveOverlayMessage(null);
    overlayTimerRef.current = 0;
    
    setStage('playing');
  };

  // Mobile virtual button controls helper
  const handleOnscreenTouchStart = (key: string) => {
    controllerKeysRef.current[key] = true;
  };

  const handleOnscreenTouchEnd = (key: string) => {
    controllerKeysRef.current[key] = false;
  };

  return (
    <div id="game-main-root" className="min-h-screen bg-[#f3f4f6] text-[#2d3748] font-cute flex flex-col justify-between select-none relative overflow-hidden">
      
      {/* Sparkly Top banner bar HUD */}
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-3 flex justify-between items-center shadow-xs z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-[#ff6b81] w-10 h-10 rounded-full flex items-center justify-center text-white shadow-xs">
            🎓
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1e293b] tracking-tight font-cute">
              Agnimitra's Exam Survival Adventure
            </h1>
            <p className="text-xs text-gray-500 font-mono">
              Empowering Agnimitra to beat exam stress! highscore: <span className="text-[#ff4757] font-semibold">{highScore}</span> pts
            </p>
          </div>
        </div>

        {/* Global Toolbar Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={muteToggle}
            id="sound-toggle-btn"
            className="p-2.5 rounded-full bg-[#f8fafc] hover:bg-[#ff7979]/10 border border-[#e2e8f0] cursor-pointer transition-all text-gray-600 active:scale-95"
          >
            {isMuted ? <VolumeX size={18} className="text-[#ff4757]" /> : <Volume2 size={18} className="text-emerald-500" />}
          </button>

          {(stage === 'playing' || stage === 'boss') && (
            <button
              onClick={() => setStage('paused')}
              id="pause-toggle-btn"
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 cursor-pointer text-amber-700 font-semibold text-sm flex items-center space-x-1.5 transition-all active:scale-95"
            >
              <Pause size={14} />
              <span>Pause</span>
            </button>
          )}
        </div>
      </header>

      {/* Primary Intersected Screen Canvas Container */}
      <main className="flex-1 flex justify-center items-center py-6 px-4">
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-[#e2e8f0] max-w-[812px] w-full" style={{ minHeight: '500px' }}>
          
          {/* Main Visual HTML5 Canvas */}
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            id="game-canvas"
            className="block w-full h-auto bg-[#f1f2f6]"
          />

          {/* 1. START SCREEN OVERLAY */}
          {stage === 'start' && (
            <div className="absolute inset-0 bg-[#2d3748]/65 backdrop-blur-md flex flex-col justify-center items-center text-white text-center p-8 z-20">
              {/* Cute sparkles ambient graphic background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute top-10 left-12 animate-bounce text-3xl">⭐</div>
                <div className="absolute top-32 right-16 animate-pulse text-4xl">💭</div>
                <div className="absolute bottom-16 left-20 animate-spin text-2xl">📚</div>
                <div className="absolute bottom-24 right-32 animate-bounce text-3xl">☕</div>
                <div className="absolute top-1/2 left-1/3 animate-pulse text-4xl">❤️</div>
              </div>

              {/* Logo / Cover design */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-xl flex flex-col justify-center items-center"
              >
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-5xl mb-4 border border-white/20 animate-bounce">
                  🎒
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-md font-cute mb-3">
                  Agnimitra's Exam Survival Adventure
                </h1>
                <p className="text-rose-300 font-medium text-lg leading-relaxed mb-8 select-none">
                  "One exam season. One brave student. Unlimited potential."
                </p>

                {/* Primary navigation blocks */}
                <div className="space-y-3.5 w-full max-w-sm">
                  <button
                    onClick={() => {
                      soundEngine.playCollectStar();
                      handleRestartGame();
                    }}
                    id="action-start-game"
                    className="w-full py-4 px-6 bg-gradient-to-r from-emerald-400 to-[#10b981] hover:from-emerald-500 hover:to-[#059669] text-white font-bold rounded-2xl shadow-lg border-b-4 border-emerald-700 active:translate-y-1 active:border-b-0 cursor-pointer transition-all flex items-center justify-center space-x-2.5 text-lg"
                  >
                    <Play size={20} fill="white" />
                    <span>Start Survival Adventure!</span>
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        soundEngine.playCollectBook();
                        setStage('instructions');
                      }}
                      id="action-instructions"
                      className="py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-medium cursor-pointer transition-all flex items-center justify-center space-x-1.5"
                    >
                      <HelpCircle size={16} />
                      <span>Instructions</span>
                    </button>
                    <button
                      onClick={() => {
                        soundEngine.playCollectCoffee();
                        setStage('about');
                      }}
                      id="action-about"
                      className="py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-medium cursor-pointer transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Info size={16} />
                      <span>About Cute Dev</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* 2. INSTRUCTIONS OVERLAY */}
          {stage === 'instructions' && (
            <div className="absolute inset-0 bg-[#f8fafc] flex flex-col justify-between p-6 overflow-y-auto z-20">
              <div className="max-w-2xl mx-auto w-full">
                <div className="flex justify-between items-center border-b border-[#ffd2df] pb-3 mb-5">
                  <h2 className="text-2xl font-bold flex items-center text-[#ff4757]">
                    <HelpCircle className="mr-2" />
                    How to Help Agnimitra Survive & Perfect Her Exams
                  </h2>
                  <button
                    onClick={() => {
                      soundEngine.playCollectBook();
                      setStage('start');
                    }}
                    className="p-1 px-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-bold cursor-pointer"
                  >
                    Back
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                  Agnimitra is studying hard for her tests, but stress monsters are wandering everywhere trying to demotivate her! Guide her through the study desk using <b>Arrow keys / WASD</b> (or visual buttons below) and collect positivity!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Collect list */}
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 shadow-xs">
                    <h3 className="font-bold text-emerald-800 flex items-center mb-3">
                      ⭐ Items to Collect
                    </h3>
                    <ul className="space-y-2.5 text-xs text-gray-700">
                      <li className="flex items-center">
                        <span className="text-lg mr-2">⭐</span>
                        <div><b>Confidence Star (+10 Confidence):</b> "You know more than you think."</div>
                      </li>
                      <li className="flex items-center">
                        <span className="text-lg mr-2">📚</span>
                        <div><b>Knowledge Book (+15 Confidence):</b> Masters active revision topics!</div>
                      </li>
                      <li className="flex items-center">
                        <span className="text-lg mr-2">☕</span>
                        <div><b>Coffee Cup (+5 Energy):</b> Keeps study stamina up. (Agnimitra is slowed when out of energy!)</div>
                      </li>
                      <li className="flex items-center">
                        <span className="text-lg mr-2">❤️</span>
                        <div><b>Encouragement Heart:</b> Grants a temporary shield!</div>
                      </li>
                    </ul>
                  </div>

                  {/* Avoid section */}
                  <div className="bg-red-50 rounded-2xl p-4 border border-red-100 shadow-xs">
                    <h3 className="font-bold text-red-800 flex items-center mb-3">
                      😭 Things to Avoid
                    </h3>
                    <ul className="space-y-2.5 text-xs text-gray-700">
                      <li className="flex items-center">
                        <span className="text-lg mr-2">😭</span>
                        <div><b>Stress Clouds (-15 Confidence):</b> Storms of self-doubt.</div>
                      </li>
                      <li className="flex items-center">
                        <span className="text-lg mr-2">💭</span>
                        <div><b>Negative Thought Bubbles (-10):</b> Avoids thoughts like "What if I fail?"</div>
                      </li>
                      <li className="flex items-center">
                        <span className="text-lg mr-2">📱</span>
                        <div><b>Social Media Phone Feed:</b> Temporarily slows down her speed. Keep focusing!</div>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Important target */}
                <div className="mt-6 bg-amber-50 rounded-2xl p-4 text-center border border-amber-200">
                  <p className="text-xs text-amber-800">
                    🎯 <b>Winning Goal:</b> Reach <b>100 Confidence points</b> before Stress reaches maximum. At 80 confidence points, be prepared to battle the <b>Ultimate Exam Stress Demon</b> directly!
                  </p>
                </div>
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={() => {
                    soundEngine.playCollectStar();
                    handleRestartGame();
                  }}
                  className="py-3 px-8 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl shadow-md cursor-pointer inline-flex items-center space-x-2"
                >
                  <Play size={16} fill="white" />
                  <span>Start Surviving Now!</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. ABOUT DEV SCREEN */}
          {stage === 'about' && (
            <div className="absolute inset-0 bg-[#f8fafc] flex flex-col justify-between p-6 z-20">
              <div className="max-w-md mx-auto text-center flex flex-col justify-center items-center h-full space-y-4">
                <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center text-4xl animate-pulse shadow-md">
                  💝
                </div>
                <h2 className="text-2xl font-bold font-cute text-[#2d3748]">
                  From Saptarshi with Love
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
                  This game was designed and engineered as a beautiful surprise and motivational toolkit for <b>Agnimitra</b>. 
                </p>
                <p className="text-xs text-pink-500 italic font-medium">
                  "Whenever things feel tough and books feel heavy, take a tiny playful break. You're clever, you've worked hard, and you have unlimited potential, bb!"
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      soundEngine.playCollectBook();
                      setStage('start');
                    }}
                    className="py-2.5 px-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-bold font-cute transition-all cursor-pointer"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. PAUSED OVERLAY */}
          {stage === 'paused' && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-center items-center text-white p-6 z-20">
              <div className="bg-white text-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative border-4 border-amber-300">
                <div className="text-amber-500 mb-3 flex justify-center">
                  <Coffee size={48} className="animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold font-cute text-slate-800 mb-2">
                  Study Break Mode
                </h3>
                <p className="text-xs text-gray-500 mb-6 font-medium">
                  Take a deep breath and relax. Agnimitra is recharging.
                </p>

                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      soundEngine.playCollectCoffee();
                      setStage('playing');
                    }}
                    className="w-full py-3 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
                  >
                    <Play size={16} fill="white" />
                    <span>Resume Studying</span>
                  </button>

                  <button
                    onClick={handleRestartGame}
                    className="w-full py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[#ff4757] font-semibold rounded-xl cursor-pointer flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
                  >
                    <RotateCcw size={16} />
                    <span>Restart Fresh</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. GAME OVER / CORDIAL RETRY OVERLAY */}
          {stage === 'gameover' && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col justify-center items-center text-white p-6 z-20">
              <div className="bg-white text-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-4 border-rose-400">
                <div className="text-rose-500 mb-2 text-5xl">
                  🌸
                </div>
                <h3 className="text-3xl font-extrabold font-cute text-slate-800 mb-1">
                  Take a Deep Breath!
                </h3>
                <p className="text-xs text-rose-500 font-semibold mb-4 bg-rose-50/70 inline-block px-3 py-1 rounded-full">
                  "Progress matters more than perfection!"
                </p>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-xs mx-auto">
                  Exams have some stressful moments, but that is perfectly okay. Saptarshi believes in you! Drink some water and try again!
                </p>

                {/* Score specs */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 mb-6 grid grid-cols-2 gap-2 text-left">
                  <div>
                    <span className="text-xs text-gray-400 block font-medium">Exam Score</span>
                    <span className="text-xl font-bold text-slate-800 font-mono">{score} pts</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-medium">Bears Found</span>
                    <span className="text-xl font-bold text-slate-800 font-mono">🧸 {teddyBearsCollected}/5</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      soundEngine.playCollectCoffee();
                      setStage('start');
                    }}
                    className="flex-1 py-3 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl cursor-pointer text-sm transition-all active:scale-95"
                  >
                    Exit Table
                  </button>
                  <button
                    onClick={handleRestartGame}
                    className="flex-2 py-3 px-4 bg-gradient-to-r from-emerald-400 to-[#10b981] text-white font-bold rounded-xl cursor-pointer shadow-md hover:opacity-90 flex items-center justify-center space-x-1.5 active:scale-95 transition-all text-sm"
                  >
                    <RotateCcw size={16} />
                    <span>Try Again, bb!</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. VICTORY SCREEN / CONGRATULATIONS OVERLAY */}
          {stage === 'victory' && (
            <div className="absolute inset-0 bg-[#352f44]/80 backdrop-blur-md flex flex-col justify-center items-center text-white scroll-y p-6 z-20">
              <div className="text-center absolute inset-0 pointer-events-none overflow-hidden opacity-25">
                <div className="absolute top-10 left-10 text-4xl animate-bounce">✨</div>
                <div className="absolute top-15 right-10 text-5xl animate-pulse">🎉</div>
                <div className="absolute bottom-20 left-15 text-5xl animate-spin">💖</div>
                <div className="absolute bottom-1/3 right-12 text-4xl animate-bounce">🧁</div>
              </div>

              {!showSaptarshiMessage ? (
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white text-[#2d3748] rounded-3xl p-8 max-w-xl w-full text-center shadow-2xl relative border-4 border-amber-400"
                >
                  <div className="text-6xl mb-3">🏆</div>
                  <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight font-cute mb-1">
                    Congratulations Agnimitra!
                  </h2>
                  <p className="text-indigo-600 text-sm font-semibold mb-6">
                    You completely defeated Ultimate Exam Stress!
                  </p>

                  <div className="bg-[#fcf8ff] p-5.5 rounded-2xl border border-[#eedfff] text-left space-y-2 mb-6">
                    <p className="text-sm text-[#474c72] font-semibold">Survival Evidence Proves:</p>
                    <ul className="text-xs space-y-1.5 text-gray-600">
                      <li className="flex items-center">
                        <span className="text-emerald-500 mr-2">✓</span>
                        <b>You are incredibly hardworking</b>
                      </li>
                      <li className="flex items-center">
                        <span className="text-emerald-500 mr-2">✓</span>
                        <b>You are exceptionally capable</b>
                      </li>
                      <li className="flex items-center">
                        <span className="text-emerald-500 mr-2">✓</span>
                        <b>You are stronger than self-doubt</b>
                      </li>
                      <li className="flex items-center">
                        <span className="text-emerald-500 mr-2">✓</span>
                        <b>Your effort deserves absolute celebration!</b>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      soundEngine.playSupportClear();
                      setShowSaptarshiMessage(true);
                    }}
                    id="read-saptarshi-letter"
                    className="w-full py-4 px-6 bg-gradient-to-r from-pink-400 to-[#f368e0] text-white rounded-xl font-bold shadow-md hover:from-pink-500 hover:to-[#eb3b5a] active:translate-y-0.5 cursor-pointer flex items-center justify-center space-x-2.5 text-md transition-all"
                  >
                    <Gift size={18} className="animate-bounce" />
                    <span>Read a Message From Saptarshi ❤️</span>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-b from-[#fff5f5] to-[#fff0f3] text-slate-800 rounded-3xl p-8 max-w-xl w-full text-center shadow-2xl relative border-4 border-rose-400 flex flex-col min-h-[380px] justify-between"
                >
                  {/* Hearts animations loops */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <span className="absolute top-1/4 left-1/10 text-red-400/20 text-3xl animate-ping">❤️</span>
                    <span className="absolute bottom-1/4 right-1/10 text-red-500/30 text-4xl animate-bounce">❤️</span>
                  </div>

                  <div>
                    <div className="flex justify-between items-center border-b border-rose-100 pb-3.5 mb-5 text-slate-800">
                      <span className="font-bold text-[#ff4757] font-cute text-lg">❤️ Saptarshi's Envelope</span>
                      <span className="text-[10px] font-mono text-gray-400">June 5, 2026</span>
                    </div>

                    {/* Letter visual bubble */}
                    <p className="text-sm font-medium text-left leading-relaxed text-[#3d2c2e] font-sans whitespace-pre-wrap min-h-[220px]">
                      {typedLetter}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-rose-100 flex gap-3">
                    <button
                      onClick={() => {
                        soundEngine.playCollectStar();
                        setShowSaptarshiMessage(false);
                      }}
                      className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[#ff4757] font-semibold text-xs rounded-xl cursor-pointer"
                    >
                      Back Info
                    </button>
                    <button
                      onClick={handleRestartGame}
                      className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-400 to-[#10b981] text-white font-bold rounded-xl cursor-pointer text-xs flex items-center justify-center space-x-1 hover:opacity-90 active:scale-95"
                    >
                      <RotateCcw size={12} />
                      <span>Play Survival Again!</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* GAME ON-SCREEN HUD OVERLAY (Always active while studying!) */}
          {(stage === 'playing' || stage === 'boss') && (
            <div className="absolute top-2 left-2 right-2 p-3 bg-white/95 backdrop-blur-xs border border-[#e2e8f0]/80 rounded-2xl flex flex-wrap justify-between items-center shadow-md select-none pointer-events-auto z-10">
              
              {/* Meters stats list */}
              <div className="flex items-center space-x-6 flex-wrap">
                
                {/* Confidence Bar */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center text-xs mb-0.5">
                    <span className="font-bold text-[#fa8231] flex items-center">
                      <Sparkles size={13} className="mr-0.5 text-yellow-500 fill-yellow-500" />
                      Confidence
                    </span>
                    <span className="font-bold text-gray-500 text-[10px] ml-1">{confidence}/100</span>
                  </div>
                  <div className="w-32 bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200/50">
                    <div 
                      className="bg-amber-400 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                </div>

                {/* Study Energy (Coffee Meter) */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center text-xs mb-0.5">
                    <span className="font-bold text-emerald-600 flex items-center">
                      <Coffee size={13} className="mr-0.5 text-emerald-500" />
                      Study Energy
                    </span>
                    <span className="font-bold text-gray-500 text-[10px] ml-1">{energy}/100</span>
                  </div>
                  <div className="w-24 bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200/50">
                    <div 
                      className="bg-emerald-400 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${energy}%` }}
                    />
                  </div>
                </div>

                {/* Exam Stress level */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center text-xs mb-0.5">
                    <span className="font-bold text-[#eb3b5a] flex items-center">
                      💔 Exam Stress
                    </span>
                    <span className="font-bold text-gray-500 text-[10px] ml-1">{stress}/100</span>
                  </div>
                  <div className="w-24 bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200/50">
                    <div 
                      className="bg-[#eb3b5a] h-full rounded-full transition-all duration-300" 
                      style={{ width: `${stress}%` }}
                    />
                  </div>
                </div>

                {/* Shield status */}
                {playerRef.current.hasShield && (
                  <div className="bg-rose-50 border border-rose-200 text-[#ff4757] font-semibold text-[10px] py-1 px-2.5 rounded-full flex items-center space-x-1 shadow-xs animate-pulse">
                    <Shield size={10} className="fill-[#ff4757]" />
                    <span>Shield Active!</span>
                  </div>
                )}
              </div>

              {/* Teddy and Score points indicator */}
              <div className="flex items-center space-x-4">
                {/* Teddy bears counter indicator */}
                <div className="text-xs bg-[#fff5f5] text-pink-600 border border-pink-100 px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1">
                  <span>🧸</span>
                  <span>{teddyBearsCollected}/5</span>
                </div>

                {/* Score */}
                <div className="text-sm font-bold bg-[#f1f2f6] px-3 py-1 rounded-xl text-[#2f3542] font-mono border border-slate-200">
                  Score: <span className="text-indigo-600">{score}</span>
                </div>
              </div>
            </div>
          )}

          {/* MOTIVATIONAL WATERMARK POPUPS (Every 30 seconds popup overlays) */}
          <AnimatePresence>
            {showMotivationPopup && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute left-4 right-4 bottom-22 bg-gradient-to-r from-[#ffeaa7] to-[#fad390] text-amber-900 px-5 py-3 rounded-2xl border border-amber-300 shadow-xl text-center font-bold text-sm pointer-events-none z-10"
              >
                💌 Support: "{motivationText}"
              </motion.div>
            )}
          </AnimatePresence>

          {/* DYNAMIC COUNTDOWN MESSAGE OVERLAYS FOR STAGE TRANSITIONS */}
          {activeOverlayMessage && (
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-30">
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bg-[#2c2c54]/95 text-[#ffc048] px-8 py-5 rounded-3xl border-4 border-[#ffbe76] text-center max-w-sm shadow-2xl font-cute font-extrabold text-lg leading-relaxed whitespace-pre-wrap"
              >
                {activeOverlayMessage}
              </motion.div>
            </div>
          )}
        </div>
      </main>

      {/* EASTER EGG SECRETS TEDDY REVEAL MODAL */}
      <AnimatePresence>
        {showEasterEggModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-4 z-40">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-6 text-center max-w-md w-full shadow-2xl relative border-4 border-pink-300"
            >
              <button
                onClick={() => {
                  soundEngine.playCollectBook();
                  setShowEasterEggModal(false);
                }}
                className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 animate-bounce border border-pink-100">
                🧸
              </div>

              <h4 className="text-xl font-bold font-cute text-[#eb3b5a] mb-1">
                🧁 Teddy's Secret Message Unlocked!
              </h4>
              <p className="text-xs text-[#fa8231] font-semibold mb-4 font-mono">
                5 of 5 teddy bears located!
              </p>

              <div className="bg-[#fffbfa] border border-pink-100 rounded-2xl p-5 mb-5">
                <p className="text-[13px] leading-relaxed font-semibold italic text-[#dd5a75]">
                  "Whenever things feel difficult, remember that someone is cheering for you every single step of the way ❤️"
                </p>
              </div>

              <button
                onClick={() => {
                  soundEngine.playCollectStar();
                  setShowEasterEggModal(false);
                }}
                className="py-2.5 px-6 bg-pink-100 hover:bg-pink-200 text-pink-600 font-bold rounded-xl transition-all cursor-pointer text-sm font-cute"
              >
                Love it! Back to Game
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE ONSCREEN HUD CONTROLLER (VIRTUAL DIRECTIONAL D-PAD) */}
      <footer className="bg-white border-t border-[#e2e8f0] py-4 px-6 flex flex-col items-center justify-center space-y-3 z-10">
        <p className="text-center text-[11px] text-gray-400 font-medium">
          Study Desk Navigation Guide: Use <b>Arrow Keys or WASD</b> of keyboard. For mobile devices, use keys below:
        </p>

        {/* Tactical tactile buttons */}
        <div className="flex flex-col items-center space-y-2">
          {/* UP direction button */}
          <button
            onMouseDown={() => handleOnscreenTouchStart('ArrowUp')}
            onMouseUp={() => handleOnscreenTouchEnd('ArrowUp')}
            onTouchStart={() => handleOnscreenTouchStart('ArrowUp')}
            onTouchEnd={() => handleOnscreenTouchEnd('ArrowUp')}
            className="w-14 h-12 bg-indigo-50 border-2 border-indigo-100 select-none text-indigo-600 rounded-2xl flex items-center justify-center font-bold shadow-xs active:bg-indigo-400 active:text-white transition-all scale-95 md:scale-100"
          >
            ▲
          </button>

          {/* Left, Down, Right line */}
          <div className="flex space-x-2">
            <button
              onMouseDown={() => handleOnscreenTouchStart('ArrowLeft')}
              onMouseUp={() => handleOnscreenTouchEnd('ArrowLeft')}
              onTouchStart={() => handleOnscreenTouchStart('ArrowLeft')}
              onTouchEnd={() => handleOnscreenTouchEnd('ArrowLeft')}
              className="w-14 h-12 bg-indigo-50 border-2 border-indigo-100 select-none text-indigo-600 rounded-2xl flex items-center justify-center font-bold shadow-xs active:bg-indigo-400 active:text-white transition-all scale-95 md:scale-100"
            >
              ◀
            </button>
            <button
              onMouseDown={() => handleOnscreenTouchStart('ArrowDown')}
              onMouseUp={() => handleOnscreenTouchEnd('ArrowDown')}
              onTouchStart={() => handleOnscreenTouchStart('ArrowDown')}
              onTouchEnd={() => handleOnscreenTouchEnd('ArrowDown')}
              className="w-14 h-12 bg-indigo-50 border-2 border-indigo-100 select-none text-indigo-600 rounded-2xl flex items-center justify-center font-bold shadow-xs active:bg-indigo-400 active:text-white transition-all scale-95 md:scale-100"
            >
              ▼
            </button>
            <button
              onMouseDown={() => handleOnscreenTouchStart('ArrowRight')}
              onMouseUp={() => handleOnscreenTouchEnd('ArrowRight')}
              onTouchStart={() => handleOnscreenTouchStart('ArrowRight')}
              onTouchEnd={() => handleOnscreenTouchEnd('ArrowRight')}
              className="w-14 h-12 bg-indigo-50 border-2 border-indigo-100 select-none text-indigo-600 rounded-2xl flex items-center justify-center font-bold shadow-xs active:bg-indigo-400 active:text-white transition-all scale-95 md:scale-100"
            >
              ▶
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Simple placeholder implementation to mimic close button (Importing X icon avoids compile problems)
function X({ size, className }: { size?: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
