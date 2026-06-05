import { Collectible, Enemy, Particle, BossEntity, BossProjectile } from '../types';

/**
 * Custom 2D Canvas Drawer for Agnimitra's Exam Survival game.
 * Renders cute vector-like illustrations directly to keep graphics crisp, responsive, and light.
 */

// Draw Agnimitra (the main player)
export function drawAgnimitra(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  dir: 'left' | 'right',
  isMoving: boolean,
  tick: number,
  hasShield: boolean,
  isInvulnerableRef: boolean,
  isDazed: boolean
) {
  ctx.save();

  // Face bounce cycle based on movement
  const bobbing = isMoving ? Math.sin(tick * 0.15) * 3 : Math.sin(tick * 0.05) * 1.5;
  const legCycle = isMoving ? Math.sin(tick * 0.18) * 6 : 0;

  // Let's draw the shadow beneath her
  ctx.beginPath();
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.ellipse(x + w / 2, y + h - 2, w / 1.8, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // 1. Draw Cute Red Backpack (behind, so drawn first)
  ctx.fillStyle = '#ff6b81';
  const bpX = dir === 'right' ? x + 2 : x + w - 14;
  const bpY = y + 20 + bobbing;
  drawRoundRect(ctx, bpX, bpY, 12, 22, 4);
  // Pocket on backpack
  ctx.fillStyle = '#ff4757';
  drawRoundRect(ctx, bpX + (dir === 'right' ? 2 : -2), bpY + 10, 8, 10, 2);

  // 2. Draw legs
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#333333';
  // Left Leg
  ctx.beginPath();
  ctx.moveTo(x + w / 2 - 6, y + h - 10);
  ctx.lineTo(x + w / 2 - 6 + (isMoving ? legCycle : 0), y + h - 1);
  ctx.stroke();
  // Right Leg
  ctx.beginPath();
  ctx.moveTo(x + w / 2 + 6, y + h - 10);
  ctx.lineTo(x + w / 2 + 6 - (isMoving ? legCycle : 0), y + h - 1);
  ctx.stroke();

  // Draw little brown shoes
  ctx.fillStyle = '#57606f';
  ctx.beginPath();
  ctx.arc(x + w / 2 - 6 + (isMoving ? legCycle : 0), y + h - 1, 4, 0, Math.PI * 2);
  ctx.arc(x + w / 2 + 6 - (isMoving ? legCycle : 0), y + h - 1, 4, 0, Math.PI * 2);
  ctx.fill();

  // 3. Dress/Body
  ctx.fillStyle = '#70a1ff'; // Pastel blue dress
  drawRoundRect(ctx, x + w / 2 - 12, y + 24 + bobbing, 24, 22, 6);
  // Dress collar
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(x + w / 2 - 6, y + 24 + bobbing);
  ctx.lineTo(x + w / 2 + 6, y + 24 + bobbing);
  ctx.lineTo(x + w / 2, y + 29 + bobbing);
  ctx.closePath();
  ctx.fill();

  // 4. Hair Back (cute brown hair tails)
  ctx.fillStyle = '#4a2c11'; // Brown hair
  // Left hair bunch
  ctx.beginPath();
  ctx.arc(x + w / 2 - 13, y + 16 + bobbing, 10, 0, Math.PI * 2);
  ctx.fill();
  // Right hair bunch
  ctx.beginPath();
  ctx.arc(x + w / 2 + 13, y + 16 + bobbing, 10, 0, Math.PI * 2);
  ctx.fill();

  // Tiny hair ties
  ctx.fillStyle = '#ff4757'; // Red bows or star bands
  ctx.beginPath();
  ctx.arc(x + w / 2 - 13, y + 9 + bobbing, 3, 0, Math.PI * 2);
  ctx.arc(x + w / 2 + 13, y + 9 + bobbing, 3, 0, Math.PI * 2);
  ctx.fill();

  // 5. Face/Head
  ctx.fillStyle = '#ffdfba'; // Soft peach skin
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 15 + bobbing, 14, 0, Math.PI * 2);
  ctx.fill();

  // 6. Hair Front/Bangs
  ctx.fillStyle = '#4a2c11';
  // Forehead hair
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 10 + bobbing, 14, Math.PI, 0, false);
  ctx.fill();
  // Side bangs
  ctx.beginPath();
  ctx.moveTo(x + w / 2 - 14, y + 10 + bobbing);
  ctx.lineTo(x + w / 2 - 13, y + 20 + bobbing);
  ctx.lineTo(x + w / 2 - 9, y + 15 + bobbing);
  ctx.moveTo(x + w / 2 + 14, y + 10 + bobbing);
  ctx.lineTo(x + w / 2 + 13, y + 20 + bobbing);
  ctx.lineTo(x + w / 2 + 9, y + 15 + bobbing);
  ctx.fill();

  // Little star hairclip
  ctx.fillStyle = '#ffd32a';
  ctx.beginPath();
  const starX = x + w / 2 - 8;
  const starY = y + 7 + bobbing;
  ctx.arc(starX, starY, 3, 0, Math.PI * 2);
  ctx.fill();

  // 7. Expressions
  const eyeOffset = dir === 'right' ? 3 : -3;
  ctx.fillStyle = '#2f3542';

  if (isDazed) {
    // Dizzy spiraled eyes
    ctx.strokeStyle = '#2f3542';
    ctx.lineWidth = 1.5;
    // Left eye spiral
    ctx.beginPath();
    ctx.arc(x + w / 2 - 5 + eyeOffset / 2, y + 14 + bobbing, 2, 0, Math.PI * 2);
    ctx.stroke();
    // Right eye spiral
    ctx.beginPath();
    ctx.arc(x + w / 2 + 5 + eyeOffset / 2, y + 14 + bobbing, 2, 0, Math.PI * 2);
    ctx.stroke();

    // Wobbly cute line mouth
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - 3, y + 19 + bobbing);
    ctx.quadraticCurveTo(x + w / 2, y + 17 + bobbing, x + w / 2 + 3, y + 19 + bobbing);
    ctx.stroke();
  } else if (isInvulnerableRef && Math.floor(tick / 5) % 2 === 0) {
    // Closed blink eyes when hit/invulnerable
    ctx.strokeStyle = '#2f3542';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - 7 + eyeOffset / 2, y + 14 + bobbing);
    ctx.lineTo(x + w / 2 - 3 + eyeOffset / 2, y + 14 + bobbing);
    ctx.moveTo(x + w / 2 + 3 + eyeOffset / 2, y + 14 + bobbing);
    ctx.lineTo(x + w / 2 + 7 + eyeOffset / 2, y + 14 + bobbing);
    ctx.stroke();

    // Flat mouth (upset/surprised index)
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - 2, y + 19 + bobbing);
    ctx.lineTo(x + w / 2 + 2, y + 19 + bobbing);
    ctx.stroke();
  } else {
    // Normal cute sparkling eyes
    ctx.beginPath();
    ctx.arc(x + w / 2 - 5 + eyeOffset / 2, y + 13 + bobbing, 2.5, 0, Math.PI * 2);
    ctx.arc(x + w / 2 + 5 + eyeOffset / 2, y + 13 + bobbing, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye sparkles
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + w / 2 - 5.5 + eyeOffset / 2, y + 12 + bobbing, 0.8, 0, Math.PI * 2);
    ctx.arc(x + w / 2 + 4.5 + eyeOffset / 2, y + 12 + bobbing, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Cozy pink cheeks
    ctx.fillStyle = 'rgba(255, 107, 129, 0.5)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2 - 7 + eyeOffset / 2, y + 16 + bobbing, 4, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w / 2 + 7 + eyeOffset / 2, y + 16 + bobbing, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sweet smile!
    ctx.strokeStyle = '#2f3542';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x + w / 2 + eyeOffset / 4, y + 16 + bobbing, 3, 0, Math.PI, false);
    ctx.stroke();
  }

  // Arms waving slightly
  ctx.strokeStyle = '#ffdfba';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  const armSwing = isMoving ? Math.sin(tick * 0.15) * 4 : 0;
  // Left Arm
  ctx.beginPath();
  ctx.moveTo(x + w / 2 - 12, y + 26 + bobbing);
  ctx.lineTo(x + w / 2 - 17, y + 30 + bobbing + armSwing);
  ctx.stroke();
  // Right Arm
  ctx.beginPath();
  ctx.moveTo(x + w / 2 + 12, y + 26 + bobbing);
  ctx.lineTo(x + w / 2 + 17, y + 30 + bobbing - armSwing);
  ctx.stroke();

  // 8. Shield visual effect (temporary shield)
  if (hasShield) {
    ctx.strokeStyle = `hsla(${tick * 4 % 360}, 90%, 65%, 0.85)`;
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, Math.max(w, h) * 0.75, 0, Math.PI * 2);
    ctx.stroke();
    // Soft inner glow color
    ctx.fillStyle = `hsla(${tick * 4 % 360}, 90%, 65%, 0.12)`;
    ctx.fill();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

// Draw any item Collectible
export function drawCollectible(ctx: CanvasRenderingContext2D, collect: Collectible, tick: number) {
  ctx.save();
  const hover = Math.sin(tick * collect.pulseSpeed + collect.id.charCodeAt(0)) * 4;
  const scale = 1 + Math.sin(tick * 0.08) * 0.05;

  const cx = collect.x + collect.width / 2;
  const cy = collect.y + collect.height / 2;

  ctx.translate(cx, cy + hover);
  ctx.scale(scale, scale);

  switch (collect.type) {
    case 'star': // Confidence Star ⭐
      drawVectorStar(ctx, 0, 0, 5, collect.width / 2, collect.width / 4, '#ffda79', '#ffa502');
      // Sparkle core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-2, -3, 2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'book': // Knowledge Book 📚
      // Hardcover pink book
      ctx.fillStyle = '#ff7979';
      drawRoundRect(ctx, -collect.width / 2, -collect.height / 2, collect.width, collect.height, 4);
      // Pages visual edge
      ctx.fillStyle = '#f5f6fa';
      drawRoundRect(ctx, -collect.width / 2 + 3, -collect.height / 2 + 1, collect.width - 4, collect.height - 2, 2);
      // Book stripe
      ctx.fillStyle = '#badc58';
      ctx.fillRect(-collect.width / 2, -collect.height / 6, collect.width - 4, 4);
      // Front book label / gold emblem
      ctx.fillStyle = '#f9ca24';
      ctx.beginPath();
      ctx.arc(0, -4, 3, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'coffee': // Energy Coffee Cups ☕
      // Plate
      ctx.fillStyle = '#95afc0';
      ctx.beginPath();
      ctx.ellipse(0, collect.height / 3, collect.width / 1.8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Cup body (Cozy cute green)
      ctx.fillStyle = '#2bcbba';
      drawRoundRect(ctx, -collect.width / 3, -collect.height / 4, (collect.width * 2) / 3, (collect.height * 2) / 3, 3);
      // Handle
      ctx.strokeStyle = '#2bcbba';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(collect.width / 3 + 1, 0, 4, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      // Coffee content
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(-collect.width / 3 + 2, -collect.height / 4 + 1, (collect.width * 2) / 3 - 4, 3);
      // Steam waving lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      const wave = Math.sin(tick * 0.1) * 2;
      ctx.moveTo(-4, -collect.height / 3);
      ctx.quadraticCurveTo(-4 + wave, -collect.height / 3 - 5, -2, -collect.height / 3 - 10);
      ctx.moveTo(3, -collect.height / 3 + 2);
      ctx.quadraticCurveTo(3 - wave, -collect.height / 3 - 3, 1, -collect.height / 3 - 8);
      ctx.stroke();
      break;

    case 'heart': // Encouragement Heart ❤️
      ctx.fillStyle = '#ff4d4d';
      ctx.beginPath();
      ctx.moveTo(0, collect.height / 4);
      ctx.bezierCurveTo(-collect.width / 2, -collect.height / 3, -collect.width / 1.5, -collect.height, 0, -collect.height / 2);
      ctx.bezierCurveTo(collect.width / 1.5, -collect.height, collect.width / 2, -collect.height / 3, 0, collect.height / 4);
      ctx.fill();
      // Highlight shine
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.ellipse(-collect.width / 5, -collect.height / 2.5, 3, 1.5, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'support': // Best Friend Power 🌟
      // Big glorious colored badge
      ctx.fillStyle = 'rgba(106, 176, 76, 0.15)';
      ctx.beginPath();
      ctx.arc(0, 0, collect.width * 0.75, 0, Math.PI * 2);
      ctx.fill();
      // Glow rings
      ctx.strokeStyle = `rgba(249, 202, 36, ${0.4 + Math.sin(tick * 0.1) * 0.2})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, collect.width * 0.6 + Math.sin(tick * 0.05) * 3, 0, Math.PI * 2);
      ctx.stroke();
      // Draw standard beautiful star
      drawVectorStar(ctx, 0, 0, 5, collect.width / 2, collect.width / 4.5, '#f9ca24', '#f0932b');
      // Mini hearts circling
      ctx.fillStyle = '#ff4d4d';
      const angle = tick * 0.04;
      const hx = Math.cos(angle) * (collect.width * 0.55);
      const hy = Math.sin(angle) * (collect.width * 0.55);
      drawMiniHeart(ctx, hx, hy, 6);
      break;

    case 'teddy': // Teddy Bear Collectible 🧸
      // Ears
      ctx.fillStyle = '#d5a173';
      ctx.beginPath();
      ctx.arc(-collect.width / 3.5, -collect.height / 3.5, 6, 0, Math.PI * 2);
      ctx.arc(collect.width / 3.5, -collect.height / 3.5, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff9999';
      ctx.beginPath();
      ctx.arc(-collect.width / 3.5, -collect.height / 3.5, 3, 0, Math.PI * 2);
      ctx.arc(collect.width / 3.5, -collect.height / 3.5, 3, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#c58f5f'; // Cute rich teddy brown
      ctx.beginPath();
      ctx.arc(0, 0, collect.width / 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Muzzle area
      ctx.fillStyle = '#f5dfcb';
      ctx.beginPath();
      ctx.arc(0, 3, collect.width / 4, 0, Math.PI * 2);
      ctx.fill();

      // Nose
      ctx.fillStyle = '#3d2511';
      ctx.beginPath();
      ctx.ellipse(0, 1.5, 3, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#1e1b18';
      ctx.beginPath();
      ctx.arc(-collect.width / 6, -1, 2, 0, Math.PI * 2);
      ctx.arc(collect.width / 6, -1, 2, 0, Math.PI * 2);
      ctx.fill();

      // Red bow tie
      ctx.fillStyle = '#ff3838';
      ctx.beginPath();
      ctx.moveTo(-5, collect.height / 2.6);
      ctx.lineTo(5, collect.height / 2.6 + 4);
      ctx.lineTo(5, collect.height / 2.6 - 4);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(5, collect.height / 2.6);
      ctx.lineTo(-5, collect.height / 2.6 + 4);
      ctx.lineTo(-5, collect.height / 2.6 - 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffb8b8';
      ctx.beginPath();
      ctx.arc(0, collect.height / 2.6, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.restore();
}

// Draw Mini Heart Helper
function drawMiniHeart(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, sz / 2);
  ctx.bezierCurveTo(-sz / 1.2, -sz / 2, -sz, -sz * 1.2, 0, -sz / 1.5);
  ctx.bezierCurveTo(sz, -sz * 1.2, sz / 1.2, -sz / 2, 0, sz / 2);
  ctx.fill();
  ctx.restore();
}

// Draw enemies
export function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, tick: number) {
  ctx.save();
  const bounce = Math.sin(tick * 0.08 + enemy.id.charCodeAt(0)) * 3;
  const cx = enemy.x + enemy.width / 2;
  const cy = enemy.y + enemy.height / 2;

  ctx.translate(cx, cy + bounce);

  switch (enemy.type) {
    case 'stress': // Stress Monster 😭
      // Red angry scary rain-cloud monster
      ctx.fillStyle = '#f7d794'; // cute skin inside
      // Cloud buffers
      ctx.fillStyle = '#485460'; // Dark anxiety storm cloud
      ctx.beginPath();
      ctx.arc(-14, -4, 14, 0, Math.PI * 2);
      ctx.arc(14, -4, 14, 0, Math.PI * 2);
      ctx.arc(0, -18, 16, 0, Math.PI * 2);
      ctx.arc(0, 4, 15, 0, Math.PI * 2);
      ctx.fill();

      // Crying text eyes
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#ffffff';
      // Left eye 😭 (Crying arcs)
      ctx.beginPath();
      ctx.arc(-8, -4, 3, Math.PI, 0, false);
      ctx.stroke();
      // Right eye 😭 (Crying arcs)
      ctx.beginPath();
      ctx.arc(8, -4, 3, Math.PI, 0, false);
      ctx.stroke();

      // Rain tears falling down
      ctx.fillStyle = '#70a1ff';
      const tearY = (tick * 1.2) % 15;
      ctx.fillRect(-8, tearY - 2, 2, 4);
      ctx.fillRect(8, tearY - 2, 2, 4);

      // Anguished open mouth
      ctx.fillStyle = '#3d3d3d';
      ctx.beginPath();
      ctx.arc(0, 3, 4, 0, Math.PI, false);
      ctx.fill();
      break;

    case 'negative': // Negative Thought 💭
      // Draw speech bubble cloud
      ctx.fillStyle = '#ececec';
      ctx.strokeStyle = '#95afc0';
      ctx.lineWidth = 1.5;

      const bw = enemy.width;
      const bh = enemy.height;

      ctx.beginPath();
      // Round Rect bubble
      drawRoundRectPath(ctx, -bw / 2, -bh / 2, bw, bh, 8);
      ctx.fill();
      ctx.stroke();

      // Bubble indicator pointer pointing downwards
      ctx.fillStyle = '#ececec';
      ctx.strokeStyle = '#95afc0';
      ctx.beginPath();
      ctx.moveTo(-4, bh / 2 - 1);
      ctx.lineTo(-8, bh / 2 + 6);
      ctx.lineTo(2, bh / 2 - 1);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-4, bh / 2 - 1);
      ctx.lineTo(-8, bh / 2 + 6);
      ctx.lineTo(2, bh / 2 - 1);
      ctx.stroke();

      // Draw Negative text labels very cleanly centered
      if (enemy.label) {
        ctx.fillStyle = '#2f3542';
        ctx.font = '500 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(enemy.label, 0, 0);
      }
      break;

    case 'social': // Social Media Distraction 📱 (Animated phone icon with app notifications!)
      // Phone Body
      ctx.fillStyle = '#2f3542'; // Dark phone casing
      drawRoundRect(ctx, -14, -20, 28, 40, 5);

      // Screen
      ctx.fillStyle = '#54a0ff'; // Bright distracting blue screen
      drawRoundRect(ctx, -12, -16, 24, 32, 2);

      // App notification bubble flashing
      if (Math.floor(tick / 12) % 2 === 0) {
        ctx.fillStyle = '#ff4757'; // Hot red notice circle
        ctx.beginPath();
        ctx.arc(7, -10, 5, 0, Math.PI * 2);
        ctx.fill();
        // Exclamation tag
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', 7, -10);
      }

      // Minimal phone speaker & home button
      ctx.fillStyle = '#ccd1d9';
      ctx.fillRect(-4, -18, 8, 1);
      ctx.beginPath();
      ctx.arc(0, 18, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.restore();
}

// Draw Particles
export function drawParticle(ctx: CanvasRenderingContext2D, part: Particle) {
  ctx.save();
  const opacity = part.life / part.maxLife;
  ctx.fillStyle = part.color;
  ctx.strokeStyle = part.color;

  if (part.shape === 'star') {
    drawVectorStar(ctx, part.x, part.y, 5, part.size, part.size / 2, part.color, part.color);
  } else if (part.shape === 'heart') {
    ctx.globalAlpha = opacity;
    ctx.fillStyle = part.color;
    drawMiniHeart(ctx, part.x, part.y, part.size);
  } else if (part.shape === 'bubble') {
    ctx.strokeStyle = part.color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Normal circle
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Draw Boss Monstrosity: ULTIMATE EXAM STRESS 😈
export function drawBoss(ctx: CanvasRenderingContext2D, boss: BossEntity, tick: number) {
  ctx.save();
  const pulseScale = 1 + Math.sin(tick * 0.12) * 0.08;
  const bx = boss.x + boss.width / 2;
  const by = boss.y + boss.height / 2;

  ctx.translate(bx, by);
  ctx.scale(pulseScale, pulseScale);

  // Dark purplish giant cloud core
  const radius = boss.width / 2.5;
  ctx.fillStyle = 'rgba(44, 44, 84, 0.95)'; // Deep scary color

  // Floating circles to compose a dynamic scary blob shape
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const px = Math.cos(angle) * (radius * 0.4);
    const py = Math.sin(angle) * (radius * 0.4);
    ctx.beginPath();
    ctx.arc(px, py, radius * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw scary neon-pink horns/thorns emerging
  ctx.fillStyle = '#ff9f43';
  ctx.beginPath();
  // Left horn
  ctx.moveTo(-radius * 0.8, -radius * 0.4);
  ctx.quadraticCurveTo(-radius * 1.1, -radius * 0.9, -radius * 0.6, -radius * 1.1);
  ctx.quadraticCurveTo(-radius * 0.4, -radius * 0.8, -radius * 0.4, -radius * 0.4);
  ctx.fill();
  // Right horn
  ctx.beginPath();
  ctx.moveTo(radius * 0.8, -radius * 0.4);
  ctx.quadraticCurveTo(radius * 1.1, -radius * 0.9, radius * 0.6, -radius * 1.1);
  ctx.quadraticCurveTo(radius * 0.4, -radius * 0.8, radius * 0.4, -radius * 0.4);
  ctx.fill();

  // Draw giant angry glowing eyes
  ctx.fillStyle = '#ff3838'; // evil crimson eyes
  ctx.beginPath();
  // Left eye
  ctx.ellipse(-20, -10, 10, 6, -Math.PI / 8, 0, Math.PI * 2);
  // Right eye
  ctx.ellipse(20, -10, 10, 6, Math.PI / 8, 0, Math.PI * 2);
  ctx.fill();

  // White angry pupil highlight
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-18, -10, 2.5, 0, Math.PI * 2);
  ctx.arc(22, -10, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Giant scary grin with sharp teeth
  ctx.fillStyle = '#1e1b29';
  ctx.beginPath();
  ctx.arc(0, 12, 14, 0, Math.PI, false);
  ctx.closePath();
  ctx.fill();

  // Little sharp white teeth triangles
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  // Bottom row teeth
  ctx.moveTo(-8, 12); ctx.lineTo(-6, 17); ctx.lineTo(-4, 12);
  ctx.moveTo(-2, 12); ctx.lineTo(0, 18); ctx.lineTo(2, 12);
  ctx.moveTo(4, 12); ctx.lineTo(6, 17); ctx.lineTo(8, 12);
  ctx.fill();

  // Angry pulsing energy rings radiating from boss
  ctx.strokeStyle = `rgba(255, 107, 129, ${0.15 + Math.sin(tick * 0.15) * 0.1})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, radius * (1.3 + Math.sin(tick * 0.1) * 0.15), 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// Draw Boss Projectiles
export function drawBossProjectile(ctx: CanvasRenderingContext2D, proj: BossProjectile, tick: number) {
  ctx.save();
  if (proj.type === 'stress_orb') {
    // Red aura orbs with tail particles
    const r = proj.size;
    const gradient = ctx.createRadialGradient(proj.x, proj.y, 1, proj.x, proj.y, r);
    gradient.addColorStop(0, '#ff4757');
    gradient.addColorStop(0.5, '#ff6b81');
    gradient.addColorStop(1, 'rgba(255,107,129,0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, r, 0, Math.PI * 2);
    ctx.fill();

    // Spiky outline orbs
    ctx.strokeStyle = '#ff4757';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + tick * 0.08;
      const ox = proj.x + Math.cos(angle) * (r * 0.8);
      const oy = proj.y + Math.sin(angle) * (r * 0.8);
      ctx.lineTo(ox, oy);
    }
    ctx.closePath();
    ctx.stroke();
  } else {
    // doubt boulder: grey chunky circle with negative thoughts symbols inside like "?" or "X"
    ctx.fillStyle = '#4b6584';
    ctx.strokeStyle = '#2f3542';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Crack lines on boulder
    ctx.strokeStyle = '#2f3542';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(proj.x - proj.size / 2, proj.y - proj.size / 4);
    ctx.lineTo(proj.x + proj.size / 3, proj.y + proj.size / 3);
    ctx.moveTo(proj.x - proj.size / 4, proj.y + proj.size / 2);
    ctx.lineTo(proj.x, proj.y - proj.size / 3);
    ctx.stroke();

    // White question mark "?" label centered in it
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', proj.x, proj.y);
  }
  ctx.restore();
}

// Background animated elements
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tick: number,
  stage: string
) {
  // Clear with soft gradient based on game states
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  if (stage === 'boss') {
    grad.addColorStop(0, '#2c2c54'); // Scary dark twilight
    grad.addColorStop(1, '#4b6584');
  } else {
    grad.addColorStop(0, '#f1f2f6'); // Clean cheerful off-white
    grad.addColorStop(1, '#dfe4ea');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle grid patterns
  ctx.strokeStyle = stage === 'boss' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let lx = 0; lx < w; lx += gridSize) {
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx, h);
    ctx.stroke();
  }
  for (let ly = 0; ly < h; ly += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, ly);
    ctx.lineTo(w, ly);
    ctx.stroke();
  }

  // Floating background cute symbols
  const bSymbols = [
    { x: w * 0.15, y: h * 0.15, text: 'A+', size: 14, color: 'rgba(255,107,129,0.18)' },
    { x: w * 0.85, y: h * 0.25, text: '100', size: 12, color: 'rgba(46,204,113,0.16)' },
    { x: w * 0.10, y: h * 0.72, text: '✍️', size: 16, color: 'rgba(0,0,0,0.08)' },
    { x: w * 0.82, y: h * 0.80, text: '🎓', size: 18, color: 'rgba(0,0,0,0.1)' },
    { x: w * 0.45, y: h * 0.12, text: '💡', size: 20, color: 'rgba(255,159,67,0.18)' },
    { x: w * 0.52, y: h * 0.88, text: '📖', size: 15, color: 'rgba(10,189,227,0.15)' },
  ];

  ctx.save();
  bSymbols.forEach((s) => {
    const shift = Math.sin(tick * 0.02 + s.x) * 8;
    ctx.fillStyle = s.color;
    ctx.font = `bold ${s.size}px "JetBrains Mono", sans-serif`;
    ctx.fillText(s.text, s.x, s.y + shift);
  });
  ctx.restore();
}

/**
 * Basic Utility Drawings
 */
function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  drawRoundRectPath(ctx, x, y, w, h, r);
  ctx.fill();
}

function drawRoundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
}

// Complex star geometries for canvas vector stars ⭐
export function drawVectorStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  fillColor: string,
  strokeColor: string
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.save();
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'miter';

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
