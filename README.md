# Hades' Pomegranates

> *“Pick one pomegranate.  
> Give'em a taste.  
> Decide  
> whether you should stay.”*

**Hades' Pomegranates** is an ethereal, romantic Underworld interactive character directory inspired by the myth of Hades and Persephone. It is built strictly with **pure HTML5, modern CSS3, and vanilla JavaScript**—with zero build tools, zero dependencies, and 100% static compatibility with **GitHub Pages**.

---

## 🏛️ Directory Structure

```
hades-pomegranates/
├── index.html            # Main HTML structure (The Garden, Character Profile, Archive, Particle canvas)
├── style.css             # Ethereal Romantic Underworld styles, palette, typography, animations
├── script.js             # Interaction logic, fruit physics, data mapping, audio control, routing
├── characters.json       # Deterministic character catalog, Google AI Studio links & fruit mappings
├── README.md             # Complete guide & documentation
└── assets/
    ├── .gitkeep
    └── music.mp3         # Place your local atmospheric background music file here
```

---

## 🎵 Background Music (`assets/music.mp3`)

- **Location:** Put your audio file at `assets/music.mp3`.
- **Minimal Control:** A discreet `♫ SOUND` toggle is located in the top-right navigation bar.
- **Initial State:** Starts **OFF** to respect browser policies and user choice.
- **Behavior:**
  - Clicking toggles the music **ON** or **OFF**.
  - Default volume is set to `0.25` and loops continuously.
  - Pausing keeps your playback position; resuming continues seamlessly.
  - **Persistent across navigation:** Changing views (Garden ➔ Character Profile ➔ Return ➔ Archive) does **not** restart or interrupt the music track.
  - Full keyboard accessibility with dynamic `aria-label` ("Turn music on" / "Turn music off").

---

## ✨ Features & Mechanics

1. **Deterministic Pomegranate Tree:**
   - Crafted as an organic inline vector SVG with twisted boughs and gentle swaying sage leaves.
   - Pomegranates have botanical differences in size, angle, calyx crown, and lighting.
   - **Never Random:** Each fruit corresponds to a deterministic character:
     - `pomegranate-01` ➔ **Lena** (The Dreamer)
     - `pomegranate-02` ➔ **Kaelen** (The Melancholic Poet)
     - `pomegranate-03` ➔ **Lysandra** (The Weaver of Shadows)
     - `pomegranate-04` ➔ **Valen** (The Golden Exile)
     - `pomegranate-05` ➔ **Callista** (The Keeper of Seeds)
     - `pomegranate-06` ➔ **Theron** (The Ferryman's Apprentice)
2. **Organic Physics on Click:**
   - The fruit gently shakes on its stem, detaches from the bough, and falls downward with natural gravity.
   - The tree garden scene softly dims and blurs in the background.
   - An unhurried fade/slide transition brings in the character's story.
3. **Pure Editorial Character Profile (No Images):**
   - Centered editorial layout highlighting character name, age, role, and literary biography.
   - **Exclusive CTA:** **“Taste them.”** is the only call-to-action, opening that character's Google AI Studio prompt experience in a new tab (`target="_blank" rel="noopener noreferrer"`).
   - Discreet **“Return to the garden”** navigation.
4. **The Archive (Secondary View):**
   - Pure typography editorial cards.
   - Instant search by character name or keyword.
   - Filter chips by character role.
   - Clicking any card opens the exact same character profile.
5. **Accessibility & Polish:**
   - Full keyboard navigation (Tab through fruits, press `Enter` or `Space` to pick).
   - Visible focus indicators.
   - Full support for `prefers-reduced-motion`.
   - Subtle floating golden spores and Underworld mist particle canvas.

---

## 🚀 How to Deploy to GitHub Pages (Step-by-Step)

### Step 1: Create a GitHub Repository
1. Log in to [GitHub](https://github.com/).
2. In the top-right corner, click **+** and select **New repository**.
3. Name your repository (for example: `hades-pomegranates`).
4. Set visibility to **Public** (required for free GitHub Pages).
5. Leave "Add a README file" unchecked (we already have one).
6. Click **Create repository**.

### Step 2: Push your Files to GitHub
Open your terminal (PowerShell or Bash) in the project directory:

```bash
cd "d:\Khánh Quỳnh\hades-pomegranates"

# Initialize git if not already initialized
git init

# Add all files
git add .

# Commit files
git commit -m "Update Hades' Pomegranates: text-focused profiles and ambient music"

# Set branch to main
git branch -M main

# Link your GitHub repository (replace USERNAME and REPO with yours)
git remote add origin https://github.com/USERNAME/hades-pomegranates.git

# Push code to GitHub
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub.
2. Click **Settings** (tab at the top).
3. In the left sidebar, click **Pages** (under the "Code and automation" section).
4. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`.
   - **Branch**: Select `main` (or `master`) and folder `/ (root)`.
5. Click **Save**.
6. Wait 1–2 minutes. Refresh the page until you see:
   > *"Your site is live at https://USERNAME.github.io/hades-pomegranates/"*

---

## ✍️ How to Customize Characters & Google AI Studio Links

All character information is stored in **one single file**: `characters.json`. You do **not** need to touch `script.js` or `index.html` to update characters!

### Structure of `characters.json`:

```json
[
  {
    "id": "lena",
    "name": "Lena",
    "age": 20,
    "role": "The Dreamer",
    "bio": "A quiet soul who finds comfort in forgotten alcoves of the grove...",
    "pomegranateId": "pomegranate-01",
    "googleAIStudioUrl": "https://aistudio.google.com/prompts/new_chat?character=lena"
  }
]
```

### How to update:
1. **Character Name, Age, Role, & Bio:**
   - Simply edit the `"name"`, `"age"`, `"role"`, and `"bio"` strings in `characters.json`.
2. **Google AI Studio Link:**
   - In Google AI Studio, configure your character prompt and click **Share** or copy the URL.
   - Paste the link directly into `"googleAIStudioUrl"`.
   - When the visitor clicks **“Taste them.”**, it opens this exact link.

---

## 🎨 Color Palette Reference

| Swatch | Color Name | Hex Code | Purpose |
|---|---|---|---|
| 🪶 | Warm Ivory | `#F6EFE5` | Primary background, natural paper tone |
| 🌸 | Dusty Rose | `#C98F92` | Soft accent, borders, botanical highlights |
| 🍷 | Pomegranate Red | `#9E3040` | Interactive fruits, hover states, CTA accents |
| 🍇 | Soft Burgundy | `#672D38` | Headings, titles, calyx crowns |
| 🪻 | Muted Plum | `#76566B` | Deep shadows, secondary accents |
| ⚜️ | Antique Gold | `#B89B68` | Focus rings, botanical filigree, spore embers |
| 🍃 | Soft Sage Green | `#71805E` | Leaves, stems, organic Underworld flora |
