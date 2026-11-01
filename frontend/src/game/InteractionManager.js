import { EventBus } from './EventBus';
import api from '../services/api';
import soundManager from '../services/audio';

const INITIAL_WISDOM = {
  1: {
    id: 1,
    philosopher_id: 1,
    philosopher_name: 'Socrates',
    quote: 'The unexamined life is not worth living.',
    explanation: "True human fulfillment requires self-reflection and questioning one's own assumptions rather than living in passive acceptance of conventions.",
    source: 'Plato, Apology 38a',
  },
  2: {
    id: 12,
    philosopher_id: 2,
    philosopher_name: 'Plato',
    quote: 'The beginning is the most important part of the work.',
    explanation: 'Foundational habits, premises, and early education shape the entire trajectory of all human endeavors.',
    source: 'Plato, Republic Book II, 377b',
  },
  3: {
    id: 23,
    philosopher_id: 3,
    philosopher_name: 'Aristotle',
    quote: 'Knowing yourself is the beginning of all wisdom.',
    explanation: "Accurate self-appraisal of one's faculties, desires, and vices provides the essential basis for ethical cultivation.",
    source: 'Aristotle, Eudemian Ethics',
  },
  4: {
    id: 34,
    philosopher_id: 4,
    philosopher_name: 'Marcus Aurelius',
    quote: 'You have power over your mind - not outside events. Realize this, and you will find strength.',
    explanation: 'The dichotomy of control: we cannot control external circumstances, but we retain total dominion over our judgments and reactions.',
    source: 'Marcus Aurelius, Meditations Book IV',
  },
  5: {
    id: 45,
    philosopher_id: 5,
    philosopher_name: 'Ibad Khan',
    quote: 'I larp, therefore i am.',
    explanation: 'An existential inversion of Descartes: in the modern digital and social matrix, authentic being is discovered through the roles and narratives one consciously embodies.',
    source: 'Ibad Khan, Meditations on the Persona (2024)',
  },
  6: {
    id: 48,
    philosopher_id: 6,
    philosopher_name: 'Ali Khan',
    quote: 'Anything after 9 is for dinner.',
    explanation: 'A profound challenge to rigid societal schedules: true nourishment and conviviality thrive when daytime demands yield to nocturnal appetite.',
    source: 'Ali Khan, The Nocturnal Banquet (2024)',
  },
  7: {
    id: 51,
    philosopher_id: 7,
    philosopher_name: 'Raza Abbass',
    quote: 'yr claude boht harami cheez hy',
    explanation: "A colloquially brilliant, affectionate recognition of Claude's uncanny intellect, sharp wit, and astonishing computational wizardry.",
    source: 'Raza Abbass, Dialectics of Machine Deception (2024)',
  },
  8: {
    id: 54,
    philosopher_id: 8,
    philosopher_name: "Ma'am Farah",
    quote: 'jo 8:10 k bad class m ayega ausko attendence nh milegi',
    explanation: 'The immutable law of the classroom: punctuality is the foundation of respect, character, and scholastic excellence; grace expires precisely at 8:10.',
    source: "Ma'am Farah, Principles of Academic Discipline (2024)",
  },
};

export default class InteractionManager {
  constructor(scene, player, philosophers) {
    this.scene = scene;
    this.player = player;
    this.philosophers = philosophers;

    // Generous proximity radii with hysteresis
    this.enterRadius = 155;
    this.leaveRadius = 195;

    this.activePhilosopher = null;
    this.state = 'IDLE'; // 'IDLE' | 'LOADING_WISDOM' | 'SHOWING_WISDOM'

    // Initialize cache with default wisdom so there is 0ms delay on first approach
    this.wisdomCache = new Map(Object.entries(INITIAL_WISDOM).map(([k, v]) => [Number(k), v]));
    this.lastWisdomMap = new Map();
    this.currentWisdom = null;
    this.pendingRequestId = 0;

    // Preload random fresh wisdom from SQLite backend
    this.preloadWisdom();

    // Listen to E key for opening the full dialogue modal
    this.eKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.eKey.on('down', () => {
      if (this.activePhilosopher && this.currentWisdom) {
        soundManager.playPop();
        EventBus.emit('open-philosopher-modal', {
          philosopher: this.activePhilosopher.dataObj,
          wisdom: this.currentWisdom,
        });
      }
    });

    // Listen to modal request to fetch another wisdom entry
    this.cleanBusRefresh = EventBus.on('request-another-wisdom', async ({ philosopherId }) => {
      await this.discoverAnotherWisdom(philosopherId);
    });

    // Listen to admin panel changes to refresh cache
    this.cleanAdminDataChanged = EventBus.on('admin-data-changed', async () => {
      this.wisdomCache.clear();
      this.lastWisdomMap.clear();
      await this.preloadWisdom();
    });
  }

  async preloadWisdom() {
    if (!this.philosophers || this.philosophers.length === 0) return;
    for (const p of this.philosophers) {
      const pid = p.id || p.dataObj?.id;
      if (!pid) continue;
      try {
        const wisdom = await api.getRandomWisdom(pid);
        if (wisdom && wisdom.quote) {
          this.wisdomCache.set(pid, wisdom);
        }
      } catch (err) {
        console.warn(`Preload wisdom note for philosopher ${pid}:`, err?.message || err);
      }
    }
  }

  update() {
    if (!this.player || !this.philosophers || this.philosophers.length === 0) return;

    // Check distance to active philosopher with hysteresis
    if (this.activePhilosopher) {
      const activeDist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.activePhilosopher.x,
        this.activePhilosopher.y
      );

      // If still within leave radius, maintain interaction
      if (activeDist <= this.leaveRadius) {
        this.activePhilosopher.faceTarget(this.player.x, this.player.y);

        const camera = this.scene.cameras.main;
        const screenX = (this.activePhilosopher.x - camera.scrollX) * camera.zoom;
        const screenY = (this.activePhilosopher.y - camera.scrollY) * camera.zoom;

        EventBus.emit('proximity-update-position', {
          philosopherId: this.activePhilosopher.id,
          screenX,
          screenY,
        });
        return;
      } else {
        // Exited leave radius: hide thought cloud and reset
        this.exitActiveProximity();
      }
    }

    // If no active philosopher, search for nearest within enterRadius
    let nearest = null;
    let minDistance = Infinity;

    for (const p of this.philosophers) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y);
      if (dist <= this.enterRadius && dist < minDistance) {
        minDistance = dist;
        nearest = p;
      }
    }

    if (nearest && nearest !== this.activePhilosopher) {
      this.enterActiveProximity(nearest);
    }
  }

  async enterActiveProximity(philosopher) {
    this.activePhilosopher = philosopher;
    philosopher.faceTarget(this.player.x, this.player.y);

    const camera = this.scene.cameras.main;
    const screenX = (philosopher.x - camera.scrollX) * camera.zoom;
    const screenY = (philosopher.y - camera.scrollY) * camera.zoom;

    const philosopherId = philosopher.id || philosopher.dataObj?.id;
    const lastId = this.lastWisdomMap.get(philosopherId) || null;

    // Check if we have cached wisdom
    const cached = this.wisdomCache.get(philosopherId) || INITIAL_WISDOM[philosopherId] || null;

    if (cached && cached.quote) {
      this.currentWisdom = cached;
      if (cached.id) {
        this.lastWisdomMap.set(philosopherId, cached.id);
      }
      this.state = 'SHOWING_WISDOM';

      EventBus.emit('proximity-enter', {
        philosopher: philosopher.dataObj,
        screenX,
        screenY,
        worldX: philosopher.x,
        worldY: philosopher.y,
        isLoading: false,
      });

      EventBus.emit('proximity-wisdom-ready', {
        philosopher: philosopher.dataObj,
        wisdom: cached,
        screenX,
        screenY,
      });

      // Background fetch fresh wisdom from FastAPI SQLite for subsequent visits
      if (cached.id) {
        api.getRandomWisdom(philosopherId, cached.id).then((fresh) => {
          if (fresh && fresh.quote) this.wisdomCache.set(philosopherId, fresh);
        }).catch(() => {});
      }
    } else {
      // Not yet in cache: Show loading state, then fetch from API immediately!
      this.state = 'LOADING_WISDOM';

      EventBus.emit('proximity-enter', {
        philosopher: philosopher.dataObj,
        screenX,
        screenY,
        worldX: philosopher.x,
        worldY: philosopher.y,
        isLoading: true,
      });

      try {
        const freshWisdom = await api.getRandomWisdom(philosopherId, lastId);
        if (freshWisdom && freshWisdom.quote) {
          this.currentWisdom = freshWisdom;
          if (freshWisdom.id) {
            this.lastWisdomMap.set(philosopherId, freshWisdom.id);
          }
          this.wisdomCache.set(philosopherId, freshWisdom);
          this.state = 'SHOWING_WISDOM';

          EventBus.emit('proximity-wisdom-ready', {
            philosopher: philosopher.dataObj,
            wisdom: freshWisdom,
            screenX,
            screenY,
          });
        } else {
          throw new Error('No wisdom found');
        }
      } catch (err) {
        console.warn(`Could not fetch wisdom for philosopher ${philosopherId}:`, err);
        // Fallback: If no quote found in DB or network error, show philosopher description as wisdom
        const fallback = {
          id: -philosopherId,
          philosopher_id: philosopherId,
          philosopher_name: philosopher.philosopherName || philosopher.dataObj?.name || 'Philosopher',
          quote: philosopher.dataObj?.description || 'Wisdom begins in wonder and reflection.',
          explanation: philosopher.dataObj?.school || 'Philosophy of Life',
          source: philosopher.philosopherName || philosopher.dataObj?.name || 'Contemporary Thinker',
        };
        this.currentWisdom = fallback;
        this.state = 'SHOWING_WISDOM';

        EventBus.emit('proximity-wisdom-ready', {
          philosopher: philosopher.dataObj,
          wisdom: fallback,
          screenX,
          screenY,
        });
      }
    }
  }

  exitActiveProximity() {
    if (!this.activePhilosopher) return;

    const prev = this.activePhilosopher;
    prev.resetFacing();

    const prevId = prev.id;
    this.activePhilosopher = null;
    this.state = 'IDLE';
    this.currentWisdom = null;
    this.pendingRequestId++;

    EventBus.emit('proximity-leave', { philosopherId: prevId });
  }

  async discoverAnotherWisdom(philosopherId) {
    const lastId = this.lastWisdomMap.get(philosopherId) || null;
    try {
      const wisdom = await api.getRandomWisdom(philosopherId, lastId);
      if (wisdom && wisdom.quote) {
        this.currentWisdom = wisdom;
        if (wisdom.id) {
          this.lastWisdomMap.set(philosopherId, wisdom.id);
        }
        this.wisdomCache.set(philosopherId, wisdom);

        EventBus.emit('wisdom-refreshed', {
          philosopherId,
          wisdom,
        });
      }
    } catch (err) {
      console.error('Failed to discover another wisdom:', err);
    }
  }

  destroy() {
    if (this.cleanBusRefresh) this.cleanBusRefresh();
    if (this.cleanAdminDataChanged) this.cleanAdminDataChanged();
    this.philosophers = [];
    this.activePhilosopher = null;
  }
}
