import React, { useState, useEffect } from 'react';
import { Play, Info, HelpCircle, CheckCircle, AlertTriangle, Compass, Sparkles, X, Shield } from 'lucide-react';
import api from '../services/api';
import soundManager from '../services/audio';
import './MainMenu.css';

export default function MainMenu({ onStartGame, onOpenAdmin }) {
  const [activeModal, setActiveModal] = useState(null); // 'about' | 'controls' | null
  const [backendHealth, setBackendHealth] = useState({ checked: false, online: false });

  useEffect(() => {
    let isMounted = true;
    api.checkHealth().then((res) => {
      if (isMounted) {
        setBackendHealth({
          checked: true,
          online: res.success,
          stats: res.data,
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleStart = () => {
    soundManager.init();
    soundManager.playPop();
    soundManager.startAmbient();
    onStartGame();
  };

  return (
    <div className="main-menu-container">
      {/* Background Ambience Layer */}
      <div className="menu-backdrop-overlay" />

      {/* Main Title Card */}
      <div className="menu-content-card">
        {/* Greek Pillar / Laurel Icon */}
        <div className="menu-hero-badge">
          <span className="hero-emblem">🏛️</span>
        </div>

        <h1 className="menu-game-title">Philosophy World</h1>
        <p className="menu-game-subtitle">
          An Interactive 2D Philosophical Exploration Game
        </p>
        <p className="menu-tagline">
          Wander through a peaceful ancient Greek sanctuary, converse with history’s greatest thinkers, and discover timeless wisdom.
        </p>

        {/* Action Buttons */}
        <div className="menu-action-buttons">
          <button className="menu-btn primary-start-btn" onClick={handleStart}>
            <Play size={18} fill="currentColor" />
            <span>Start Exploring</span>
          </button>

          <div className="menu-secondary-buttons">
            <button
              className="menu-btn secondary-btn"
              onClick={() => {
                soundManager.playPop();
                setActiveModal('controls');
              }}
            >
              <HelpCircle size={16} />
              <span>How to Play</span>
            </button>

            <button
              className="menu-btn secondary-btn"
              onClick={() => {
                soundManager.playPop();
                setActiveModal('about');
              }}
            >
              <Info size={16} />
              <span>About Game</span>
            </button>

            <button
              className="menu-btn secondary-btn admin-portal-btn"
              onClick={() => {
                soundManager.playPop();
                if (onOpenAdmin) onOpenAdmin();
              }}
              title="Restricted Archivist Council (Manage Database)"
            >
              <Shield size={16} />
              <span>Admin Council</span>
            </button>
          </div>
        </div>

        {/* Backend & Database Connection Badge */}
        <div className="backend-status-pill">
          {backendHealth.checked ? (
            backendHealth.online ? (
              <span className="status-badge online">
                <CheckCircle size={13} />
                <span>FastAPI + SQLite Archive Connected ({backendHealth.stats?.wisdom_count || 44} Wisdom Entries)</span>
              </span>
            ) : (
              <span className="status-badge offline">
                <AlertTriangle size={13} />
                <span>Backend offline (Running in local browser fallback)</span>
              </span>
            )
          ) : (
            <span className="status-badge checking">
              <span className="spinner-mini" />
              <span>Connecting to Wisdom Database...</span>
            </span>
          )}
        </div>
      </div>

      {/* About Modal */}
      {activeModal === 'about' && (
        <div className="menu-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="menu-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="menu-modal-header">
              <h2>About Philosophy World</h2>
              <button className="menu-modal-close" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="menu-modal-body">
              <p>
                <strong>Philosophy World</strong> is a browser-based 2D exploration game built with
                <strong> React, Phaser 3, FastAPI, and SQLite</strong>.
              </p>
              <p>
                Step into a serene ancient garden featuring four renowned philosophical figures:
              </p>
              <ul className="modal-philosopher-list">
                <li><strong>Socrates:</strong> Classical Athenian founder of Western inquiry & the Socratic method.</li>
                <li><strong>Plato:</strong> Visionary teacher, founder of the Academy & Idealist Theory of Forms.</li>
                <li><strong>Aristotle:</strong> Polymath of the Lyceum, pioneer of logic & Virtue Ethics.</li>
                <li><strong>Marcus Aurelius:</strong> Roman Emperor and Stoic practitioner of resilience and duty.</li>
              </ul>
              <p>
                All wisdom quotes and interpretations are retrieved in real-time from the SQLite database
                via a RESTful FastAPI backend.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controls Modal */}
      {activeModal === 'controls' && (
        <div className="menu-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="menu-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="menu-modal-header">
              <h2>Controls & Guide</h2>
              <button className="menu-modal-close" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="menu-modal-body">
              <div className="control-row">
                <div className="key-badge-group">
                  <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or Arrow Keys
                </div>
                <div className="control-desc">Move your character across the garden.</div>
              </div>
              <div className="control-row">
                <div className="key-badge-group">Proximity (~80px)</div>
                <div className="control-desc">Walk near any philosopher to automatically hear their thoughts via a speech bubble.</div>
              </div>
              <div className="control-row">
                <div className="key-badge-group"><kbd>E</kbd> Key or Click</div>
                <div className="control-desc">Open the deep dialogue panel to inspect biographies, historical context, and discover fresh wisdom.</div>
              </div>
              <div className="control-row">
                <div className="key-badge-group">Mini-Map</div>
                <div className="control-desc">Use the radar in the top-right corner to locate all four philosophers. Click markers to fast travel!</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
