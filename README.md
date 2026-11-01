# 🏛️ Philosophy World: An Interactive 2D Philosophical Exploration Game

**Version 1.0 · React 19 · Phaser 3 · FastAPI · SQLite · SQLAlchemy**

> *"The unexamined life is not worth living." — Socrates*

---

## 🌟 Overview

**Philosophy World** is an explorable 2D browser-based RPG where players walk through a serene philosophical garden inspired by ancient Greek landscape and architecture. Encounter 8 legendary and contemporary thinkers—**Socrates**, **Plato**, **Aristotle**, **Marcus Aurelius**, **Ibad Khan**, **Ali Khan**, **Raza Abbass**, and **Ma'am Farah**—and discover their wisdom retrieved in real-time from an authenticated SQLite database via a FastAPI REST backend.

---

## 🎮 The 8 Philosophers & Their Wisdom

1. **Socrates** *(Classical Greek Philosophy)*: Questioning, critical thinking, and intellectual humility.
   - Quote: *"The unexamined life is not worth living."*
2. **Plato** *(Platonism & Idealism)*: Visionary Theory of Forms and justice.
   - Quote: *"The beginning is the most important part of the work."*
3. **Aristotle** *(Peripatetic & Virtue Ethics)*: Logic, science, and virtue.
   - Quote: *"Knowing yourself is the beginning of all wisdom."*
4. **Marcus Aurelius** *(Stoicism)*: Emotional resilience and the dichotomy of control.
   - Quote: *"You have power over your mind - not outside events."*
5. **Ibad Khan** *(Existential LARPism)*: The philosophy of modern narrative, masks, and being.
   - Quote: *"I larp, therefore i am."*
6. **Ali Khan** *(Late-Night Gastronomy)*: Nocturnal culinary chronobiology and table conviviality.
   - Quote: *"Anything after 9 is for dinner."*
7. **Raza Abbass** *(Cybernetic Dialectics)*: Tech critique and the limits of synthetic intelligence.
   - Quote: *"yr claude boht harami cheez hy"*
8. **Ma'am Farah** *(Academic Punctuality)*: Scholastic rigor, temporal discipline, and classroom attendance.
   - Quote: *"jo 8:10 k bad class m ayega ausko attendence nh milegi"*

---

## 🚀 Quick Run (One-Click Launcher)

On Windows, double-click:
```
start_game.bat
```
This opens the backend, frontend, and automatically launches your default browser to **`http://localhost:5173`**.

---

## 💻 How to Run in VS Code or Antigravity IDE

### Step 1: Open the Project
1. Launch **VS Code** or **Antigravity IDE**.
2. Click **File ➔ Open Folder...** and select `d:\Downloads\philogame` (or the folder where you unpacked the project).

### Step 2: Open Two Terminals (Split Terminal)
In the top menu, click **Terminal ➔ New Terminal** (or press ``Ctrl + ` ``). Then click the **Split Terminal** icon `(|)` to open two side-by-side terminal panes.

#### In Terminal 1 (Backend - FastAPI + SQLite):
```bash
cd backend
pip install -r requirements.txt
python run.py
```
*Output: `Uvicorn running on http://127.0.0.1:8000`*

#### In Terminal 2 (Frontend - React + Phaser + Vite):
```bash
cd frontend
npm install
npm run dev
```
*Output: `Local: http://127.0.0.1:5173/`*

### Step 3: Open in Browser
Visit **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🎤 Presentation Demo Guide (How to Present)

When presenting this project to your class, professor, or audience, follow this 2-minute walkthrough:

1. **Main Menu & Backend Verification**:
   - Show the green pill: *"FastAPI + SQLite Archive Connected (56 Wisdom Entries)"*. Explain that this dynamically queries the Python backend on mount.
   - Click **Start Exploring**.

2. **2D Exploration & Player Mechanics**:
   - Move with **WASD** or **Arrow Keys**.
   - Point out the overhead player badge `✦ Explorer (You) ✦` and glowing cyan aura.
   - Note the stone pathways, central fountain, temple ruins, and classical statues with smooth collision physics.

3. **Mini-Map Tracking**:
   - Look at the top-right **Garden Map**. Show the cyan radar blip following your character in real-time.
   - Point out the 8 philosopher pins (**S**, **P**, **A**, **M**, **I**, **A**, **R**, **M**).
   - Click any marker to immediately walk to that philosopher!

4. **Comic Thought Cloud (Proximity Interaction)**:
   - Walk near any thinker (e.g., Socrates, Ibad Khan, or Ma'am Farah).
   - Show the comic thought cloud puffing up above their head with their quote.
   - Mention that **wisdom audio is disabled** so contemplation remains calm and peaceful.
   - Walk away to demonstrate that the cloud cleanly disappears with zero lag.

5. **Deep Reflection Modal & Live SQLite Querying**:
   - Walk up to a philosopher and press **`E`** (or click the thought cloud).
   - Show the parchment dialogue modal with their 240×240 cameo portrait, historical period, and philosophical interpretation.
   - Click **"Discover Another Thought"**: highlight to the audience that this queries the FastAPI backend (`/api/philosophers/{id}/wisdom?exclude_id=...`) and pulls a fresh quote directly from SQLite without refreshing the page!

6. **Wisdom Journal**:
   - Click **Journal** in the top HUD.
   - Show all the collected wisdom quotes gathered during your journey.

---

## 🎮 Core Gameplay & Features

1. **Top-Down 2D Exploration**:
   - Smooth 8-directional movement using **WASD** or **Arrow Keys**.
   - Direction-aware idle and walking sprite animations (Down, Left, Right, Up).
   - Collision detection with temple ruins, marble columns, fountains, olive trees, cypress trees, and benches.
   - Smooth camera following with deadzones clamped strictly to world boundaries (2000 × 1600 px).

2. **The Four Legendary Philosophers**:
   - **Socrates** *(Classical Greek Philosophy, Agora & Olive Grove)*: Focused on self-examination, questioning, and intellectual humility.
   - **Plato** *(Platonism & Idealism, Academy & Ruined Temple Sanctuary)*: Visionary theory of Forms, cave allegory, and justice.
   - **Aristotle** *(Peripatetic & Virtue Ethics, Lyceum & Fountain Courtyard)*: Logic, habit-based moral excellence, and empirical wonder.
   - **Marcus Aurelius** *(Stoicism, Imperial Stoic Courtyard & Colonnade)*: Dichotomy of control, resilience, and inner tranquility.

3. **Intelligent Proximity Interaction**:
   - Proximity radius (~88px): Phaser checks distances locally on each frame to avoid flooding the API.
   - State machine (`IDLE` ➔ `LOADING_WISDOM` ➔ `SHOWING_WISDOM` ➔ `IDLE`) prevents duplicate and stale requests.
   - Facing logic: Philosophers turn to face the player when approached.
   - Dynamic speech bubble appears overhead displaying a randomly retrieved quote, philosopher name, and original citation.
   - Bubble disappears automatically when leaving proximity.
   - Non-repeating wisdom: The backend avoids serving the immediately prior quote for that philosopher if alternatives exist.

4. **Deep Philosophical Reflection Panel (Press `E`)**:
   - Pressing **`E`** (or clicking the speech bubble) opens the comprehensive dialogue panel.
   - Displays high-resolution classical cameo portrait, historical dates, philosophical school, and biography.
   - Callout box containing the full quote, canonical source work citation (*Plato's Apology*, *Meditations*, *Nicomachean Ethics*, etc.), and detailed philosophical interpretation.
   - **"Discover Another Thought" button**: Fetches another unique wisdom entry on-demand from SQLite with sound and visual feedback.

5. **Wisdom Journal & Discovery Counter**:
   - Automatically records discovered quotes into the player's personal collection.
   - Tracks unique philosophers visited (e.g. 4/4) and total wisdom items discovered.
   - Filterable by philosopher.

6. **Interactive Garden Mini-Map**:
   - Top-right radar showing the layout of the garden zones.
   - Blinking radar pulse indicating player position.
   - Golden pins for Socrates, Plato, Aristotle, and Marcus Aurelius.
   - Clicking a pin teleports/guides the player nearby.

7. **Zero-Dependency Procedural Audio**:
   - Built-in Web Audio API sound synthesizer producing ancient Greek lyre pentatonic chimes, soft footsteps, and UI clicks without external audio files.
   - Mute/Unmute audio toggle in the top HUD.

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│  HUD · Speech Bubbles · Reflection Modal · Mini-Map    │
│  Wisdom Journal · Main Menu · EventBus                 │
└──────────────────────────┬─────────────────────────────┘
                           │ (DOM Overlay & State)
┌──────────────────────────▼─────────────────────────────┐
│                 Phaser 3 Game Engine                   │
│  Player Physics · Animated Spritesheets · Camera       │
│  Static Obstacle Colliders · Proximity Detection       │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / REST API (Axios)
┌──────────────────────────▼─────────────────────────────┐
│                  FastAPI Backend                       │
│  Routers · Proximity Requests · Random Selection       │
│  Wisdom Service · Repeat Exclusion · Health Check      │
└──────────────────────────┬─────────────────────────────┘
                           │ SQLAlchemy ORM
┌──────────────────────────▼─────────────────────────────┐
│                  SQLite Database                       │
│             philosophy_world.db                        │
│  4 Philosophers · 44 Wisdom Entries & Explanations     │
└────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```text
philogame/
├── backend/
│   ├── database.py              # SQLite SQLAlchemy connection & session
│   ├── models.py                # Philosopher and Wisdom ORM models
│   ├── schemas.py               # Pydantic response and validation schemas
│   ├── main.py                  # FastAPI application with CORS and lifespan
│   ├── run.py                   # Uvicorn entry point
│   ├── requirements.txt         # Backend Python dependencies
│   ├── routers/
│   │   ├── philosophers.py      # /api/philosophers endpoints
│   │   └── wisdom.py            # /api/wisdom endpoints
│   ├── services/
│   │   └── wisdom_service.py    # Business logic & random retrieval with exclusion
│   ├── seed/
│   │   └── seed_data.py         # Seed dataset (4 philosophers, 44 wisdom items)
│   └── philosophy_world.db      # SQLite persistent database file
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js           # Vite config with /api reverse proxy
│   ├── public/
│   │   └── assets/
│   │       ├── characters/      # 4-direction 48x48 animated spritesheets
│   │       │   ├── player/
│   │       │   ├── socrates/
│   │       │   ├── plato/
│   │       │   ├── aristotle/
│   │       │   └── marcus_aurelius/
│   │       ├── portraits/       # 240x240 cameo portraits
│   │       └── environment/     # Grass, path, fountain, column, trees, benches
│   └── src/
│       ├── components/
│       │   ├── GameCanvas.jsx       # Phaser 3 container & life-cycle
│       │   ├── SpeechBubble.jsx     # Overhead quote bubble with tail & prompt
│       │   ├── PhilosopherModal.jsx # Deep dialogue modal (Press E)
│       │   ├── MiniMap.jsx          # Radar map with interactive pins
│       │   ├── WisdomJournal.jsx    # Discovered quotes collection drawer
│       │   ├── HUD.jsx              # Top bar, progress stats & controls reminder
│       │   └── MainMenu.jsx         # Classical introduction & status badge
│       ├── game/
│       │   ├── config.js            # Phaser arcade physics & display config
│       │   ├── GameScene.js         # World builder, pathways, camera & NPCs
│       │   ├── Player.js            # WASD/Arrows movement, animations & steps
│       │   ├── Philosopher.js       # NPC sprite, idle float, facing & badge
│       │   ├── InteractionManager.js# State machine proximity & API caller
│       │   └── EventBus.js          # React <-> Phaser event bridge
│       ├── services/
│       │   ├── api.js               # Axios client for FastAPI endpoints
│       │   └── audio.js             # Web Audio procedural sound synthesizer
│       ├── App.jsx                  # Main application state orchestrator
│       ├── App.css                  # Classical Greek styling & typography
│       └── main.jsx
│
├── generate_assets.py           # Asset generator script for crisp pixel art
├── test_game_backend.py         # Automated test suite for backend API & DB
└── README.md
```

---

## 🚀 Installation & Running

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

### 2. Backend Setup
From the project root:
```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already installed in your Python environment)
pip install -r requirements.txt

# Run the FastAPI server
python run.py
```
The FastAPI server will start at **`http://127.0.0.1:8000`**.
- Interactive Swagger UI Docs: **`http://127.0.0.1:8000/docs`**
- Health Check: **`http://127.0.0.1:8000/api/health`**

### 3. Frontend Setup
In a separate terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open **`http://127.0.0.1:5173`** in your web browser.

---

## 🛡️ Admin Council Panel (Philosopher & Wisdom Management)

Philosophy World includes a full-featured **Admin Council Panel** with authentication for managing philosophers, wisdom quotes, and game world coordinates in real-time.

### 🔑 Hardcoded Admin Credentials
- **Email / Username**: `admin@philosophy.world` *(or simply `admin`)*
- **Password**: `admin123`

### 🚪 How to Open the Admin Panel
1. **From Main Menu**: Click the **"Admin Council"** shield button.
2. **From In-Game Exploration**: Click the **"Admin"** shield button in the top HUD.

### ⚙️ Capabilities & CRUD Operations
- **Philosophers Management Tab**:
  - **Add Philosopher**: Enter name, philosophical school, historical era/years, description/bio, world coordinates (X, Y), and select a sprite avatar.
  - **Edit Philosopher**: Update name, bio, coordinates, or avatar.
  - **📷 Custom Face Upload & Replacement**: Click the **"Face"** button on any philosopher card to upload any photo (PNG/JPG).
    - **Replaces only the face**: The character keeps their classical toga body, walking animations, directional facing, and physics!
    - **Automatic Circle Crop**: High-resolution anti-aliased circular crop centered on the photo.
    - **Live Side-by-Side Previews**: Preview how the face looks on the **2D In-Game Character** (over the toga collar) and on the **Dialogue Cameo Frame**.
    - **Reset to Classical Face**: 1-click restore button to revert back to the ancient classical face at any time.
  - **Delete Philosopher**: Removes the philosopher with full cascade cleanup (all associated wisdom quotes are safely deleted).
- **Wisdom Archives Tab**:
  - **Add Wisdom**: Link a new quote to any philosopher with detailed philosophical reflection and citation source.
  - **Edit Wisdom**: Modify quote text, philosophical commentary, or citation.
  - **Delete Wisdom**: Remove single quotes from the SQLite database.
  - **Filter by Thinker**: Instantly narrow down quotes by selecting any philosopher.
- **⚡ Real-Time Live Sync**:
  - Any changes made in the Admin Panel immediately synchronize with the SQLite database and notify the running 2D Phaser world and React HUD via an internal reactive event bus without requiring a page reload.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Check backend health, SQLite status, and item counts |
| `GET` | `/api/philosophers` | Retrieve all 8 philosophers with world positions |
| `GET` | `/api/philosophers/{id}` | Retrieve detailed biography and all wisdom for a philosopher |
| `GET` | `/api/philosophers/{id}/wisdom` | Retrieve a random wisdom entry (supports `?exclude_id=X`) |
| `GET` | `/api/philosophers/{id}/wisdom/all` | Retrieve all wisdom entries for that philosopher |
| `GET` | `/api/wisdom/all` | Retrieve all wisdom entries across all philosophers |
| `POST` | `/api/admin/login` | Authenticate admin with email and password |
| `POST` | `/api/admin/philosophers` | Create a new philosopher |
| `PUT` | `/api/admin/philosophers/{id}` | Update an existing philosopher's attributes |
| `DELETE` | `/api/admin/philosophers/{id}` | Delete a philosopher and cascade remove all their wisdom |
| `POST` | `/api/admin/philosophers/{id}/wisdom` | Add a new wisdom quote for a philosopher |
| `PUT` | `/api/admin/wisdom/{id}` | Update wisdom quote text, explanation, or source |
| `DELETE` | `/api/admin/wisdom/{id}` | Delete a specific wisdom quote |
| `POST` | `/api/admin/philosophers/{id}/face` | Upload and apply custom face image (circle-cropped) |
| `DELETE` | `/api/admin/philosophers/{id}/face` | Reset philosopher face to classical default |

### Sample Wisdom Response (`GET /api/philosophers/1/wisdom`):
```json
{
  "id": 1,
  "philosopher_id": 1,
  "philosopher_name": "Socrates",
  "quote": "The unexamined life is not worth living.",
  "explanation": "True human fulfillment requires self-reflection and questioning one's own assumptions rather than living in passive acceptance of conventions.",
  "source": "Plato, Apology 38a"
}
```

---

## 🧪 Testing

To run the automated backend unit & integration tests:
```bash
python test_game_backend.py
```
This tests:
- Database connectivity & automatic seeding
- Health status endpoint
- Philosopher listings & coordinate properties
- Random wisdom retrieval across all philosophers
- Non-repeating exclusion logic
- 404 error handling for non-existent IDs
- All-wisdom feed completeness

---

## 🎨 Controls & Shortcuts

| Control | Action |
|---|---|
| `W` / `Arrow Up` | Move character upward |
| `S` / `Arrow Down` | Move character downward |
| `A` / `Arrow Left` | Move character left |
| `D` / `Arrow Right` | Move character right |
| **Walk near NPC** | Automatically triggers overhead speech bubble |
| `E` / Click Bubble | Opens the Deep Philosophical Reflection Modal |
| `Escape` | Closes any open modal/journal |
| **Mini-Map Click** | Fast-travel / walk directly to that philosopher |

---

## 📜 License
Educational & open-source exploration game.
All quotes attributed to canonical philosophical texts (*Apology*, *Republic*, *Nicomachean Ethics*, *Meditations*, etc.).
