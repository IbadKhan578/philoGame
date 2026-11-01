import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import SpeechBubble from './components/SpeechBubble';
import PhilosopherModal from './components/PhilosopherModal';
import MiniMap from './components/MiniMap';
import WisdomJournal from './components/WisdomJournal';
import MainMenu from './components/MainMenu';
import HUD from './components/HUD';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import api from './services/api';
import { EventBus } from './game/EventBus';
import soundManager from './services/audio';
import './App.css';

export default function App() {
  const [inGame, setInGame] = useState(false);
  const [philosophers, setPhilosophers] = useState([]);
  const [activeProximity, setActiveProximity] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, philosopher: null, wisdom: null });
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [discoveredQuotes, setDiscoveredQuotes] = useState([]);
  const [isMuted, setIsMuted] = useState(false);

  // Admin Portal State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Setup EventBus subscriptions
  useEffect(() => {
    // 1. Scene ready with philosophers list
    const cleanSceneReady = EventBus.on('scene-ready', (data) => {
      if (data.philosophers) {
        setPhilosophers(data.philosophers);
      }
    });

    // 2. Proximity Enter
    const cleanProximityEnter = EventBus.on('proximity-enter', (data) => {
      setActiveProximity({
        philosopher: data.philosopher,
        wisdom: null,
        screenX: data.screenX,
        screenY: data.screenY,
        isLoading: data.isLoading !== undefined ? data.isLoading : true,
      });
    });

    // 3. Update coordinates while following
    const cleanPositionUpdate = EventBus.on('proximity-update-position', (data) => {
      setActiveProximity((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          screenX: data.screenX,
          screenY: data.screenY,
        };
      });
    });

    // 4. Wisdom fetched from FastAPI backend SQLite
    const cleanWisdomReady = EventBus.on('proximity-wisdom-ready', (data) => {
      setActiveProximity((prev) => {
        const philosopher = data.philosopher || prev?.philosopher;
        const screenX = data.screenX !== undefined ? data.screenX : (prev?.screenX ?? window.innerWidth / 2);
        const screenY = data.screenY !== undefined ? data.screenY : (prev?.screenY ?? window.innerHeight / 2);
        return {
          philosopher,
          wisdom: data.wisdom,
          screenX,
          screenY,
          isLoading: false,
        };
      });

      // Add to discovered quotes collection
      if (data.wisdom && data.wisdom.id > 0) {
        setDiscoveredQuotes((prev) => {
          const exists = prev.some((item) => item.id === data.wisdom.id);
          if (!exists) {
            return [...prev, data.wisdom];
          }
          return prev;
        });
      }
    });

    // 5. Proximity Leave
    const cleanProximityLeave = EventBus.on('proximity-leave', () => {
      setActiveProximity(null);
    });

    // 6. Open Deep Dialogue Modal (Press E)
    const cleanOpenModal = EventBus.on('open-philosopher-modal', (data) => {
      setModalState({
        isOpen: true,
        philosopher: data.philosopher,
        wisdom: data.wisdom,
      });
    });

    return () => {
      cleanSceneReady();
      cleanProximityEnter();
      cleanPositionUpdate();
      cleanWisdomReady();
      cleanProximityLeave();
      cleanOpenModal();
    };
  }, []);

  // Global keydown fallback for 'E' key to open reflection modal
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.key === 'e' || e.key === 'E') && !modalState.isOpen && activeProximity && activeProximity.wisdom) {
        soundManager.playPop();
        setModalState({
          isOpen: true,
          philosopher: activeProximity.philosopher,
          wisdom: activeProximity.wisdom,
        });
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [modalState.isOpen, activeProximity]);

  // Sync data across game if modified in Admin Portal
  useEffect(() => {
    const cleanAdminSync = EventBus.on('admin-data-changed', async () => {
      try {
        const updatedPhils = await api.getPhilosophers();
        if (updatedPhils && updatedPhils.length > 0) {
          setPhilosophers(updatedPhils);
        }
      } catch {}
    });
    return () => cleanAdminSync();
  }, []);

  const handleOpenAdmin = () => {
    soundManager.playPop();
    if (isAdminLoggedIn) {
      setIsAdminPanelOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = (userData) => {
    setIsAdminLoggedIn(true);
    setAdminUser(userData);
    setIsAdminLoginOpen(false);
    setIsAdminPanelOpen(true);
  };

  const handleAdminLogout = () => {
    soundManager.playPop();
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    setIsAdminPanelOpen(false);
  };

  const handleStartGame = () => {
    setInGame(true);
  };

  const handleReturnToMenu = () => {
    soundManager.playPop();
    soundManager.stopAmbient();
    setInGame(false);
    setActiveProximity(null);
    setModalState({ isOpen: false, philosopher: null, wisdom: null });
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleModalClose = () => {
    soundManager.playPop();
    setModalState({ isOpen: false, philosopher: null, wisdom: null });
  };

  const handleWisdomRefreshed = (newWisdom) => {
    setModalState((prev) => ({ ...prev, wisdom: newWisdom }));
    setActiveProximity((prev) => {
      if (!prev) return null;
      return { ...prev, wisdom: newWisdom };
    });

    if (newWisdom && newWisdom.id > 0) {
      setDiscoveredQuotes((prev) => {
        const exists = prev.some((item) => item.id === newWisdom.id);
        if (!exists) {
          return [...prev, newWisdom];
        }
        return prev;
      });
    }
  };

  const visitedCount = new Set(discoveredQuotes.map((q) => q.philosopher_id)).size;

  return (
    <div className="game-app-root">
      {!inGame ? (
        <MainMenu onStartGame={handleStartGame} onOpenAdmin={handleOpenAdmin} />
      ) : (
        <>
          {/* 2D Phaser Canvas Game World */}
          <GameCanvas />

          {/* Dynamic Overhead Speech Bubble */}
          <SpeechBubble
            activeData={activeProximity}
            onOpenModal={() => {
              if (activeProximity && activeProximity.wisdom) {
                soundManager.playPop();
                setModalState({
                  isOpen: true,
                  philosopher: activeProximity.philosopher,
                  wisdom: activeProximity.wisdom,
                });
              }
            }}
          />

          {/* In-Game HUD (top header and bottom controls hint) */}
          <HUD
            onOpenJournal={() => {
              soundManager.playPop();
              setIsJournalOpen(true);
            }}
            onOpenHelp={() => {
              soundManager.playPop();
              setIsHelpOpen(true);
            }}
            onOpenAdmin={handleOpenAdmin}
            onReturnToMenu={handleReturnToMenu}
            discoveredCount={discoveredQuotes.length}
            visitedPhilosophersCount={visitedCount}
            totalPhilosophers={philosophers.length || 8}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />

          {/* Top-Right MiniMap */}
          <MiniMap philosophers={philosophers} />

          {/* Deep Philosopher Dialogue Panel (Press E) */}
          <PhilosopherModal
            isOpen={modalState.isOpen}
            onClose={handleModalClose}
            philosopher={modalState.philosopher}
            wisdom={modalState.wisdom}
            onWisdomRefreshed={handleWisdomRefreshed}
          />

          {/* Discovered Wisdom Journal */}
          <WisdomJournal
            isOpen={isJournalOpen}
            onClose={() => {
              soundManager.playPop();
              setIsJournalOpen(false);
            }}
            discoveredQuotes={discoveredQuotes}
            philosophers={philosophers}
          />

          {/* Quick Help Modal in game */}
          {isHelpOpen && (
            <div className="game-help-overlay" onClick={() => setIsHelpOpen(false)}>
              <div className="game-help-card" onClick={(e) => e.stopPropagation()}>
                <h3 className="help-heading">Exploration Guide</h3>
                <ul className="help-list">
                  <li><strong>WASD / Arrow Keys:</strong> Walk smoothly through the garden.</li>
                  <li><strong>Proximity:</strong> Walk close to Socrates, Plato, Aristotle, or Marcus Aurelius.</li>
                  <li><strong>Speech Bubble:</strong> Automatically reveals random wisdom from the SQLite database.</li>
                  <li><strong>Press [E]:</strong> Open the philosophical reflection panel for deep commentary and citations.</li>
                  <li><strong>Discover More:</strong> In the reflection panel, click <em>Discover Another Thought</em> to receive new wisdom.</li>
                  <li><strong>Mini-Map:</strong> Click any philosopher icon on the top-right radar to walk nearby.</li>
                </ul>
                <button className="help-close-btn" onClick={() => setIsHelpOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Admin Authentication Modal */}
      <AdminLogin
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Admin Management Dashboard */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        onLogout={handleAdminLogout}
        adminUser={adminUser}
      />
    </div>
  );
}
