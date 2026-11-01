import React, { useState, useEffect } from 'react';
import { X, Sparkles, BookOpen, Scroll, Clock, Compass } from 'lucide-react';
import { EventBus } from '../game/EventBus';
import soundManager from '../services/audio';
import './PhilosopherModal.css';

export default function PhilosopherModal({ isOpen, onClose, philosopher, wisdom, onWisdomRefreshed }) {
  const [currentWisdom, setCurrentWisdom] = useState(wisdom);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    setCurrentWisdom(wisdom);
  }, [wisdom]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Listen to wisdom refresh event from InteractionManager
  useEffect(() => {
    const cleanRefresh = EventBus.on('wisdom-refreshed', ({ philosopherId, wisdom }) => {
      if (philosopher && philosopher.id === philosopherId) {
        setCurrentWisdom(wisdom);
        setIsLoadingMore(false);
        if (onWisdomRefreshed) {
          onWisdomRefreshed(wisdom);
        }
      }
    });
    return () => cleanRefresh();
  }, [philosopher, onWisdomRefreshed]);

  if (!isOpen || !philosopher) return null;

  const handleDiscoverAnother = () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    soundManager.playPop();
    EventBus.emit('request-another-wisdom', { philosopherId: philosopher.id });
  };

  const portraitMap = {
    1: '/assets/portraits/socrates.png',
    2: '/assets/portraits/plato.png',
    3: '/assets/portraits/aristotle.png',
    4: '/assets/portraits/marcus_aurelius.png',
    5: '/assets/portraits/ibad_khan.png',
    6: '/assets/portraits/ali_khan.png',
    7: '/assets/portraits/raza_abbass.png',
    8: '/assets/portraits/maam_farah.png',
  };

  const defaultPortrait = portraitMap[philosopher.id] || `/assets/portraits/${philosopher.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
  const portraitSrc = philosopher.face_image || defaultPortrait;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-parchment" onClick={(e) => e.stopPropagation()}>
        {/* Greek Meander Border Header */}
        <div className="modal-greek-pattern-bar" />

        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
          <X size={20} />
        </button>

        <div className="modal-body">
          {/* Left Column: Portrait & Stats */}
          <div className="modal-sidebar">
            <div className="portrait-cameo-frame">
              <img
                src={portraitSrc}
                alt={philosopher.name}
                className="portrait-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            <div className="sidebar-meta">
              <div className="meta-item">
                <Compass size={14} className="meta-icon" />
                <span>{philosopher.school}</span>
              </div>
              {philosopher.years && (
                <div className="meta-item">
                  <Clock size={14} className="meta-icon" />
                  <span>{philosopher.years}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Bio & Philosophical Wisdom */}
          <div className="modal-main">
            <header className="modal-header">
              <h2 className="philosopher-title">{philosopher.name}</h2>
              <span className="philosopher-subtitle">{philosopher.school}</span>
            </header>

            <div className="biography-section">
              <h3 className="section-label">
                <BookOpen size={14} /> Historical Biography
              </h3>
              <p className="biography-text">{philosopher.description}</p>
            </div>

            <div className="wisdom-callout-card">
              <div className="callout-header">
                <Scroll size={16} className="callout-icon" />
                <span className="callout-title">Contemplation & Wisdom</span>
              </div>

              {currentWisdom ? (
                <>
                  <blockquote className="wisdom-quote-large">
                    “{currentWisdom.quote}”
                  </blockquote>

                  {currentWisdom.source && (
                    <div className="wisdom-source-tag">
                      <strong>Source:</strong> {currentWisdom.source}
                    </div>
                  )}

                  <div className="wisdom-explanation-box">
                    <strong>Philosophical Meaning:</strong>
                    <p>{currentWisdom.explanation}</p>
                  </div>
                </>
              ) : (
                <p className="wisdom-empty">No wisdom entry loaded.</p>
              )}
            </div>

            {/* Action Footer */}
            <div className="modal-actions">
              <button
                className={`discover-btn ${isLoadingMore ? 'loading' : ''}`}
                onClick={handleDiscoverAnother}
                disabled={isLoadingMore}
              >
                <Sparkles size={16} className={isLoadingMore ? 'spin-icon' : ''} />
                <span>{isLoadingMore ? 'Consulting SQLite...' : 'Discover Another Thought'}</span>
              </button>

              <button className="done-btn" onClick={onClose}>
                Continue Exploring
              </button>
            </div>
          </div>
        </div>

        {/* Greek Meander Border Footer */}
        <div className="modal-greek-pattern-bar bottom" />
      </div>
    </div>
  );
}
