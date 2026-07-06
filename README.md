# 🧙 Roll-Assistent

Ein digitaler Würfelassistent und Charakterbogen.

## ✨ Features

- **Talentproben** mit 3W20-Mechanik (DSA 5)
- **Einfache Würfelwürfe** (W4, W6, W8, W10, W12, W20)
- **Kampfwürfe** (Attacke, Parade, Ausweichen, Fernkampf, Initiative)
- **Charakterverwaltung**
  - Eigenschaften (MU, KL, IN, CH, FF, GE, KO, KK)
  - 59 DSA-Talente
  - Kampfwerte & Lebensenergie
- **Würfelhistorie** mit LocalStorage-Persistenz
- **Import/Export** von Charakterdaten (.dsa-Datei)
- **Dark/Light Mode** mit automatischer Systemerkennung
- **Mobile-optimiert** & Responsive
- **Offline-fähig & installierbar** (PWA) — funktioniert auch ohne Netz am Spieltisch

## 🚀 Quick Start
```bash
# Installation
npm install

# Development Server
npm run dev

# Build für Produktion
npm run build

# Deployment auf GitHub Pages
npm run deploy:full
```

Die App läuft standardmäßig auf `http://localhost:5173`

## 🛠️ Tech Stack

- **Framework:** React 19
- **Language:** TypeScript 5.8
- **Build Tool:** Vite 6
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Lucide React
- **Theme:** next-themes
- **Fonts:** @fontsource (selbst gehostet, DSGVO-konform)
- **Offline:** vite-plugin-pwa
- **Tests:** Vitest

## 🎲 Verwendung

### Talentprobe würfeln

1. Wähle ein Talent aus der Liste (z.B. "Klettern")
2. Die Eigenschaften werden automatisch gesetzt (MU/GE/KK)
3. Optional: Erschwernis/Erleichterung einstellen
4. Klicke auf "Würfeln"
5. Ergebnis zeigt QS (Qualitätsstufe) oder Misserfolg

### Charakterdaten sichern

1. Gehe zu **Charakter → Einstellungen**
2. Klicke auf "Charakter exportieren"
3. .dsa-Datei wird heruntergeladen
4. Import: "Charakter importieren" → Datei auswählen

## 🤝 Contributing

Contributions sind willkommen! Bitte öffne ein Issue oder Pull Request.

## 🐛 Bug Reports

Gefunden einen Bug? [Erstelle ein Issue](https://github.com/Blknight19/dsa-roll-assistant/issues/new)

---

Made with ⚔️ by [Blknight19](https://github.com/Blknight19)
