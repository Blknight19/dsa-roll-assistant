import { describe, expect, it } from 'vitest';
import { evaluateCombatRoll, evaluateTalentCheck } from './rules';

describe('evaluateTalentCheck', () => {
  it('gelingt ohne FP-Verlust, wenn alle Würfel unter den Eigenschaften liegen', () => {
    const r = evaluateTalentCheck([13, 13, 13], 7, 0, [5, 10, 13]);
    expect(r.perDieShortfall).toEqual([0, 0, 0]);
    expect(r.fp).toBe(7);
    expect(r.success).toBe(true);
    expect(r.qs).toBe(3);
  });

  it('zieht pro Würfel nur den Fehlbetrag ab', () => {
    const r = evaluateTalentCheck([11, 12, 13], 6, 0, [14, 12, 20]);
    expect(r.perDieShortfall).toEqual([-3, 0, -7]);
    expect(r.fp).toBe(-4);
    expect(r.success).toBe(false);
  });

  it('FP 0 ist ein Erfolg mit QS 1', () => {
    const r = evaluateTalentCheck([10, 10, 10], 4, 0, [12, 12, 10]);
    expect(r.fp).toBe(0);
    expect(r.success).toBe(true);
    expect(r.qs).toBe(1);
  });

  it.each([
    [1, 1],
    [3, 1],
    [4, 2],
    [6, 2],
    [7, 3],
    [10, 4],
    [13, 5],
    [16, 6],
  ])('FP %i ergibt QS %i', (fp, qs) => {
    const r = evaluateTalentCheck([15, 15, 15], fp, 0, [10, 10, 10]);
    expect(r.fp).toBe(fp);
    expect(r.qs).toBe(qs);
  });

  it('deckelt QS bei 6, auch bei sehr hohem Talentwert', () => {
    const r = evaluateTalentCheck([15, 15, 15], 25, 0, [10, 10, 10]);
    expect(r.fp).toBe(25);
    expect(r.qs).toBe(6);
  });

  it('behandelt negative Modifikatoren als Erschwernis', () => {
    // Erschwernis -2 senkt die effektive Eigenschaft: 13 - 2 = 11 < Wurf 12
    const r = evaluateTalentCheck([13, 13, 13], 5, -2, [12, 5, 5]);
    expect(r.perDieShortfall).toEqual([-1, 0, 0]);
    expect(r.fp).toBe(4);
  });

  it('behandelt positive Modifikatoren als Erleichterung', () => {
    const r = evaluateTalentCheck([10, 10, 10], 5, 3, [13, 5, 5]);
    expect(r.perDieShortfall).toEqual([0, 0, 0]);
    expect(r.fp).toBe(5);
  });

  it('erkennt den kritischen Erfolg bei zwei Einsen, auch mit negativen FP', () => {
    const r = evaluateTalentCheck([8, 8, 8], 0, -10, [1, 1, 20]);
    expect(r.special).toBe('krit');
    expect(r.success).toBe(true);
  });

  it('erkennt den Patzer bei zwei Zwanzigern, auch mit positiven FP', () => {
    const r = evaluateTalentCheck([20, 20, 20], 10, 0, [20, 20, 1]);
    expect(r.special).toBe('patzer');
    expect(r.success).toBe(false);
  });

  it('drei Einsen sind ebenfalls ein kritischer Erfolg', () => {
    expect(evaluateTalentCheck([8, 8, 8], 0, 0, [1, 1, 1]).special).toBe('krit');
  });
});

describe('evaluateCombatRoll', () => {
  it('gelingt bei Wurf <= Zielwert', () => {
    const r = evaluateCombatRoll(12, 0, 12);
    expect(r.success).toBe(true);
    expect(r.target).toBe(12);
  });

  it('misslingt bei Wurf > Zielwert', () => {
    expect(evaluateCombatRoll(12, 0, 13).success).toBe(false);
  });

  it('verrechnet den Modifikator in den Zielwert', () => {
    expect(evaluateCombatRoll(12, -4, 10).success).toBe(false);
    expect(evaluateCombatRoll(12, 4, 15).success).toBe(true);
  });

  it('ohne Bestätigungswurf ist die 1 ein Auto-Krit', () => {
    const r = evaluateCombatRoll(10, 0, 1);
    expect(r.special).toBe('krit');
    expect(r.success).toBe(true);
    expect(r.confirmation).toBeUndefined();
  });

  it('ohne Bestätigungswurf ist die 20 ein Auto-Patzer', () => {
    const r = evaluateCombatRoll(10, 0, 20);
    expect(r.special).toBe('patzer');
    expect(r.success).toBe(false);
  });

  it('bestätigter Krit: Bestätigung <= Zielwert', () => {
    const r = evaluateCombatRoll(10, 0, 1, 10);
    expect(r.special).toBe('krit');
    expect(r.success).toBe(true);
    expect(r.confirmation).toEqual({ roll: 10, confirmed: true });
  });

  it('unbestätigter Krit ist ein normaler Treffer', () => {
    const r = evaluateCombatRoll(10, 0, 1, 11);
    expect(r.special).toBeNull();
    expect(r.success).toBe(true);
    expect(r.confirmation).toEqual({ roll: 11, confirmed: false });
  });

  it('bestätigter Patzer: Bestätigung > Zielwert', () => {
    const r = evaluateCombatRoll(10, 0, 20, 11);
    expect(r.special).toBe('patzer');
    expect(r.success).toBe(false);
    expect(r.confirmation).toEqual({ roll: 11, confirmed: true });
  });

  it('unbestätigter Patzer ist ein normaler Fehlschlag', () => {
    const r = evaluateCombatRoll(10, 0, 20, 10);
    expect(r.special).toBeNull();
    expect(r.success).toBe(false);
    expect(r.confirmation).toEqual({ roll: 10, confirmed: false });
  });

  it('die Bestätigung nutzt den modifizierten Zielwert', () => {
    // Zielwert 10 - 3 = 7; Bestätigung 8 > 7 → Krit nicht bestätigt
    expect(evaluateCombatRoll(10, -3, 1, 8).special).toBeNull();
    expect(evaluateCombatRoll(10, -3, 1, 7).special).toBe('krit');
  });

  // Festgehaltenes Verhalten, kein bestätigtes Regelwissen: ab einem modifizierten
  // Zielwert von 20 kann der Bestätigungswurf nicht mehr scheitern bzw. gelingen.
  // Ob eine gewürfelte 20 hier trotzdem nie bestätigt, ist am Regelwerk zu klären
  // (siehe REVIEW.md, R2). Der Test pinnt den Status quo, damit er nicht unbemerkt kippt.
  describe('Randfall: Zielwert >= 20', () => {
    it('bestätigt derzeit jeden Krit, auch bei einer gewürfelten 20', () => {
      expect(evaluateCombatRoll(20, 0, 1, 20)).toMatchObject({
        special: 'krit',
        confirmation: { roll: 20, confirmed: true },
      });
    });

    it('bestätigt derzeit keinen Patzer', () => {
      expect(evaluateCombatRoll(20, 0, 20, 20)).toMatchObject({
        special: null,
        confirmation: { roll: 20, confirmed: false },
      });
    });
  });
});
