import React, { useState } from 'react';
import { X, BookOpen, Quote, Sparkles, Filter } from 'lucide-react';
import './WisdomJournal.css';

export default function WisdomJournal({ isOpen, onClose, discoveredQuotes, philosophers }) {
  const [selectedPhilosopherId, setSelectedPhilosopherId] = useState('all');

  if (!isOpen) return null;

  const filteredQuotes = selectedPhilosopherId === 'all'
    ? discoveredQuotes
    : discoveredQuotes.filter(q => q.philosopher_id === Number(selectedPhilosopherId));

  // Count unique philosophers visited
  const visitedPhilosopherIds = new Set(discoveredQuotes.map(q => q.philosopher_id));
  const visitedCount = visitedPhilosopherIds.size;

  return (
    <div className="journal-backdrop" onClick={onClose}>
      <div className="journal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="journal-header">
          <div className="journal-title-row">
            <BookOpen className="journal-book-icon" size={22} />
            <h2 className="journal-title">Wisdom Journal</h2>
          </div>
          <button className="journal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="journal-stats-bar">
          <div className="stat-card">
            <span className="stat-value">{visitedCount} / {philosophers.length || 4}</span>
            <span className="stat-name">Philosophers Met</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{discoveredQuotes.length}</span>
            <span className="stat-name">Discovered Thoughts</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="journal-filter-tabs">
          <button
            className={`filter-tab ${selectedPhilosopherId === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedPhilosopherId('all')}
          >
            All Philosophers
          </button>
          {philosophers.map(p => (
            <button
              key={p.id}
              className={`filter-tab ${selectedPhilosopherId === String(p.id) ? 'active' : ''}`}
              onClick={() => setSelectedPhilosopherId(String(p.id))}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Quotes List */}
        <div className="journal-quotes-scroll">
          {filteredQuotes.length === 0 ? (
            <div className="journal-empty-state">
              <Sparkles size={32} className="empty-sparkle" />
              <h3>The Journal Awaits</h3>
              <p>Walk near Socrates, Plato, Aristotle, or Marcus Aurelius to gather insights into your personal collection.</p>
            </div>
          ) : (
            filteredQuotes.map((entry, idx) => (
              <div key={`${entry.id}-${idx}`} className="journal-quote-entry">
                <div className="entry-header">
                  <span className="entry-philosopher">{entry.philosopher_name}</span>
                  {entry.source && <span className="entry-source">{entry.source}</span>}
                </div>
                <blockquote className="entry-quote">“{entry.quote}”</blockquote>
                {entry.explanation && (
                  <p className="entry-explanation">{entry.explanation}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
