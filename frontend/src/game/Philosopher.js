import Phaser from 'phaser';

export default class Philosopher extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, philosopherData) {
    const { id, name, school, position_x, position_y, image } = philosopherData;
    const textureKey = image.replace('.png', '');

    super(scene, position_x, position_y, textureKey);

    this.scene = scene;
    this.dataObj = philosopherData;
    this.id = id;
    this.philosopherName = name;
    this.school = school;
    this.textureKey = textureKey;
    this.currentDirection = 'down';

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // true = static body (immovable)

    // Physics body size (trimmed to feet so player can walk close)
    this.body.setSize(20, 16);
    this.body.setOffset(14, 30);

    // Initial direction and animations
    this.initAnimations(scene);
    this.setFrame(0); // Idle down

    // Depth sorting
    this.setDepth(this.y);

    // Subtle idle floating/breathing animation
    scene.tweens.add({
      targets: this,
      y: position_y - 3,
      duration: 1600 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Custom face image overlay (replaces only the face on top of the character's toga/robe body)
    this.faceImage = philosopherData.face_image || null;
    this.faceOverlay = null;
    if (this.faceImage) {
      this.initFaceOverlay(scene);
    }

    // Create decorative overhead name badge
    this.createNameBadge(scene, position_x, position_y - 34);

    // Interaction pulse indicator circle underneath
    this.pulseCircle = scene.add.circle(position_x, position_y + 14, 22, 0xd4af37, 0.25);
    this.pulseCircle.setDepth(position_y - 1);
    scene.tweens.add({
      targets: this.pulseCircle,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0.08,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  initAnimations(scene) {
    const key = this.textureKey;
    if (scene.anims.exists(`${key}_idle_down`)) return;

    scene.anims.create({
      key: `${key}_idle_down`,
      frames: [{ key, frame: 0 }],
      frameRate: 1,
    });
    scene.anims.create({
      key: `${key}_idle_left`,
      frames: [{ key, frame: 4 }],
      frameRate: 1,
    });
    scene.anims.create({
      key: `${key}_idle_right`,
      frames: [{ key, frame: 8 }],
      frameRate: 1,
    });
    scene.anims.create({
      key: `${key}_idle_up`,
      frames: [{ key, frame: 12 }],
      frameRate: 1,
    });
  }

  createNameBadge(scene, x, y) {
    this.badgeContainer = scene.add.container(x, y);
    this.badgeContainer.setDepth(10000); // Always above sprites

    // Background pill
    const textStr = this.philosopherName;
    const paddingX = 10;
    const paddingY = 4;

    const labelText = scene.add.text(0, 0, textStr, {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '12px',
      color: '#fdf6e2',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const bounds = labelText.getBounds();
    const bgWidth = bounds.width + paddingX * 2;
    const bgHeight = bounds.height + paddingY * 2;

    const bgRect = scene.add.graphics();
    bgRect.fillStyle(0x1a1a24, 0.85);
    bgRect.lineStyle(1.5, 0xd4af37, 0.9);
    bgRect.fillRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 6);
    bgRect.strokeRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 6);

    this.badgeContainer.add([bgRect, labelText]);
  }

  initFaceOverlay(scene) {
    if (!this.faceImage) return;
    const faceKey = `face_tex_${this.id}_${Date.now()}`;

    const createOverlay = () => {
      if (!this.active || !scene || !scene.textures.exists(faceKey)) return;
      if (this.faceOverlay) this.faceOverlay.destroy();
      this.faceOverlay = scene.add.image(this.x, this.y - 7, faceKey);
      this.faceOverlay.setDisplaySize(18, 18);
      this.faceOverlay.setDepth(this.depth + 1);
    };

    if (scene.textures.exists(faceKey)) {
      createOverlay();
    } else if (this.faceImage.startsWith('data:image')) {
      scene.textures.addBase64(faceKey, this.faceImage);
      scene.textures.once(`addtexture-${faceKey}`, () => {
        createOverlay();
      });
    } else {
      scene.load.image(faceKey, this.faceImage);
      scene.load.once(`filecomplete-image-${faceKey}`, () => {
        createOverlay();
      });
      scene.load.start();
    }
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.faceOverlay && this.faceOverlay.active) {
      let ox = 0;
      let oy = -7;
      if (this.currentDirection === 'left') {
        ox = -2;
        this.faceOverlay.setVisible(true);
      } else if (this.currentDirection === 'right') {
        ox = 2;
        this.faceOverlay.setVisible(true);
      } else if (this.currentDirection === 'up') {
        // Back of head, hide face overlay
        this.faceOverlay.setVisible(false);
      } else {
        ox = 0;
        this.faceOverlay.setVisible(true);
      }
      this.faceOverlay.setPosition(this.x + ox, this.y + oy);
      this.faceOverlay.setDepth(this.depth + 1);
    }
  }

  // Turn to face the player when they approach
  faceTarget(targetX, targetY) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;

    let dir = 'down';
    if (Math.abs(dx) > Math.abs(dy)) {
      dir = dx < 0 ? 'left' : 'right';
    } else {
      dir = dy < 0 ? 'up' : 'down';
    }

    if (this.currentDirection !== dir) {
      this.currentDirection = dir;
      this.play(`${this.textureKey}_idle_${dir}`, true);
    }
  }

  resetFacing() {
    if (this.currentDirection !== 'down') {
      this.currentDirection = 'down';
      this.play(`${this.textureKey}_idle_down`, true);
    }
  }

  destroy(fromScene) {
    if (this.faceOverlay) {
      this.faceOverlay.destroy();
      this.faceOverlay = null;
    }
    if (this.badgeContainer) this.badgeContainer.destroy();
    if (this.pulseCircle) this.pulseCircle.destroy();
    super.destroy(fromScene);
  }
}
