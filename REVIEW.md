# Review: DSA Roll Assistant

Scope: full source read (2026-07-05, branch `redesign`). Built bundle measured from `dist/`. No RULES.md exists in the repo, so DSA findings are checked against DSA 5 core rules with uncertainty flagged.

## 1. UX for the real use case (phone, one hand, mid-session)

### 1.1 HIGH — Combat rolls are the deepest-buried action in the app
**Files:** `src/App.tsx`, `src/components/Character.tsx:30-33`, `src/components/Combat.tsx`
Attack/Parade/Ausweichen — the rolls made under the most time pressure — require: tap **Charakter** → tap **Kampf** sub-tab → scroll past the Lebensenergie card → tap Würfeln. That's 3 taps + a scroll, vs 1 tap for a talent check. LeP tracking (the thing you update after every hit) is buried the same way.
**Fix:** Promote Kampf to a top-level tab (5 icon tabs fit fine on mobile) and move the Kampfwerte grid above the LeP card, or make the roll buttons a sticky row.

### 1.2 HIGH — Switching tabs wipes in-progress roll state
**Files:** `src/App.tsx:41-73`, `src/components/TalentRoll.tsx` (all `useState`)
Radix Tabs unmounts inactive content by default, and TalentRoll keeps everything (selected talent, attributes, modifier, last result) in local `useState`. Check the Historie tab and come back → your selected talent, modifier and last result are gone, reset to MU/KL/IN defaults. Mid-session this is a repeated small betrayal.
**Fix:** Either `forceMount` + hide inactive tab panels, or lift "current probe" state into a small Redux slice / parent state that survives unmounting.

### 1.3 HIGH — The roll button and result are below the fold on the main screen
**File:** `src/components/TalentRoll.tsx:142-306`
Talentprobe is a stack of four full-width `p-6` cards (talent picker, 3 attribute boxes, modifier, TaW) before the Würfeln button, and the result card renders *below* the button. On a phone you: pick talent (top), scroll ~2 screens, tap Würfeln, then the result appears even further down. The most common loop in the app (roll → read result) always involves scrolling.
**Fix:** Compact the pre-roll form (the 3 attributes rarely need editing once a talent is chosen — collapse them into one row of read-only chips with an "edit" affordance), make Würfeln a sticky bottom bar (thumb zone), and show the result at the top or auto-scroll it into view.

### 1.4 MEDIUM — QS is buried in a sentence; the biggest number on screen is the least-quoted one
**File:** `src/components/TalentRoll.tsx:337-372`
At the table the GM asks "QS?". The app renders "Erfolg! (QS 3)" as a title, then the *remaining FP* as the huge `text-3xl` number. FP is an intermediate value; QS is the currency of DSA 5.
**Fix:** Make QS the hero number (large, centered), FP and the per-die breakdown secondary.

### 1.5 MEDIUM — Icon-only tabs on mobile are ambiguous
**Files:** `src/App.tsx:45-57`, `src/components/Character.tsx:24-36`
Labels are `hidden sm:inline`, so on phones you get four unlabeled icons (Scroll vs Dices vs History reads as three variations of "rolling something"). Doubly so for the nested Charakter sub-tabs.
**Fix:** Show tiny text labels under the icons (`text-[10px]`) — bottom-nav style — instead of hiding them.

### 1.6 MEDIUM — Stepper-only number entry is slow for setup and mid-fight LeP changes
**Files:** `src/components/PropertyNumber.tsx`, `src/components/Combat.tsx:137-151`
Setting KK 8→14 is six taps on a 32 px button. Taking 7 damage is seven taps on "−". No long-press repeat, and typing means focusing a small input one-handed.
**Fix:** For LeP specifically, add quick "−1 / −3 / −5"-style damage buttons or a "damage taken" input; for attributes add press-and-hold auto-repeat.

### 1.7 NICE-TO-HAVE — Native `confirm()` dialogs for destructive actions
**Files:** `src/components/RollHistory.tsx:13`, `src/components/ImportExportSettings.tsx:22`
Works, but jarring against the themed UI, and the browser dialog is easy to fat-finger.
**Fix:** Use the already-installed Radix dialog (`ui/dialog.tsx` exists but is only used internally by cmdk).

### 1.8 NICE-TO-HAVE — TaW edits during a probe don't persist to the character
**File:** `src/components/TalentRoll.tsx:47,291`
Changing Talentwert on the roll screen is local-only; users may expect it to update the sheet (or at least be told it won't). Intentional: the GM often dictates a one-off TaW for a probe, so silently overwriting the sheet would surprise users.
**Fix (decided):** Keep the field local and label it "(nur für diese Probe)". When the entered value differs from the character sheet, show a small, unobtrusive "In Charakterbogen übernehmen" action next to the field for the rare permanent change (e.g. after a Steigerung). Explicitly **not** wanted: auto-dispatching `updateTalent` on change, or a confirmation dialog.

## 2. Visual design & consistency

### 2.1 HIGH — Vite-template layout hacks are doing your layout
**Files:** `src/index.css:83-92` (`body { display:flex; place-items:center }`), `src/App.css:1-5` (`#root { text-align:center }`)
Everything in the app is centered because `text-align: center` is inherited from `#root` — a leftover from the Vite starter, not a design decision. It's why body copy, descriptions, and history entries all sit centered, which reads templated. The flex-centered `body` is also a classic source of top-clipping bugs on small viewports.
**Fix:** Delete both hacks; opt into centering per-component where intended.

### 2.2 HIGH — Global `button` base styles fight the design system
**File:** `src/index.css:129-139`
Element-level `button { @apply px-4 py-2 border ... }` leaks padding/borders into every unstyled button (Radix internals, cmdk items), and `button:focus` (not just `:focus-visible`) draws the focus ring on every tap/click — permanent ring noise on mobile.
**Fix:** Delete the global button rule; shadcn's `buttonVariants` already covers it. Keep only `:focus-visible` styling.

### 2.3 MEDIUM — Talent table names render at `text-2xl`
**File:** `src/components/Character.tsx:101`
A `text-sm` table with `text-2xl` name cells looks broken — rows are twice as tall as needed, so 59 talents means a lot of scrolling.
**Fix:** `text-base` (Crimson Text needs a touch more than `sm`), keep rows compact.

### 2.4 MEDIUM — Emoji and Lucide icons mixed as iconography
**Files:** `src/components/Combat.tsx:46-52`, `src/components/TalentRoll.tsx:103-104`, `src/App.tsx:23`
Result strings and combat labels use ✅❌⭐⚠️⏱️ and — notably — **✈️ an airplane for Ausweichen** in a medieval fantasy app. Emoji render differently per platform and clash with the otherwise consistent Lucide set (Combat.tsx even imports `Footprints` for the same concept).
**Fix:** Lucide-only in UI; keep history `result` strings plain text.

### 2.5 MEDIUM — `bg-parchment` is defined twice with different meanings
**Files:** `src/index.css:157-161` (component class: color + noise), `tailwind.config.js:102` (backgroundImage utility: noise only)
Same class name generated in two layers; which properties win depends on layer order. Currently it happens to work, but it's a trap — anyone touching either definition changes cards app-wide in non-obvious ways.
**Fix:** Delete the `backgroundImage.parchment` entry from the Tailwind config; keep the single component class.

### 2.6 MEDIUM — Hardcoded `class="dark"` on `<html>` vs. next-themes `defaultTheme="system"`
**Files:** `index.html:2`, `src/main.tsx:12`
Light-system users get a dark first paint that flips after hydration. (See also 4.8 — ThemeToggle then force-overrides "system" to "dark", so the README's advertised system detection never actually works.)
**Fix:** Remove the hardcoded class and let next-themes' inline script own it.

### 2.7 NICE-TO-HAVE — SimpleRoll result card is always green
**File:** `src/components/SimpleRoll.tsx:117-118`
`variant="success"` for any plain dice roll. A rolled 2 on a W20 shows in "success" green; green should be reserved for actual success semantics (as TalentRoll/Combat do).
**Fix:** Use `parchment`/default variant for Einzelwurf results.

### 2.8 NICE-TO-HAVE — Default Vite favicon and `title` mismatch
**Files:** `index.html:5`, `public/vite.svg`
The Vite logo as favicon/home-screen icon undercuts the otherwise committed theme.
**Fix:** A d20 or ⚔️-style SVG favicon + proper `apple-touch-icon`.

## 3. Accessibility

### 3.1 HIGH — Key status colors fail contrast in light mode
**Files:** `tailwind.config.js:43-57`, `src/components/TalentRoll.tsx:126-129,322,340`, `src/components/Combat.tsx:102-105`
On the light parchment background: `text-critical` (#fbbf24) ≈ 1.7:1 — "Kritischer Erfolg!", the most celebratory message in the app, is nearly invisible in light mode. `text-success` (#10b981) ≈ 2.5:1 for the "Erfolg! (QS x)" headline; `text-amber-400`/`text-sky-400` (Erschwernis/Erleichterung) ≈ 2:1. All fail WCAG AA — and phones at a gaming table are often in bright rooms.
**Fix:** Use the existing `-dark` shades in light mode (`text-critical-dark dark:text-critical-light` pattern, as DiceIcon already does correctly) and pick darker amber/sky tokens.

### 3.2 HIGH — Unlabeled controls: tabs and steppers invisible to screen readers
**Files:** `src/App.tsx:43-58`, `src/components/PropertyNumber.tsx:52-88`
On mobile the tab labels are `display:none`, so tabs have no accessible name at all. PropertyNumber's +/− buttons have no `aria-label`, and the visible label isn't associated with the input (`<label>` without `htmlFor`).
**Fix:** `aria-label` on each TabsTrigger and on the +/− buttons (`aria-label="MU verringern"`), `htmlFor`/`id` pairing on the input.

### 3.3 HIGH — Stepper tap targets are 32 px, the app's primary control
**File:** `src/components/PropertyNumber.tsx:59,84` (`h-8 w-8`)
Below both Apple's 44 pt and Android's 48 dp guidance, for the control you hit most (LeP, attributes, modifier), one-handed.
**Fix:** `h-11 w-11` minimum, or keep visual size and extend the hit area with padding/`before:` overlay.

### 3.4 MEDIUM — `lang="en"` on a German app
**File:** `index.html:2`
Screen readers pronounce German text with English phonetics; browser translate prompts misfire.
**Fix:** `lang="de"`. One character, real impact.

### 3.5 MEDIUM — Roll results are never announced
**Files:** `src/components/TalentRoll.tsx:309`, `src/components/Combat.tsx:223`, `src/components/SimpleRoll.tsx:116`
Result cards appear visually with no `aria-live`, so a screen-reader user taps Würfeln and hears nothing.
**Fix:** Wrap the result summary (e.g. "Erfolg, QS 3") in an `aria-live="polite"` region.

### 3.6 NICE-TO-HAVE — Animations ignore `prefers-reduced-motion`
**Files:** `src/index.css:199-264`, `tailwind.config.js:113-133`
Shake/glow/float/bounce all run unconditionally.
**Fix:** Wrap in `@media (prefers-reduced-motion: no-preference)` or use Tailwind's `motion-safe:` prefix.

## 4. Code quality & architecture

### 4.1 HIGH — `importCharacter` validates `max` LeP against the wrong field
**File:** `src/utils/importCharacter.ts:47-48`
```ts
if (typeof current === 'number') dispatch(updateLifeStat({ current }));
if (typeof current === 'number') dispatch(updateLifeStat({ max }));   // checks current, not max
```
A file without `current` never restores `max`; a corrupt `max` (string) is dispatched unchecked. Copy-paste bug, silent data corruption on import.
**Fix:** Check `typeof max === 'number'`.

### 4.2 HIGH — localStorage state is loaded with no validation or migration
**File:** `src/store/index.ts:8-30`
`preloadedState: loadState()` replaces entire slices with whatever was persisted. Consequences: (a) users who ever used the app will **never see talents you add to `initialState`** — their persisted `talents` slice wins forever; (b) any shape change in a slice crashes or misbehaves with stale data; (c) a hand-edited/corrupt value flows straight into reducers.
**Fix:** Version the persisted blob, and merge per-slice (e.g. merge persisted talent values into the code's talent list by id — the same shape the export file already uses).

### 4.3 HIGH — Zero tests on the rules engine
**Files:** `src/components/TalentRoll.tsx:78-119`, `src/components/Combat.tsx:45-95`
The QS math, crit/botch detection, and modifier handling live inline in components with no tests. Rule regressions (several exist today — see §6) are invisible.
**Fix:** Extract `evaluateTalentCheck(attrs, taw, mod, dice)` and `evaluateCombatRoll(...)` into pure functions in `src/utils/` and unit-test them (Vitest is a natural fit with Vite). This also fixes 4.4/4.5 as a side effect.

### 4.4 MEDIUM — Result panel recomputes from live state, not the rolled snapshot
**File:** `src/components/TalentRoll.tsx:376-395`
The "Berechnung" breakdown renders `{firstProperty} - {modifier} - {rollResult[0]}` from *current* component state, while `talentResults` was computed at roll time. Change the modifier or an attribute after rolling and the displayed math contradicts the stored per-die results and the (already-dispatched) history entry.
**Fix:** Snapshot `{attrs, modifier, taw, dice, results}` into one state object at roll time and render only from it.

### 4.5 MEDIUM — TalentRoll is a triplicated component
**File:** `src/components/TalentRoll.tsx:39-44,192-259`
first/second/third attribute → 6 useState hooks + 3 copy-pasted 25-line Select blocks. This is where the `min={-100}` typo (line 258: the third attribute allows −100 while the others floor at 0) crept in — copy-paste variance is already producing bugs.
**Fix:** `useState<{attr: AttributeKey; value: number}[]>` + one mapped block; remove the stray `min={-100}`.

### 4.6 MEDIUM — `updateCombatStat` can assign a number over the `life` object
**File:** `src/store/combatSlice.ts:35-37`
`key: keyof CombatState` includes `'life'`, and the `as number` cast silences the type error. One bad call site turns `state.combat.life` into a number and the health bar into NaN.
**Fix:** `key: Exclude<keyof CombatState, 'life'>` — removes the cast too.

### 4.7 MEDIUM — Unbounded history + full-state serialization on every action
**Files:** `src/store/rollSlice.ts:43-45`, `src/store/index.ts:52-54`
History grows forever, and `store.subscribe` JSON-stringifies the entire state (including all history) on every keystroke in any PropertyNumber input.
**Fix:** Cap history (e.g. keep last 100 in the reducer) and debounce `saveState` (~500 ms).

### 4.8 MEDIUM — ThemeToggle calls `setTheme` during render and kills system theme
**File:** `src/components/ThemeToggle.tsx:14`
`if (!theme || !['light','dark'].includes(theme)) setTheme('dark')` runs in the render body (a side effect, doubled under StrictMode) and — because the initial theme is `'system'` — permanently overrides system detection to dark on first render. The README advertises "automatische Systemerkennung"; this line defeats it.
**Fix:** Delete the line; toggle with `resolvedTheme` instead of `theme`.

### 4.9 NICE-TO-HAVE — Dead code and dead dependencies
**Files:** `src/components/ui/tooltip.tsx`, `ui/label.tsx` (unused → `@radix-ui/react-tooltip`, `@radix-ui/react-label` removable), commented-out mock generator in `rollSlice.ts:4-23`, commented reducers in `talentsSlice.ts:87-98`, `roll3D20` duplicating `roll('3d20')` in `dice.ts`, `App.css` (only a leftover comment + hack), and `src/types/rpg-dice-roller.d.ts` shadowing the library's own richer types. Also: `crypto.randomUUID()` in two components vs `nanoid()` in Combat — pick one.
**Fix:** Delete the lot; moot once 5.1 lands.

### 4.10 NICE-TO-HAVE — `loadingSlice` + full-screen overlay for instant operations
**Files:** `src/store/loadingSlice.ts`, `src/components/LoadingOverlay.tsx`, `src/utils/resetLocalStorage.ts:8` (artificial 300 ms `setTimeout`)
A global Redux loading state and dramatic overlay guard a synchronous JSON parse and a localStorage delete. Over-engineering that adds latency by design.
**Fix:** Drop the slice/overlay; sonner toasts already cover feedback.

## 5. Performance & bundle size

### 5.1 HIGH — 1.07 MB JS (308 KB gzip) to roll a d20; mathjs is in your bundle
**Files:** `package.json` (`rpg-dice-roller`), `src/utils/dice.ts`, `dist/assets/index-*.js`
`rpg-dice-roller` exists to parse arbitrary dice expressions and drags in **mathjs**. The app calls it with exactly two static patterns (`3d20`, `NdX`). This is by far the biggest lever in the codebase — likely >60 % of the bundle for functionality replaceable by:
```ts
const d = (sides: number) => Math.floor(Math.random() * sides) + 1;
```
On a mid-range phone with table Wi-Fi, that's seconds of load time.
**Fix:** Remove the dependency (and the custom `.d.ts` and README mention); 5 lines of code replace it.

### 5.2 MEDIUM — Render-blocking Google Fonts via CSS `@import` (+ GDPR)
**File:** `src/index.css:3`
`@import` inside the stylesheet serializes: CSS → fonts.googleapis.com CSS → fonts.gstatic.com files, blocking first render on bad connections — and offline at the table, the theme fonts silently vanish. Separately: German courts (LG München, 2022) have treated embedding Google Fonts as a GDPR violation, which matters for a German-audience app.
**Fix:** Self-host both fonts (`@fontsource/cinzel`, `@fontsource/crimson-text`) — faster, offline-safe, compliant.

### 5.3 MEDIUM — No offline support for an at-the-table app
**Files:** `vite.config.ts`, `index.html`
The core promise is "works mid-session"; game venues have terrible connectivity. All state is already local — the app is one `vite-plugin-pwa` away from being installable and fully offline.
**Fix:** Add `vite-plugin-pwa` with a manifest + precache (pairs with 5.2 and the favicon fix in 2.8).

### 5.4 MEDIUM — History animation delay scales with list length
**File:** `src/components/RollHistory.tsx:93`
`animationDelay: index * 50ms` on every entry: with 100+ rolls (unbounded — see 4.7), the bottom of the list stays invisible for 5+ seconds on every visit to the tab.
**Fix:** Cap the stagger (`Math.min(index, 10) * 50`) or animate only the newest entry.

### 5.5 NICE-TO-HAVE — 59-row talent table re-renders wholesale per keystroke
**File:** `src/components/Character.tsx:91-125`
Every `updateTalent` dispatch produces a new array, re-rendering all 59 rows. Fine on desktop, sluggish on cheap phones.
**Fix:** Extract a memoized `TalentRow` (or ignore until it's actually felt — measure first).

## 6. DSA rule correctness

No RULES.md in the repo; checked against DSA 5 core rules (README says "3W20-Mechanik (DSA 5)"). The talent list itself is in good shape — all 59 talents match the DSA 5 core list, and every attribute triple I spot-checked (all 59) is correct. The core probe math (Erschwernis on each attribute, FP loss = shortfall per die, FP ≥ 0 with 0 FP = success at QS 1) is right. The issues are at the edges:

### 6.2 HIGH — Combat crits/botches skip the confirmation roll
**File:** `src/components/Combat.tsx:69-81`
A single 1 is treated as an auto-crit and a single 20 as an auto-botch. In DSA 5 core, both require a **Bestätigungswurf** (a second d20 against the same value) to confirm; unconfirmed, a 1 is just a hit and a 20 just a miss. As written, the app materially changes combat odds (5 % botch chance per parry adds up fast). Confident about the core rule — but some tables house-rule this away, so:
**Fix:** Roll and display the confirmation d20 automatically ("Krit? Bestätigung: 14 ✅"), ideally behind a settings toggle.

### 6.4 MEDIUM — Opposite modifier sign conventions between Talent and Combat screens
**Files:** `src/components/TalentRoll.tsx:124-130` (positive = Erschwernis), `src/components/Combat.tsx:100-106` (negative = Erschwernis)
Not a rules error per se — each screen is internally consistent — but the same word means opposite signs in two places, so a player who uses both will inevitably roll with an inverted modifier. DSA 5 writes maluses as negative numbers; the Combat convention matches the book.
**Fix:** Standardize on the book's convention (negative = Erschwernis) everywhere, and flip the TalentRoll math/labels accordingly. Arguably belongs in §1 as a blocker for trust in results.

Explicitly, so nothing gets lost in the flip (Combat.tsx stays untouched — it already matches the book):
- **Math:** Change `property - modifier - roll` to `property + modifier - roll` in the three result lines (`TalentRoll.tsx:90-92`). An Erschwernis of −2 then has exactly the same numeric effect as +2 today — FP shortfall, QS, crit/botch handling all stay identical.
- **Same flip in the displays:** The "Berechnung" breakdown (`TalentRoll.tsx:380-388`) and the modifier text in the history entry (`TalentRoll.tsx:100`) render the old formula/sign and must be updated together with the math, or the shown calculation contradicts the result.
- **Labels:** Keep the Erschwernis/Erleichterung indicator on **both** screens. Only TalentRoll's condition inverts (`modifier < 0` → "Erschwernis" amber, `modifier > 0` → "Erleichterung" sky, `TalentRoll.tsx:124-130`), making it identical to `Combat.tsx:100-106`.
- **Formatting:** Render negative modifiers readably in the breakdown — `MU: 13 − 2 − 8`, not `13 + -2 - 8`.


### 6.6 NICE-TO-HAVE — Missing table-assist opportunities (not errors)
Schmerzstufen markers at ¼-LeP thresholds on the health bar;

Also confirmed correct: double-20 botch / double-1 crit detection for talent checks; INI = stored base + 1W6; FP 0 = success.

## If you only fix five things

1. **Unify the modifier sign convention** (6.4) — the app currently teaches users two opposite meanings of Erschwernis; wrong rolls at the table are worse than no app.
2. **Drop `rpg-dice-roller`** (5.1) — ~5 lines of `Math.random` remove mathjs and most of a 308 KB-gzip bundle; biggest single win for phone load time.
3. **Restructure for the mid-fight path** (1.1 + 1.3) — Kampf as a top-level tab, sticky Würfeln button, result visible without scrolling, QS as the hero number.
4. **Correct the rules edges** (6.2) — cap QS at 6, add combat confirmation rolls (toggleable) — and pin it all down with the pure-function extraction + tests from 4.3.
5. **Light-mode contrast + labels pass** (3.1, 3.2, 3.3, 3.4) — darker status colors on parchment, `aria-label`s for icon tabs and steppers, 44 px tap targets, `lang="de"`.

*(Honorable mention: the import `max`-LeP bug (4.1) and localStorage migration (4.2) — silent data loss beats everything above the moment it happens to someone.)*
