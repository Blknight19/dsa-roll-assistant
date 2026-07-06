import { useState } from 'react';
import { nanoid } from '@reduxjs/toolkit';
import { roll3D20 } from '../utils/dice';
import { evaluateTalentCheck } from '../utils/rules';
import PropertyNumber from './PropertyNumber';
import DiceIcon from './DiceIcon';
import { useDispatch, useSelector } from 'react-redux';
import { addRoll } from '@/store/rollSlice';
import {
  selectProbeTalent,
  setProbeEntry,
  setProbeModifier,
  setProbeTaw,
  setProbeLastRoll,
} from '@/store/probeSlice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RootState } from '@/store';
import { ATTRIBUTE_KEYS, type AttributeKey } from '@/store/attributesSlice';
import { ChevronDown, Dices, Sparkles, Skull } from 'lucide-react';

/** Modifikator als lesbarer Rechenterm, z. B. " − 2" oder " + 3". */
const modifierTerm = (modifier: number): string => {
  if (modifier === 0) return '';
  return modifier < 0 ? ` − ${Math.abs(modifier)}` : ` + ${modifier}`;
};

const TalentRoll = () => {
  const dispatch = useDispatch();

  const attributes = useSelector((state: RootState) => state.attributes);
  const talents = useSelector((state: RootState) => state.talents.talents);
  const probe = useSelector((state: RootState) => state.probe);

  const [open, setOpen] = useState<boolean>(false);

  const lastRoll = probe.lastRoll;

  const handleSelectTalent = (talentId: string) => {
    const currentTalent = talents.find(talent => talent.id === talentId);
    if (!currentTalent) return;

    dispatch(selectProbeTalent({
      id: currentTalent.id,
      name: currentTalent.name,
      entries: [currentTalent.attribute1, currentTalent.attribute2, currentTalent.attribute3]
        .map(attribute => ({ attribute, value: attributes[attribute] })),
      taw: currentTalent.value,
    }));
    setOpen(false);
  };

  const handleRoll = () => {
    const dice = roll3D20();
    const attrs = probe.entries.map(entry => entry.value) as [number, number, number];
    const result = evaluateTalentCheck(attrs, probe.taw, probe.modifier, dice);

    dispatch(setProbeLastRoll({
      talentName: probe.talentName,
      entries: probe.entries.map(entry => ({ ...entry })),
      modifier: probe.modifier,
      taw: probe.taw,
      result,
    }));

    const modifierText = probe.modifier > 0 ? `+${probe.modifier}` : `${probe.modifier}`;
    let historyResult = `Ergebnis: ${result.fp} ${result.success ? `(QS: ${result.qs})` : '(Misslungen)'} [Modifikator: ${modifierText}]`;
    if (result.special === 'krit') historyResult = 'Kritischer Erfolg!';
    if (result.special === 'patzer') historyResult = 'Patzer!';

    dispatch(addRoll({
      id: nanoid(),
      type: 'Talent',
      values: [...result.dice],
      result: historyResult,
      date: new Date().toISOString(),
    }));
  };

  // Buch-Konvention: negativer Modifikator = Erschwernis
  let modifierText = null;
  let modifierColor = '';

  if (probe.modifier < 0) {
    modifierText = 'Erschwernis';
    modifierColor = 'text-amber-700 dark:text-amber-400';
  } else if (probe.modifier > 0) {
    modifierText = 'Erleichterung';
    modifierColor = 'text-sky-700 dark:text-sky-400';
  }

  // Würfel-Varianten basierend auf Wert
  const getDiceVariant = (value: number): 'default' | 'critical' | 'failure' => {
    if (lastRoll?.result.special === 'krit') return 'critical';
    if (lastRoll?.result.special === 'patzer') return 'failure';
    if (value === 1) return 'critical';
    if (value === 20) return 'failure';
    return 'default';
  };

  const resultSummary = lastRoll
    ? lastRoll.result.special === 'krit'
      ? 'Kritischer Erfolg!'
      : lastRoll.result.special === 'patzer'
        ? 'Patzer!'
        : lastRoll.result.success
          ? `Erfolg, Qualitätsstufe ${lastRoll.result.qs}`
          : 'Misslungen'
    : '';

  return (
    <div className='flex flex-col items-center space-y-8 w-full max-w-5xl mx-auto'>
      {/* Screenreader-Ansage des Ergebnisses */}
      <div aria-live="polite" className="sr-only">{resultSummary}</div>

      {/* Talent-Auswahl - Hero Section */}
      <Card variant="parchment" className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Talentprobe</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="aventurian"
                size="lg"
                role="combobox"
                className="w-full max-w-md justify-between"
                aria-expanded={open}
              >
                {probe.talentName || 'Talent wählen...'}
                <ChevronDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full max-w-md p-0">
              <Command>
                <CommandInput placeholder="Talent suchen..." className="font-body" />
                <CommandList>
                  <CommandEmpty>Kein Talent gefunden</CommandEmpty>
                  <CommandGroup>
                    {talents.map((talent) => (
                      <CommandItem
                        key={talent.id}
                        onSelect={() => handleSelectTalent(talent.id)}
                        className="font-body"
                      >
                        {talent.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Eigenschaften Grid */}
      <Card variant="parchment" className="w-full">
        <CardHeader>
          <CardTitle className="text-center text-xl">Eigenschaftswerte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {probe.entries.map((entry, index) => (
              <div key={index} className='flex flex-col items-center gap-3 p-4 rounded-lg bg-aventurian-100/50 dark:bg-aventurian-800/50'>
                <Select
                  value={entry.attribute}
                  onValueChange={(val) => {
                    const attribute = val as AttributeKey;
                    dispatch(setProbeEntry({ index, attribute, value: attributes[attribute] }));
                  }}
                >
                  <SelectTrigger className="w-24 text-center font-heading" aria-label={`Eigenschaft ${index + 1}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ATTRIBUTE_KEYS.map((key) => (
                      <SelectItem key={key} value={key} className="font-heading">
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <PropertyNumber
                  value={entry.value}
                  onChange={(value) => dispatch(setProbeEntry({ index, value }))}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modifikator & Talentwert */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <Card variant="parchment">
          <CardHeader>
            <CardTitle className="text-center text-lg">Modifikator</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            <PropertyNumber
              value={probe.modifier}
              onChange={(value) => dispatch(setProbeModifier(value))}
              min={-20}
              max={20}
              size="s"
            />
            {modifierText && (
              <span className={`text-sm font-semibold ${modifierColor}`}>
                {modifierText}
              </span>
            )}
          </CardContent>
        </Card>

        <Card variant="parchment">
          <CardHeader>
            <CardTitle className="text-center text-lg">Talentwert</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <PropertyNumber
              value={probe.taw}
              onChange={(value) => dispatch(setProbeTaw(value))}
              size="s"
            />
          </CardContent>
        </Card>
      </div>

      {/* Würfel-Button */}
      <Button
        onClick={handleRoll}
        size="xl"
        variant="aventurian"
        className="w-full max-w-xs shadow-lg hover:shadow-xl"
        disabled={!probe.talentName}
      >
        <Dices className="w-6 h-6 mr-2" />
        Würfeln
      </Button>

      {/* Ergebnis-Anzeige — rendert ausschließlich aus dem Wurf-Schnappschuss */}
      {lastRoll && (
        <Card
          variant={
            lastRoll.result.special === 'krit' ? 'critical' :
            lastRoll.result.special === 'patzer' ? 'failure' :
            lastRoll.result.success ? 'success' : 'failure'
          }
          className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <CardHeader>
            {lastRoll.result.special === 'krit' && (
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="w-8 h-8 text-critical-dark dark:text-critical-light animate-glow" />
                <CardTitle className="text-3xl text-critical-dark dark:text-critical-light">
                  Kritischer Erfolg!
                </CardTitle>
                <Sparkles className="w-8 h-8 text-critical-dark dark:text-critical-light animate-glow" />
              </div>
            )}
            {lastRoll.result.special === 'patzer' && (
              <div className="flex items-center justify-center gap-3">
                <Skull className="w-8 h-8 text-failure-dark dark:text-failure-light shake-error" />
                <CardTitle className="text-3xl text-failure-dark dark:text-failure-light">
                  Patzer!
                </CardTitle>
                <Skull className="w-8 h-8 text-failure-dark dark:text-failure-light shake-error" />
              </div>
            )}
            {lastRoll.result.special === null && (
              <CardTitle className="text-center text-2xl">
                {lastRoll.result.success ? (
                  <span className="text-success-dark dark:text-success-light">
                    Erfolg! (QS {lastRoll.result.qs})
                  </span>
                ) : (
                  <span className="text-failure-dark dark:text-failure-light">Misslungen</span>
                )}
              </CardTitle>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Würfel-Anzeige */}
            <div className="flex justify-center gap-4">
              {lastRoll.result.dice.map((value, index) => (
                <DiceIcon
                  key={index}
                  value={value}
                  size="lg"
                  variant={getDiceVariant(value)}
                />
              ))}
            </div>

            {/* Ergebnis-Text */}
            {lastRoll.result.special === null && (
              <div className="text-center">
                <p className="text-3xl font-heading font-bold">
                  {lastRoll.result.fp}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Gesamt-Talentpunkte übrig
                </p>
              </div>
            )}

            {/* Detaillierte Berechnung */}
            <div className="bg-background/50 rounded-lg p-4 space-y-2">
              <h4 className="font-heading font-semibold text-center mb-3">Berechnung</h4>
              <div className="grid gap-2 text-sm">
                {lastRoll.entries.map((entry, index) => (
                  <div className="flex justify-between" key={index}>
                    <span>
                      {entry.attribute}: {entry.value}{modifierTerm(lastRoll.modifier)} − {lastRoll.result.dice[index]}
                    </span>
                    <span className="font-semibold">{lastRoll.result.perDieShortfall[index]}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
                  <span>
                    Talentwert: {lastRoll.taw} + Summe: {lastRoll.result.perDieShortfall.reduce((a, b) => a + b, 0)}
                  </span>
                  <span>= {lastRoll.result.fp}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TalentRoll;
