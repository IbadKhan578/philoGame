import Phaser from 'phaser';
import soundManager from '../services/audio';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics body configuration
    // Adjust collision box to feet area for natural depth sorting
    this.body.setSize(24, 18);
    this.body.setOffset(12, 30);
    this.setCollideWorldBounds(true);

    this.speed = 170;
    this.lastDirection = 'down';
    this.isMoving = false;
    this.stepTimer = 0;

    // Immediately establish proper depth
    this.setDepth(this.y);

    // Glowing explorer aura underneath player's feet
    this.aura = scene.add.circle(x, y + 16, 20, 0x00f0ff, 0.28);
    this.aura.setDepth(this.y - 1);
    scene.tweens.add({
      targets: this.aura,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0.12,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Distinct overhead player badge so the user is instantly recognizable on screen
    this.nameBadge = scene.add.container(x, y - 32);
    this.nameBadge.setDepth(10001);

    const badgeLabel = scene.add.text(0, 0, '✦ Explorer (You) ✦', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '11px',
      color: '#00f0ff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const bounds = badgeLabel.getBounds();
    const bgW = bounds.width + 16;
    const bgH = bounds.height + 6;

    const bgGraphics = scene.add.graphics();
    bgGraphics.fillStyle(0x0f172a, 0.88);
    bgGraphics.lineStyle(1.5, 0x00f0ff, 0.9);
    bgGraphics.fillRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 5);
    bgGraphics.strokeRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 5);

    this.nameBadge.add([bgGraphics, badgeLabel]);

    // Setup input cursors and WASD keys
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    this.initAnimations(scene);
    this.play('player_idle_down');
  }

  initAnimations(scene) {
    if (scene.anims.exists('player_walk_down')) return;

    // Down
    scene.anims.create({
      key: 'player_idle_down',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 1,
    });
    scene.anims.create({
      key: 'player_walk_down',
      frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    // Left
    scene.anims.create({
      key: 'player_idle_left',
      frames: [{ key: 'player', frame: 4 }],
      frameRate: 1,
    });
    scene.anims.create({
      key: 'player_walk_left',
      frames: scene.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });

    // Right
    scene.anims.create({
      key: 'player_idle_right',
      frames: [{ key: 'player', frame: 8 }],
      frameRate: 1,
    });
    scene.anims.create({
      key: 'player_walk_right',
      frames: scene.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
      frameRate: 8,
      repeat: -1,
    });

    // Up
    scene.anims.create({
      key: 'player_idle_up',
      frames: [{ key: 'player', frame: 12 }],
      frameRate: 1,
    });
    scene.anims.create({
      key: 'player_walk_up',
      frames: scene.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
      frameRate: 8,
      repeat: -1,
    });
  }

  update(time, delta) {
    // Movement handling
    let vx = 0;
    let vy = 0;

    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      const length = Math.SQRT2;
      vx /= length;
      vy /= length;
    }

    this.body.setVelocity(vx * this.speed, vy * this.speed);

    // Depth sorting based on Y position
    this.setDepth(this.y);

    // Update glowing aura and overhead name badge positions
    if (this.aura) {
      this.aura.setPosition(this.x, this.y + 16);
      this.aura.setDepth(this.y - 1);
    }
    if (this.nameBadge) {
      this.nameBadge.setPosition(this.x, this.y - 32);
    }

    // Animation & Direction handling
    const isMovingNow = vx !== 0 || vy !== 0;

    if (isMovingNow) {
      if (Math.abs(vx) > Math.abs(vy)) {
        if (vx < 0) {
          this.lastDirection = 'left';
          this.play('player_walk_left', true);
        } else {
          this.lastDirection = 'right';
          this.play('player_walk_right', true);
        }
      } else {
        if (vy < 0) {
          this.lastDirection = 'up';
          this.play('player_walk_up', true);
        } else {
          this.lastDirection = 'down';
          this.play('player_walk_down', true);
        }
      }

      // Footstep sound cadence (~every 320ms while moving)
      this.stepTimer += delta;
      if (this.stepTimer > 320) {
        soundManager.playFootstep();
        this.stepTimer = 0;
      }
    } else {
      this.play(`player_idle_${this.lastDirection}`, true);
      this.stepTimer = 260; // Ready for next step immediately upon starting
    }

    this.isMoving = isMovingNow;
  }

  destroy(fromScene) {
    if (this.aura) this.aura.destroy();
    if (this.nameBadge) this.nameBadge.destroy();
    super.destroy(fromScene);
  }
}
