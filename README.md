# Shahnameh Cognitive OS

An interactive visualization of Ferdowsi's Shahnameh as a human cognitive operating system.

## The Concept

The Shahnameh is not just a poem — it's a map of human cognitive architecture. Characters represent:

- **Kings** → Cognitive modes (wisdom, ego, creativity)
- **Heroes** → Specialized subsystems (survival, intuition, potential)
- **Shadows** → Core moral governors (fear, guilt, shame)
- **Saboteurs** → Internal disruptors (manipulation, betrayal, chaos)

## Tech Stack

- React + TypeScript
- Vite
- D3.js (force-directed graph)
- Custom CSS (Norvan design system)
- VAPI (voice integration - pending)

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment

Push to GitHub, connect to Vercel:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/shahnameh-cognitive-os.git
git push -u origin main
```

Then import to Vercel → auto-deploys on push.

## Structure

```
src/
├── components/
│   ├── Graph/          # D3 force-directed graph
│   ├── InfoPanel/      # Character detail panel
│   ├── VapiOrb/        # Voice assistant button
│   ├── MobileView/     # Mobile card interface
│   ├── Background/     # Tesseract mesh pattern
│   └── Icons/          # SVG icons for archetypes
├── data/
│   └── shahnameh-graph.ts   # All nodes + connections
├── types/
│   └── graph.types.ts       # TypeScript definitions
└── App.tsx                  # Main app
```

## Features

- Force-directed graph with semantic relationship colors
- Click nodes to see character details
- Bilingual labels (English + Persian)
- Responsive: graph on desktop, card list on mobile
- Animated breathing nodes
- Connection legend

## Next Steps

- [ ] VAPI voice integration
- [ ] Expand character database
- [ ] Add search/filter on desktop
- [ ] Clustering for zoom levels

---

Built with Norvan Intelligence Architecture.
