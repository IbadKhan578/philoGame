import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
  Shield,
  LogOut,
  AlertTriangle,
  Compass,
  Camera,
  UploadCloud
} from 'lucide-react';
import api from '../services/api';
import soundManager from '../services/audio';
import { EventBus } from '../game/EventBus';
import './AdminPanel.css';

const DEFAULT_SPRITES = [
  { key: 'socrates.png', label: 'Socrates (Classical White Toga)' },
  { key: 'plato.png', label: 'Plato (Crimson Robe)' },
  { key: 'aristotle.png', label: 'Aristotle (Royal Blue)' },
  { key: 'marcus_aurelius.png', label: 'Marcus Aurelius (Imperial Purple)' },
  { key: 'ibad_khan.png', label: 'Ibad Khan (Forest Green LARP)' },
  { key: 'ali_khan.png', label: 'Ali Khan (Terracotta Gourmet)' },
  { key: 'raza_abbass.png', label: 'Raza Abbass (Cyber Cyan Dialectic)' },
  { key: 'maam_farah.png', label: 'Ma\'am Farah (Academic Maroon & Glasses)' },
];

export default function AdminPanel({ isOpen, onClose, onLogout, adminUser }) {
  const [activeTab, setActiveTab] = useState('philosophers'); // 'philosophers' | 'wisdom'
  const [philosophers, setPhilosophers] = useState([]);
  const [allWisdom, setAllWisdom] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhilosopherFilter, setSelectedPhilosopherFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  // Modals for editing/creating
  const [philModalState, setPhilModalState] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    data: {
      name: '',
      school: '',
      years: '',
      description: '',
      position_x: 500,
      position_y: 500,
      image: 'socrates.png',
    },
    targetId: null,
  });

  const [wisdomModalState, setWisdomModalState] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    data: {
      philosopher_id: 1,
      quote: '',
      explanation: '',
      source: '',
    },
    targetId: null,
  });

  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: null, // 'philosopher' | 'wisdom'
    id: null,
    name: '',
  });

  // Dedicated Face Upload Modal State
  const [faceModalState, setFaceModalState] = useState({
    isOpen: false,
    philosopher: null,
    previewUrl: null,
    originalFace: null,
    isSaving: false,
  });

  // Fetch all data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [phils, wisdom] = await Promise.all([
        api.getPhilosophers(),
        api.getAllWisdom().catch(() => []),
      ]);
      setPhilosophers(phils || []);
      setAllWisdom(wisdom || []);
    } catch (err) {
      showToast('Error loading archive data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  if (!isOpen) return null;

  // --- Philosopher Handlers ---

  const handleOpenCreatePhil = () => {
    soundManager.playPop();
    setPhilModalState({
      isOpen: true,
      mode: 'create',
      data: {
        name: '',
        school: '',
        years: 'Contemporary Era',
        description: '',
        position_x: 500,
        position_y: 500,
        image: 'socrates.png',
      },
      targetId: null,
    });
  };

  const handleOpenEditPhil = (p) => {
    soundManager.playPop();
    setPhilModalState({
      isOpen: true,
      mode: 'edit',
      data: {
        name: p.name,
        school: p.school,
        years: p.years || '',
        description: p.description,
        position_x: p.position_x,
        position_y: p.position_y,
        image: p.image,
      },
      targetId: p.id,
    });
  };

  const handleSavePhil = async (e) => {
    e.preventDefault();
    soundManager.playPop();
    const { mode, data, targetId } = philModalState;

    try {
      if (mode === 'create') {
        const created = await api.createPhilosopher(data);
        showToast(`Philosopher "${created.name}" created!`);
      } else {
        const updated = await api.updatePhilosopher(targetId, data);
        showToast(`Philosopher "${updated.name}" updated!`);
      }
      setPhilModalState({ ...philModalState, isOpen: false });
      await loadData();
      EventBus.emit('admin-data-changed');
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to save philosopher', 'error');
    }
  };

  // --- Dedicated Face Upload Handlers ---
  const handleOpenFaceModal = (p) => {
    soundManager.playPop();
    setFaceModalState({
      isOpen: true,
      philosopher: p,
      previewUrl: p.face_image || null,
      originalFace: p.face_image || null,
      isSaving: false,
    });
  };

  const handleCloseFaceModal = () => {
    soundManager.playPop();
    setFaceModalState({
      isOpen: false,
      philosopher: null,
      previewUrl: null,
      originalFace: null,
      isSaving: false,
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundManager.playPop();
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 240;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

        const circleDataUrl = canvas.toDataURL('image/png');
        setFaceModalState((prev) => ({
          ...prev,
          previewUrl: circleDataUrl,
        }));
      };
      img.src = uploadEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveFace = async () => {
    if (!faceModalState.philosopher || !faceModalState.previewUrl) return;
    soundManager.playPop();
    setFaceModalState((prev) => ({ ...prev, isSaving: true }));

    try {
      await api.uploadPhilosopherFace(faceModalState.philosopher.id, faceModalState.previewUrl);
      showToast(`Custom face updated for "${faceModalState.philosopher.name}"!`);
      handleCloseFaceModal();
      await loadData();
      EventBus.emit('admin-data-changed');
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to upload face image', 'error');
      setFaceModalState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  const handleResetFace = async () => {
    if (!faceModalState.philosopher) return;
    soundManager.playPop();
    setFaceModalState((prev) => ({ ...prev, isSaving: true }));

    try {
      await api.resetPhilosopherFace(faceModalState.philosopher.id);
      showToast(`Reset face to default for "${faceModalState.philosopher.name}"`);
      handleCloseFaceModal();
      await loadData();
      EventBus.emit('admin-data-changed');
    } catch (err) {
      showToast('Failed to reset face', 'error');
      setFaceModalState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  // --- Wisdom Handlers ---

  const handleOpenCreateWisdom = (philosopherId = null) => {
    soundManager.playPop();
    const defaultPhilId = philosopherId || (philosophers[0] ? philosophers[0].id : 1);
    setWisdomModalState({
      isOpen: true,
      mode: 'create',
      data: {
        philosopher_id: defaultPhilId,
        quote: '',
        explanation: '',
        source: '',
      },
      targetId: null,
    });
  };

  const handleOpenEditWisdom = (w) => {
    soundManager.playPop();
    setWisdomModalState({
      isOpen: true,
      mode: 'edit',
      data: {
        philosopher_id: w.philosopher_id,
        quote: w.quote,
        explanation: w.explanation,
        source: w.source || '',
      },
      targetId: w.id,
    });
  };

  const handleSaveWisdom = async (e) => {
    e.preventDefault();
    soundManager.playPop();
    const { mode, data, targetId } = wisdomModalState;

    try {
      if (mode === 'create') {
        await api.addWisdom(data.philosopher_id, {
          quote: data.quote,
          explanation: data.explanation,
          source: data.source,
        });
        showToast('Wisdom quote added successfully!');
      } else {
        await api.updateWisdom(targetId, {
          quote: data.quote,
          explanation: data.explanation,
          source: data.source,
        });
        showToast('Wisdom quote updated!');
      }
      setWisdomModalState({ ...wisdomModalState, isOpen: false });
      await loadData();
      EventBus.emit('admin-data-changed');
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to save wisdom quote', 'error');
    }
  };

  // --- Delete Handler ---

  const handleConfirmDelete = async () => {
    soundManager.playPop();
    const { type, id } = deleteConfirm;
    try {
      if (type === 'philosopher') {
        await api.deletePhilosopher(id);
        showToast('Philosopher and all associated wisdom deleted.');
      } else if (type === 'wisdom') {
        await api.deleteWisdom(id);
        showToast('Wisdom quote deleted.');
      }
      setDeleteConfirm({ isOpen: false, type: null, id: null, name: '' });
      await loadData();
      EventBus.emit('admin-data-changed');
    } catch (err) {
      showToast('Deletion failed', 'error');
    }
  };

  // Filter wisdom by philosopher
  const filteredWisdom = allWisdom.filter((w) => {
    if (selectedPhilosopherFilter === 'all') return true;
    return w.philosopher_id === Number(selectedPhilosopherFilter);
  });

  return (
    <div className="admin-panel-backdrop">
      <div className="admin-panel-container">
        {/* Toast Alert */}
        {toastMessage && (
          <div className={`admin-toast ${toastMessage.type}`}>
            <Sparkles size={16} />
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Top Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <div className="admin-badge-emblem">🏛️</div>
            <div>
              <h1 className="admin-main-title">Philosophy World — Admin Council</h1>
              <span className="admin-auth-indicator">
                <Shield size={13} />
                <span>Signed in as <strong>{adminUser?.email || 'Administrator'}</strong></span>
              </span>
            </div>
          </div>

          <div className="admin-header-actions">
            <button className="admin-reload-btn" onClick={loadData} title="Reload SQLite Database">
              <RotateCcw size={14} className={isLoading ? 'spinning' : ''} />
              <span>Refresh</span>
            </button>
            <button className="admin-logout-btn" onClick={onLogout} title="Sign Out">
              <LogOut size={14} />
              <span>Logout</span>
            </button>
            <button className="admin-close-btn" onClick={onClose} title="Back to Exploration">
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="admin-tabs-bar">
          <button
            className={`admin-tab-btn ${activeTab === 'philosophers' ? 'active' : ''}`}
            onClick={() => {
              soundManager.playPop();
              setActiveTab('philosophers');
            }}
          >
            <Users size={16} />
            <span>Philosophers ({philosophers.length})</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'wisdom' ? 'active' : ''}`}
            onClick={() => {
              soundManager.playPop();
              setActiveTab('wisdom');
            }}
          >
            <BookOpen size={16} />
            <span>Wisdom Archives ({allWisdom.length})</span>
          </button>
        </div>

        {/* Main Content Body */}
        <div className="admin-content-scroll">
          {/* TAB 1: PHILOSOPHERS */}
          {activeTab === 'philosophers' && (
            <div className="admin-tab-section">
              <div className="section-toolbar">
                <div>
                  <h3 className="section-heading">Philosophical Thinkers</h3>
                  <p className="section-subtext">Manage character metadata, schools of thought, coordinates, and portraits.</p>
                </div>
                <button className="create-action-btn" onClick={handleOpenCreatePhil}>
                  <Plus size={16} />
                  <span>Add New Philosopher</span>
                </button>
              </div>

              <div className="philosophers-grid">
                {philosophers.map((p) => {
                  const portraitKey = p.image ? p.image.replace('.png', '') : 'socrates';
                  const wisdomCount = allWisdom.filter((w) => w.philosopher_id === p.id).length;

                  return (
                    <div key={p.id} className="philosopher-admin-card">
                      <div className="card-top">
                        <div className="card-avatar-container">
                          <img
                            src={p.face_image || `/assets/portraits/${portraitKey}.png`}
                            alt={p.name}
                            className={`phil-thumb-img ${p.face_image ? 'has-custom-face' : ''}`}
                            onError={(e) => {
                              e.target.src = '/assets/portraits/socrates.png';
                            }}
                          />
                          {p.face_image && (
                            <span className="custom-face-badge" title="Has custom uploaded face">
                              Custom Face
                            </span>
                          )}
                        </div>
                        <div className="phil-info">
                          <h4 className="phil-card-name">{p.name}</h4>
                          <span className="phil-school-tag">{p.school}</span>
                          <span className="phil-years-tag">{p.years || 'Ancient Era'}</span>
                        </div>
                      </div>

                      <p className="phil-desc-preview">{p.description}</p>

                      <div className="phil-meta-row">
                        <span className="meta-item">
                          <MapPin size={12} />
                          <span>({p.position_x}, {p.position_y})</span>
                        </span>
                        <span className="meta-item">
                          <BookOpen size={12} />
                          <span>{wisdomCount} Quotes</span>
                        </span>
                      </div>

                      <div className="card-actions-row">
                        <button
                          className="btn-card-action upload-face"
                          onClick={() => handleOpenFaceModal(p)}
                          title="Upload Custom Face Image"
                        >
                          <Camera size={13} />
                          <span>Face</span>
                        </button>
                        <button
                          className="btn-card-action edit"
                          onClick={() => handleOpenEditPhil(p)}
                          title="Edit Philosopher"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="btn-card-action add-quote"
                          onClick={() => {
                            setActiveTab('wisdom');
                            setSelectedPhilosopherFilter(String(p.id));
                            handleOpenCreateWisdom(p.id);
                          }}
                          title="Add Quote for this Philosopher"
                        >
                          <Plus size={13} />
                          <span>Add Quote</span>
                        </button>
                        <button
                          className="btn-card-action delete"
                          onClick={() => {
                            soundManager.playPop();
                            setDeleteConfirm({
                              isOpen: true,
                              type: 'philosopher',
                              id: p.id,
                              name: p.name,
                            });
                          }}
                          title="Delete Philosopher"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: WISDOM ENTRIES */}
          {activeTab === 'wisdom' && (
            <div className="admin-tab-section">
              <div className="section-toolbar">
                <div className="filter-group">
                  <label htmlFor="phil-filter">Filter by Philosopher:</label>
                  <select
                    id="phil-filter"
                    value={selectedPhilosopherFilter}
                    onChange={(e) => setSelectedPhilosopherFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="all">All Philosophers ({allWisdom.length})</option>
                    {philosophers.map((p) => {
                      const count = allWisdom.filter((w) => w.philosopher_id === p.id).length;
                      return (
                        <option key={p.id} value={p.id}>
                          {p.name} ({count} quotes)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  className="create-action-btn"
                  onClick={() => handleOpenCreateWisdom(selectedPhilosopherFilter !== 'all' ? Number(selectedPhilosopherFilter) : null)}
                >
                  <Plus size={16} />
                  <span>Add Wisdom Quote</span>
                </button>
              </div>

              <div className="wisdom-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '160px' }}>Philosopher</th>
                      <th>Wisdom Quote</th>
                      <th>Explanation / Meaning</th>
                      <th style={{ width: '180px' }}>Citation Source</th>
                      <th style={{ width: '110px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWisdom.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-table-cell">
                          No wisdom quotes found. Click "Add Wisdom Quote" to create one.
                        </td>
                      </tr>
                    ) : (
                      filteredWisdom.map((w) => {
                        const author = philosophers.find((p) => p.id === w.philosopher_id);

                        return (
                          <tr key={w.id}>
                            <td className="author-cell">
                              <strong>{author ? author.name : `Philosopher #${w.philosopher_id}`}</strong>
                              <span className="author-school-sub">{author?.school}</span>
                            </td>
                            <td className="quote-cell">
                              “{w.quote}”
                            </td>
                            <td className="explanation-cell">
                              {w.explanation}
                            </td>
                            <td className="source-cell">
                              {w.source || 'Oral Tradition'}
                            </td>
                            <td className="actions-cell">
                              <button
                                className="table-action-icon edit"
                                onClick={() => handleOpenEditWisdom(w)}
                                title="Edit Quote"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                className="table-action-icon delete"
                                onClick={() => {
                                  soundManager.playPop();
                                  setDeleteConfirm({
                                    isOpen: true,
                                    type: 'wisdom',
                                    id: w.id,
                                    name: `“${w.quote.substring(0, 30)}...”`,
                                  });
                                }}
                                title="Delete Quote"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Create/Edit Philosopher */}
        {philModalState.isOpen && (
          <div className="admin-submodal-overlay" onClick={() => setPhilModalState({ ...philModalState, isOpen: false })}>
            <div className="admin-submodal-card" onClick={(e) => e.stopPropagation()}>
              <div className="submodal-header">
                <h3>{philModalState.mode === 'create' ? 'Add New Philosopher' : `Edit: ${philModalState.data.name}`}</h3>
                <button
                  className="submodal-close"
                  onClick={() => setPhilModalState({ ...philModalState, isOpen: false })}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSavePhil} className="submodal-form">
                <div className="form-row">
                  <div className="form-field flex-1">
                    <label>Philosopher Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Diogenes"
                      value={philModalState.data.name}
                      onChange={(e) =>
                        setPhilModalState({
                          ...philModalState,
                          data: { ...philModalState.data, name: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="form-field flex-1">
                    <label>Philosophical School *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cynicism & Free Will"
                      value={philModalState.data.school}
                      onChange={(e) =>
                        setPhilModalState({
                          ...philModalState,
                          data: { ...philModalState.data, school: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field flex-1">
                    <label>Historical Period / Years</label>
                    <input
                      type="text"
                      placeholder="e.g. c. 412 – 323 BCE"
                      value={philModalState.data.years}
                      onChange={(e) =>
                        setPhilModalState({
                          ...philModalState,
                          data: { ...philModalState.data, years: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="form-field flex-1">
                    <label>Character Sprite & Portrait</label>
                    <select
                      value={philModalState.data.image}
                      onChange={(e) =>
                        setPhilModalState({
                          ...philModalState,
                          data: { ...philModalState.data, image: e.target.value },
                        })
                      }
                    >
                      {DEFAULT_SPRITES.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field flex-1">
                    <label>World Coordinate X (0 - 2000)</label>
                    <input
                      type="number"
                      min="100"
                      max="1900"
                      value={philModalState.data.position_x}
                      onChange={(e) =>
                        setPhilModalState({
                          ...philModalState,
                          data: { ...philModalState.data, position_x: Number(e.target.value) },
                        })
                      }
                    />
                  </div>

                  <div className="form-field flex-1">
                    <label>World Coordinate Y (0 - 1600)</label>
                    <input
                      type="number"
                      min="100"
                      max="1500"
                      value={philModalState.data.position_y}
                      onChange={(e) =>
                        setPhilModalState({
                          ...philModalState,
                          data: { ...philModalState.data, position_y: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Biographical Summary *</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Enter short historical introduction..."
                    value={philModalState.data.description}
                    onChange={(e) =>
                      setPhilModalState({
                        ...philModalState,
                        data: { ...philModalState.data, description: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="submodal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setPhilModalState({ ...philModalState, isOpen: false })}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-save">
                    <Check size={16} />
                    <span>Save Philosopher</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Create/Edit Wisdom Quote */}
        {wisdomModalState.isOpen && (
          <div className="admin-submodal-overlay" onClick={() => setWisdomModalState({ ...wisdomModalState, isOpen: false })}>
            <div className="admin-submodal-card" onClick={(e) => e.stopPropagation()}>
              <div className="submodal-header">
                <h3>{wisdomModalState.mode === 'create' ? 'Add Wisdom Quote' : 'Edit Wisdom Quote'}</h3>
                <button
                  className="submodal-close"
                  onClick={() => setWisdomModalState({ ...wisdomModalState, isOpen: false })}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveWisdom} className="submodal-form">
                <div className="form-field">
                  <label>Philosopher</label>
                  <select
                    value={wisdomModalState.data.philosopher_id}
                    disabled={wisdomModalState.mode === 'edit'}
                    onChange={(e) =>
                      setWisdomModalState({
                        ...wisdomModalState,
                        data: { ...wisdomModalState.data, philosopher_id: Number(e.target.value) },
                      })
                    }
                  >
                    {philosophers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.school})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Quote Text *</label>
                  <textarea
                    rows="2"
                    required
                    placeholder="“Enter profound words of wisdom...”"
                    value={wisdomModalState.data.quote}
                    onChange={(e) =>
                      setWisdomModalState({
                        ...wisdomModalState,
                        data: { ...wisdomModalState.data, quote: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Philosophical Meaning / Explanation *</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Explain the philosophical context and interpretation..."
                    value={wisdomModalState.data.explanation}
                    onChange={(e) =>
                      setWisdomModalState({
                        ...wisdomModalState,
                        data: { ...wisdomModalState.data, explanation: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Citation Source</label>
                  <input
                    type="text"
                    placeholder="e.g. Plato, Republic Book VII (Allegory of the Cave)"
                    value={wisdomModalState.data.source}
                    onChange={(e) =>
                      setWisdomModalState({
                        ...wisdomModalState,
                        data: { ...wisdomModalState.data, source: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="submodal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setWisdomModalState({ ...wisdomModalState, isOpen: false })}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-save">
                    <Check size={16} />
                    <span>Save Wisdom Entry</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirm.isOpen && (
          <div className="admin-submodal-overlay" onClick={() => setDeleteConfirm({ isOpen: false, type: null, id: null, name: '' })}>
            <div className="admin-submodal-card delete-card" onClick={(e) => e.stopPropagation()}>
              <div className="delete-icon-badge">
                <AlertTriangle size={32} />
              </div>
              <h3 className="delete-title">Confirm Deletion</h3>
              <p className="delete-prompt">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
                {deleteConfirm.type === 'philosopher' && (
                  <span className="delete-warning">
                    <br />Warning: All wisdom quotes linked to this philosopher will be permanently deleted!
                  </span>
                )}
              </p>

              <div className="submodal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setDeleteConfirm({ isOpen: false, type: null, id: null, name: '' })}
                >
                  Cancel
                </button>
                <button type="button" className="btn-confirm-delete" onClick={handleConfirmDelete}>
                  <Trash2 size={16} />
                  <span>Delete Permanently</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Face Upload Modal */}
        {faceModalState.isOpen && faceModalState.philosopher && (
          <div className="admin-submodal-overlay" onClick={handleCloseFaceModal}>
            <div className="admin-submodal-card face-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="face-modal-header">
                <div className="face-header-info">
                  <div className="face-icon-badge">
                    <Camera size={22} />
                  </div>
                  <div>
                    <h3 className="submodal-title">Face Replacement: {faceModalState.philosopher.name}</h3>
                    <p className="face-modal-subtitle">
                      Upload an image to replace <strong>only the face</strong>. The classical toga body, walking animations, and movements remain intact!
                    </p>
                  </div>
                </div>
                <button className="face-close-x" onClick={handleCloseFaceModal} title="Close">
                  <X size={18} />
                </button>
              </div>

              {/* Side-by-side Live Preview comparison */}
              <div className="face-preview-grid">
                {/* 1. 2D Game Sprite Head Replacement Preview */}
                <div className="preview-tile">
                  <div className="tile-badge">2D Game Sprite</div>
                  <div className="character-stage">
                    <div className="stage-sprite-frame">
                      {/* Character body base spritesheet */}
                      <img
                        src={`/assets/characters/${faceModalState.philosopher.image ? faceModalState.philosopher.image.replace('.png', '') : 'socrates'}/spritesheet.png`}
                        alt="Body"
                        className="stage-body-sheet"
                        onError={(e) => {
                          e.target.src = '/assets/characters/socrates/spritesheet.png';
                        }}
                      />
                      {/* Face overlay pinned to the head */}
                      {faceModalState.previewUrl && (
                        <img
                          src={faceModalState.previewUrl}
                          alt="Face Overlay"
                          className="stage-face-overlay"
                        />
                      )}
                    </div>
                  </div>
                  <span className="tile-caption">Toga & walking body preserved</span>
                </div>

                {/* 2. Cameo Portrait Reflection Frame */}
                <div className="preview-tile">
                  <div className="tile-badge">Dialogue Reflection Cameo</div>
                  <div className="cameo-stage">
                    <div className="cameo-gold-ring">
                      <img
                        src={faceModalState.previewUrl || `/assets/portraits/${faceModalState.philosopher.image ? faceModalState.philosopher.image.replace('.png', '') : 'socrates'}.png`}
                        alt="Cameo Portrait"
                        className="cameo-stage-img"
                        onError={(e) => {
                          e.target.src = '/assets/portraits/socrates.png';
                        }}
                      />
                    </div>
                  </div>
                  <span className="tile-caption">Shown in [E] Reflection Modal</span>
                </div>
              </div>

              {/* Upload & Reset Controls */}
              <div className="face-upload-actions-bar">
                <label className="btn-upload-file">
                  <UploadCloud size={16} />
                  <span>Choose Face Photo (PNG / JPG)</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </label>

                {faceModalState.originalFace && (
                  <button
                    type="button"
                    className="btn-reset-face"
                    onClick={handleResetFace}
                    disabled={faceModalState.isSaving}
                    title="Remove custom face and restore classical face"
                  >
                    <RotateCcw size={14} />
                    <span>Reset to Classical Face</span>
                  </button>
                )}
              </div>

              <div className="submodal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseFaceModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-save"
                  onClick={handleSaveFace}
                  disabled={!faceModalState.previewUrl || faceModalState.previewUrl === faceModalState.originalFace || faceModalState.isSaving}
                >
                  <Check size={16} />
                  <span>{faceModalState.isSaving ? 'Applying Face...' : 'Apply Face to Character'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
