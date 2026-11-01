import Phaser from 'phaser';
import Player from './Player';
import Philosopher from './Philosopher';
import InteractionManager from './InteractionManager';
import { EventBus } from './EventBus';
import api from '../services/api';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.worldWidth = 2000;
    this.worldHeight = 1600;
    this.philosophers = [];
  }

  preload() {
    // Load characters (48x48 frames in 192x192 sheets)
    this.load.spritesheet('player', '/assets/characters/player/spritesheet.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet('socrates', '/assets/characters/socrates/spritesheet.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet('plato', '/assets/characters/plato/spritesheet.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet('aristotle', '/assets/characters/aristotle/spritesheet.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet('marcus_aurelius', '/assets/characters/marcus_aurelius/spritesheet.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet('ibad_khan', '/assets/characters/ibad_khan/spritesheet.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet('ali_khan', '/assets/characters/ali_khan/spritesheet.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet('raza_abbass', '/assets/characters/raza_abbass/spritesheet.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet('maam_farah', '/assets/characters/maam_farah/spritesheet.png', {
      frameWidth: 48,
      frameHeight: 48,
    });

    // Load environment assets
    this.load.image('tile_grass', '/assets/environment/tile_grass.png');
    this.load.image('tile_path', '/assets/environment/tile_path.png');
    this.load.image('column', '/assets/environment/column.png');
    this.load.image('fountain', '/assets/environment/fountain.png');
    this.load.image('olive_tree', '/assets/environment/olive_tree.png');
    this.load.image('cypress_tree', '/assets/environment/cypress_tree.png');
    this.load.image('bench', '/assets/environment/bench.png');
    this.load.image('amphora', '/assets/environment/amphora.png');
    this.load.image('temple_ruin', '/assets/environment/temple_ruin.png');
    this.load.image('statue_bust', '/assets/environment/statue_bust.png');
  }

  create() {
    // Set physics bounds
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // 1. Base terrain: Lush Greek garden grass
    this.add.tileSprite(
      this.worldWidth / 2,
      this.worldHeight / 2,
      this.worldWidth,
      this.worldHeight,
      'tile_grass'
    ).setDepth(0);

    // 2. Build Stone Pathways connecting the 4 philosophical sanctuaries
    this.buildStonePathways();

    // 3. Static Obstacle Physics Group for collisions
    this.obstacles = this.physics.add.staticGroup();

    // 4. Build Environment Features & Greek Architecture
    this.buildEnvironment();

    // 5. Spawn Player at Central Crossroads (open pathway south of the central fountain)
    this.player = new Player(this, 920, 830);

    // 6. 8 Legendary & Contemporary Philosophers Metadata
    const defaultPhilosophers = [
      { id: 1, name: 'Socrates', school: 'Classical Greek Philosophy', position_x: 420, position_y: 420, image: 'socrates.png', years: 'c. 470 – 399 BCE', description: 'Ancient Athenian philosopher regarded as one of the founders of Western philosophy. He developed the Socratic Method—inquiry through disciplined dialogue and rigorous questioning of presuppositions.' },
      { id: 2, name: 'Plato', school: 'Platonism & Idealism', position_x: 1200, position_y: 360, image: 'plato.png', years: 'c. 428 – 348 BCE', description: 'Athenian philosopher, student of Socrates, and founder of the Academy in Athens—the first institution of higher learning in the Western world.' },
      { id: 3, name: 'Aristotle', school: 'Peripatetic & Virtue Ethics', position_x: 1380, position_y: 980, image: 'aristotle.png', years: '384 – 322 BCE', description: 'Ancient Greek polymath and founder of the Peripatetic school of philosophy at the Lyceum. Student of Plato and tutor to Alexander the Great.' },
      { id: 4, name: 'Marcus Aurelius', school: 'Stoicism', position_x: 560, position_y: 1050, image: 'marcus_aurelius.png', years: '121 – 180 CE', description: 'Roman Emperor from 161 to 180 CE and Stoic philosopher. His private philosophical journal, known as Meditations, recorded personal reflections on resilience and duty.' },
      { id: 5, name: 'Ibad Khan', school: 'Existential LARPism', position_x: 240, position_y: 800, image: 'ibad_khan.png', years: 'Contemporary Era', description: 'Contemporary speculative thinker probing the boundaries of identity, persona, and existential agency. Forefather of the Modern LARPist movement.' },
      { id: 6, name: 'Ali Khan', school: 'Late-Night Gastronomy', position_x: 1600, position_y: 520, image: 'ali_khan.png', years: 'Contemporary Era', description: 'Nocturnal culinary philosopher celebrated for his pragmatic dietary chronobiology. He posits that time itself dissolves under the sacred call of late-night feasting.' },
      { id: 7, name: 'Raza Abbass', school: 'Cybernetic Dialectics', position_x: 780, position_y: 1320, image: 'raza_abbass.png', years: 'Contemporary Era', description: 'Technological philosopher and acute observer of synthetic intelligence. Known for his candid vernacular critiques of artificial language models and digital trickery.' },
      { id: 8, name: "Ma'am Farah", school: 'Academic Punctuality', position_x: 920, position_y: 180, image: 'maam_farah.png', years: 'Contemporary Era', description: 'Esteemed guardian of academic rigor, punctuality, and scholastic discipline. Legend holds that the cosmic ledger of attendance closes irrevocably ten minutes past the eighth hour.' },
    ];

    // 7. Instantiate Philosopher NPCs immediately in a static physics group
    this.philosophersGroup = this.physics.add.staticGroup();
    this.philosophers = [];

    for (const pData of defaultPhilosophers) {
      const pSprite = new Philosopher(this, pData);
      this.philosophers.push(pSprite);
      this.philosophersGroup.add(pSprite);
    }

    // 8. Add Collisions
    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.collider(this.player, this.philosophersGroup);

    // 9. Camera setup: Follow player smoothly within world bounds
    const camera = this.cameras.main;
    camera.setBounds(0, 0, this.worldWidth, this.worldHeight);
    camera.startFollow(this.player, true, 0.1, 0.1);

    // 10. Initialize Interaction Manager immediately
    this.interactionManager = new InteractionManager(this, this.player, this.philosophers);

    // Notify React that the scene is initialized with philosopher list
    EventBus.emit('scene-ready', {
      philosophers: defaultPhilosophers,
      worldWidth: this.worldWidth,
      worldHeight: this.worldHeight,
    });

    // Sync from backend API on start
    api.getPhilosophers().then((apiPhilosophers) => {
      if (apiPhilosophers && apiPhilosophers.length > 0) {
        this.rebuildPhilosophers(apiPhilosophers);
        EventBus.emit('scene-ready', {
          philosophers: apiPhilosophers,
          worldWidth: this.worldWidth,
          worldHeight: this.worldHeight,
        });
      }
    }).catch(() => {});

    // Support teleport/focus from UI
    this.cleanBusFocus = EventBus.on('teleport-to-philosopher', ({ x, y }) => {
      if (this.player) {
        this.player.setPosition(x, y + 40);
      }
    });

    // Support live updates from Admin Panel
    this.cleanAdminDataChanged = EventBus.on('admin-data-changed', async () => {
      try {
        const updatedList = await api.getPhilosophers();
        if (updatedList && updatedList.length > 0) {
          this.rebuildPhilosophers(updatedList);
          EventBus.emit('scene-ready', {
            philosophers: updatedList,
            worldWidth: this.worldWidth,
            worldHeight: this.worldHeight,
          });
        }
      } catch (err) {
        console.warn('Failed to live-update philosophers in GameScene:', err);
      }
    });

    // Emit initial player position for MiniMap
    EventBus.emit('player-moved', {
      x: this.player.x,
      y: this.player.y,
      worldWidth: this.worldWidth,
      worldHeight: this.worldHeight,
    });

    this.minimapTick = 0;
  }

  buildStonePathways() {
    const pathGroup = this.add.group();

    const drawPathRect = (x, y, w, h) => {
      const tile = this.add.tileSprite(x + w / 2, y + h / 2, w, h, 'tile_path');
      tile.setDepth(1);
      pathGroup.add(tile);
    };

    // Central Plaza ring / courtyard
    drawPathRect(800, 600, 240, 240);

    // Main Horizontal Corridor: Agora (West) <-> Center <-> Lyceum (East)
    drawPathRect(380, 680, 1100, 80);

    // Main Vertical Corridor: Academy (North) <-> Center <-> Stoic Garden (South)
    drawPathRect(880, 300, 80, 850);

    // Diagonal/Connecting Pathways:
    // Path to Socrates (420, 420)
    drawPathRect(380, 420, 80, 260);

    // Path to Plato's Academy (1200, 360)
    drawPathRect(880, 360, 380, 80);

    // Path to Aristotle's Lyceum (1380, 980)
    drawPathRect(1340, 760, 80, 300);

    // Path to Marcus Aurelius (560, 1050)
    drawPathRect(520, 760, 80, 360);
    drawPathRect(520, 1050, 360, 80);

    // Path to Ibad Khan (240, 800) - Western Terrace
    drawPathRect(200, 740, 190, 80);
    drawPathRect(200, 780, 80, 100);

    // Path to Ali Khan (1600, 520) - Eastern Dining Pergola
    drawPathRect(1440, 680, 180, 80);
    drawPathRect(1560, 480, 80, 240);

    // Path to Raza Abbass (780, 1320) - Cybernetic Garden
    drawPathRect(880, 1150, 80, 180);
    drawPathRect(740, 1280, 180, 80);

    // Path to Ma'am Farah (920, 180) - North Academy Portal
    drawPathRect(880, 140, 80, 170);
  }

  buildEnvironment() {
    // Helper to add obstacle with custom collision box
    const addObstacle = (key, x, y, bodyW, bodyH, offsetX, offsetY) => {
      const sprite = this.obstacles.create(x, y, key);
      sprite.setDepth(y);
      if (bodyW && bodyH) {
        sprite.body.setSize(bodyW, bodyH);
        sprite.body.setOffset(offsetX || 0, offsetY || 0);
      }
      return sprite;
    };

    // ----------------------------------------------------
    // Zone 1: Central Crossroads Plaza (920, 720)
    // ----------------------------------------------------
    // Grand Central Fountain
    addObstacle('fountain', 920, 700, 70, 40, 13, 48);

    // Plaza Benches
    addObstacle('bench', 840, 640, 52, 20, 6, 16);
    addObstacle('bench', 1000, 640, 52, 20, 6, 16);
    addObstacle('bench', 840, 770, 52, 20, 6, 16);
    addObstacle('bench', 1000, 770, 52, 20, 6, 16);

    // Corner Statue Busts & Columns
    addObstacle('statue_bust', 810, 610, 24, 20, 6, 32);
    addObstacle('statue_bust', 1030, 610, 24, 20, 6, 32);
    addObstacle('column', 800, 810, 30, 20, 9, 72);
    addObstacle('column', 1040, 810, 30, 20, 9, 72);

    // ----------------------------------------------------
    // Zone 2: Socrates' Olive Grove & Athenian Agora (NW: ~420, 420)
    // ----------------------------------------------------
    // Surrounding gnarled olive trees (spread out comfortably)
    addObstacle('olive_tree', 280, 320, 45, 30, 25, 78);
    addObstacle('olive_tree', 560, 310, 45, 30, 25, 78);
    addObstacle('olive_tree', 290, 520, 45, 30, 25, 78);
    addObstacle('olive_tree', 560, 520, 45, 30, 25, 78);
    addObstacle('olive_tree', 190, 420, 45, 30, 25, 78);

    // Agora Amphorae & Stone benches (ample clearing around Socrates at 420, 420)
    addObstacle('bench', 320, 420, 52, 20, 6, 16);
    addObstacle('amphora', 510, 360, 22, 18, 5, 26);
    addObstacle('amphora', 510, 470, 22, 18, 5, 26);
    addObstacle('statue_bust', 320, 490, 24, 20, 6, 32);

    // ----------------------------------------------------
    // Zone 3: Plato's Academy & Ruined Temple Sanctuary (NE: ~1200, 360)
    // ----------------------------------------------------
    // Grand Ruined Temple Portico (well above Plato at 1200, 360)
    addObstacle('temple_ruin', 1200, 250, 130, 40, 15, 75);

    // Colonnade leading to temple (wide corridor for Plato)
    addObstacle('column', 1050, 330, 30, 20, 9, 72);
    addObstacle('column', 1050, 430, 30, 20, 9, 72);
    addObstacle('column', 1350, 330, 30, 20, 9, 72);
    addObstacle('column', 1350, 430, 30, 20, 9, 72);

    // Classical Cypress Trees framing the Academy
    addObstacle('cypress_tree', 990, 260, 24, 22, 12, 94);
    addObstacle('cypress_tree', 1410, 260, 24, 22, 12, 94);
    addObstacle('cypress_tree', 970, 370, 24, 22, 12, 94);
    addObstacle('cypress_tree', 1430, 370, 24, 22, 12, 94);

    // Contemplation benches
    addObstacle('bench', 1080, 470, 52, 20, 6, 16);
    addObstacle('bench', 1320, 470, 52, 20, 6, 16);

    // ----------------------------------------------------
    // Zone 4: Aristotle's Lyceum & Peripatetic Walk (SE: ~1380, 980)
    // ----------------------------------------------------
    // Tiered fountain of natural philosophy (above Aristotle)
    addObstacle('fountain', 1380, 860, 70, 40, 13, 48);

    // Peripatetic garden trees
    addObstacle('olive_tree', 1240, 900, 45, 30, 25, 78);
    addObstacle('olive_tree', 1520, 900, 45, 30, 25, 78);
    addObstacle('cypress_tree', 1240, 1080, 24, 22, 12, 94);
    addObstacle('cypress_tree', 1520, 1080, 24, 22, 12, 94);
    addObstacle('cypress_tree', 1380, 1160, 24, 22, 12, 94);

    // Reading benches and scholar amphorae (clear of Aristotle at 1380, 980)
    addObstacle('bench', 1270, 980, 52, 20, 6, 16);
    addObstacle('bench', 1490, 980, 52, 20, 6, 16);
    addObstacle('amphora', 1310, 1040, 22, 18, 5, 26);
    addObstacle('statue_bust', 1450, 1040, 24, 20, 6, 32);

    // ----------------------------------------------------
    // Zone 5: Marcus Aurelius's Imperial Stoic Courtyard (SW: ~560, 1050)
    // ----------------------------------------------------
    // Colonnade of Stoic Tranquility (generous space around 560, 1050)
    addObstacle('column', 440, 960, 30, 20, 9, 72);
    addObstacle('column', 440, 1050, 30, 20, 9, 72);
    addObstacle('column', 440, 1140, 30, 20, 9, 72);
    addObstacle('column', 680, 960, 30, 20, 9, 72);
    addObstacle('column', 680, 1050, 30, 20, 9, 72);
    addObstacle('column', 680, 1140, 30, 20, 9, 72);

    // Imperial garden cypress & olive trees
    addObstacle('cypress_tree', 370, 1000, 24, 22, 12, 94);
    addObstacle('cypress_tree', 370, 1120, 24, 22, 12, 94);
    addObstacle('olive_tree', 560, 910, 45, 30, 25, 78);
    addObstacle('olive_tree', 560, 1190, 45, 30, 25, 78);

    // Stoic benches & Emperor statue bust
    addObstacle('bench', 480, 1050, 52, 20, 6, 16);
    addObstacle('bench', 640, 1050, 52, 20, 6, 16);
    addObstacle('statue_bust', 560, 970, 24, 20, 6, 32);
    addObstacle('amphora', 640, 990, 22, 18, 5, 26);

    // ----------------------------------------------------
    // Zone 6: Ibad Khan's Western LARP Grove (~240, 800)
    // ----------------------------------------------------
    addObstacle('bench', 170, 800, 52, 20, 6, 16);
    addObstacle('amphora', 310, 800, 22, 18, 5, 26);
    addObstacle('olive_tree', 150, 710, 45, 30, 25, 78);
    addObstacle('olive_tree', 150, 890, 45, 30, 25, 78);

    // ----------------------------------------------------
    // Zone 7: Ali Khan's Nocturnal Dining Pergola (~1600, 520)
    // ----------------------------------------------------
    addObstacle('bench', 1530, 520, 52, 20, 6, 16);
    addObstacle('bench', 1670, 520, 52, 20, 6, 16);
    addObstacle('column', 1600, 440, 30, 20, 9, 72);
    addObstacle('amphora', 1600, 600, 22, 18, 5, 26);

    // ----------------------------------------------------
    // Zone 8: Raza Abbass's Cybernetic Dialectics Courtyard (~780, 1320)
    // ----------------------------------------------------
    addObstacle('bench', 710, 1320, 52, 20, 6, 16);
    addObstacle('statue_bust', 850, 1320, 24, 20, 6, 32);
    addObstacle('column', 780, 1240, 30, 20, 9, 72);
    addObstacle('column', 780, 1400, 30, 20, 9, 72);

    // ----------------------------------------------------
    // Zone 9: Ma'am Farah's North Punctuality Portal (~920, 180)
    // ----------------------------------------------------
    addObstacle('column', 850, 180, 30, 20, 9, 72);
    addObstacle('column', 990, 180, 30, 20, 9, 72);
    addObstacle('statue_bust', 850, 120, 24, 20, 6, 32);
    addObstacle('statue_bust', 990, 120, 24, 20, 6, 32);

    // World Boundary Framing Trees (Cypress trees around the perimeter)
    for (let x = 60; x < this.worldWidth; x += 180) {
      addObstacle('cypress_tree', x, 60, 24, 22, 12, 94);
      addObstacle('cypress_tree', x, this.worldHeight - 60, 24, 22, 12, 94);
    }
    for (let y = 140; y < this.worldHeight - 100; y += 180) {
      addObstacle('cypress_tree', 60, y, 24, 22, 12, 94);
      addObstacle('cypress_tree', this.worldWidth - 60, y, 24, 22, 12, 94);
    }
  }

  update(time, delta) {
    if (this.player) {
      this.player.update(time, delta);
    }

    if (this.interactionManager) {
      this.interactionManager.update();
    }

    // Periodic player position emission for Minimap
    this.minimapTick = (this.minimapTick || 0) + delta;
    if (this.minimapTick > 40 && this.player) {
      this.minimapTick = 0;
      EventBus.emit('player-moved', {
        x: this.player.x,
        y: this.player.y,
        worldWidth: this.worldWidth,
        worldHeight: this.worldHeight,
      });
    }
  }

  rebuildPhilosophers(philosophersList) {
    if (!philosophersList) return;

    const existingMap = new Map();
    if (this.philosophers) {
      for (const p of this.philosophers) {
        if (p && p.active) {
          existingMap.set(p.id, p);
        }
      }
    }

    const nextPhilosophers = [];
    const incomingIds = new Set();

    for (const pData of philosophersList) {
      incomingIds.add(pData.id);
      const existing = existingMap.get(pData.id);

      if (existing && existing.active) {
        // Philosopher already exists: update name, badge, position, and face cleanly in-place
        existing.updateData(pData);
        nextPhilosophers.push(existing);
      } else {
        // New philosopher created: instantiate sprite
        const textureKey = (pData.image || 'socrates.png').replace('.png', '');
        const safeImage = this.textures.exists(textureKey) ? pData.image : 'socrates.png';
        const safeData = { ...pData, image: safeImage };
        const pSprite = new Philosopher(this, safeData);
        nextPhilosophers.push(pSprite);
        if (this.philosophersGroup) {
          this.philosophersGroup.add(pSprite);
        }
      }
    }

    // Safely remove any philosopher that was deleted
    for (const [id, p] of existingMap.entries()) {
      if (!incomingIds.has(id)) {
        if (this.philosophersGroup) {
          this.philosophersGroup.remove(p, true, true);
        }
        if (p && p.destroy) {
          p.destroy();
        }
      }
    }

    this.philosophers = nextPhilosophers;

    if (this.interactionManager) {
      this.interactionManager.philosophers = this.philosophers;
      this.interactionManager.preloadWisdom();
    }
  }

  destroy() {
    if (this.cleanBusFocus) this.cleanBusFocus();
    if (this.cleanAdminDataChanged) this.cleanAdminDataChanged();
    if (this.interactionManager) this.interactionManager.destroy();
  }
}
