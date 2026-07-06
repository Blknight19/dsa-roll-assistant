---
name: verify
description: Build, launch and drive the DSA Roll Assistant end-to-end to verify changes at the UI surface (Playwright against vite preview).
---

# Verify: DSA Roll Assistant

## Build & Launch

```powershell
npm run build          # tsc -b && vite build (PWA sw.js wird mitgebaut)
npm run preview        # serviert dist auf http://localhost:4173/dsa-roll-assistant/
```

Die Basis-URL enthält den gh-pages-Pfad: `http://localhost:4173/dsa-roll-assistant/`.

## Drive (Playwright)

Playwright ist keine Projekt-Dependency — bei Bedarf `npm install --no-save playwright`
(Chromium liegt meist schon in `%LOCALAPPDATA%\ms-playwright`). Skript außerhalb des
Repos muss Playwright per absolutem Pfad importieren:
`import { chromium } from 'file:///.../dsa-roll-assistant/node_modules/playwright/index.mjs'`.

### Deterministische Würfe

`src/utils/dice.ts` nutzt `Math.random`. Vor dem Laden per `context.addInitScript`
eine Queue injizieren:

```js
window.__rolls = [];
const orig = Math.random.bind(Math);
Math.random = () => (window.__rolls.length ? window.__rolls.shift() : orig());
// Wert v auf einem Wsides erzwingen: (v - 1) / sides + 0.001
```

### localStorage-Seed

Persistenz-Key: `dsa-app-state` (v2: `{ version: 2, attributes, talents: [{id,value}],
combat, history, settings }`; Legacy v1 = roher Slice-Dump ohne `version`).
**Achtung:** `addInitScript` läuft bei jedem Reload — nur seeden, wenn der Key `null`
ist, sonst überschreibt der Seed den von der App geschriebenen v2-Blob und
Persistenz-Checks schlagen fälschlich fehl. Saves sind ~500 ms debounced: vor dem
Auslesen `waitForTimeout(800)`.

### Nützliche Selektoren

- Tabs: `getByRole('tab', { name: 'Talentprobe' | 'Kampf' | ... })` (5 Top-Level,
  Charakter hat 3 Sub-Tabs: Eigenschaften/Talente/Einstellungen)
- Talent wählen: combobox "Talent wählen" → `getByPlaceholder('Talent suchen...')`
  → `getByRole('option', { name: ... })`
- Kampf-Würfe: `getByRole('button', { name: 'Attacke würfeln' })` etc.
- Settings-Toggle: `getByRole('switch')` (Bestätigungswurf, default an)
- PropertyNumber: `getByRole('button', { name: '<Label> verringern/erhöhen' })`;
  ohne Label heißen sie "Wert verringern/erhöhen" — auf dem Talentprobe-Screen ist
  `input[type=number]` nth(0) = Modifikator, nth(1) = Talentwert
- **Strict-Mode-Falle:** Ergebnistexte stehen zusätzlich in einer `sr-only`
  aria-live-Region — `getByText(..., { exact: true })` verwenden.

### Flows, die sich lohnen

1. Talentprobe mit Modifikator −2 → Label "Erschwernis", Berechnung `X − 2 − Wurf`
2. TaW 20, Würfe klein → QS-Hero zeigt 6 (Cap), nicht 7
3. Nach Wurf Modifikator ändern → Berechnung/QS unverändert (Snapshot)
4. Kampf: d20=1 + Bestätigung ≤/> Zielwert → Krit vs. "Gelungen (Krit nicht bestätigt)"
5. Legacy-Blob seeden → Talente/Attribute migriert, Blob wird als v2 zurückgeschrieben
6. `navigator.serviceWorker.ready` abwarten → `context.setOffline(true)` → Reload rendert
