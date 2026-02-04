import { useState } from 'react';
import { roll3D20 } from '../utils/dice';
import PropertyNumber from './PropertyNumber';
import DiceIcon from './DiceIcon';
import { useDispatch, useSelector } from 'react-redux';
import { addRoll } from '@/store/rollSlice';
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
import type { AttributeKey } from '@/store/attributesSlice';
import { ChevronDown, Dices, Sparkles, Skull } from 'lucide-react';

const TalentRoll = () => {
  const dispatch = useDispatch();

  const attributes = useSelector((state: RootState) => state.attributes);
  const talents = useSelector((state: RootState) => state.talents.talents);

  const [firstAttribute, setFirstAttribute] = useState<AttributeKey>('MU');
  const [secondAttribute, setSecondAttribute] = useState<AttributeKey>('KL');
  const [thirdAttribute, setThirdAttribute] = useState<AttributeKey>('IN');
  const [firstProperty, setFirstProperty] = useState<number>(attributes[firstAttribute]);
  const [secondProperty, setSecondProperty] = useState<number>(attributes[secondAttribute]);
  const [thirdProperty, setThirdProperty] = useState<number>(attributes[thirdAttribute]);

  const [modifier, setModifier] = useState<number>(0);
  const [talentValue, setTalentValue] = useState<number>(10);
  const [rollResult, setRollResult] = useState<number[]>([]);
  const [talentResults, setTalentResults] = useState<number[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [talentName, setTalentName] = useState<string>('');

  const [special, setSpecial] = useState<'krit' | 'patzer' | null>(null);

  const attributeKeys: AttributeKey[] = ['MU', 'KL', 'IN', 'CH', 'FF', 'GE', 'KO', 'KK'];

  const handleSelectTalent = (talentId: string) => {
    const currentTalent = talents.find(talent => talent.id === talentId);
    if (!currentTalent) return;

    const { attribute1, attribute2, attribute3, name, value } = currentTalent;
    setTalentName(name);

    setFirstAttribute(attribute1);
    setSecondAttribute(attribute2);
    setThirdAttribute(attribute3);

    setTalentValue(value);

    setFirstProperty(attributes[attribute1]);
    setSecondProperty(attributes[attribute2]);
    setThirdProperty(attributes[attribute3]);
    setOpen(false);
  };

  const getCorrectPropertyValue = (rollResult: number): number => rollResult < 0 ? rollResult : 0;

  const handleRoll = () => {
    const roll = roll3D20();
    setRollResult(roll);

    const isKriticalSuccess = roll.filter(x => x === 1).length >= 2;
    const isKriticalFail = roll.filter(x => x === 20).length >= 2;

    if (isKriticalSuccess) setSpecial('krit');
    if (isKriticalFail) setSpecial('patzer');
    if (!isKriticalSuccess && !isKriticalFail) setSpecial(null);

    const results = [
      getCorrectPropertyValue(firstProperty - modifier - roll[0]),
      getCorrectPropertyValue(secondProperty - modifier - roll[1]),
      getCorrectPropertyValue(thirdProperty - modifier - roll[2])
    ];

    setTalentResults(results);

    const total = talentValue + results.reduce((sum, currentValue) => sum + currentValue, 0);
    const quality = Math.max(1, Math.ceil(total / 3));
    const qualityResult = total >= 0 ? `(QS: ${quality})` : '(Misslungen)';
    const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    let result = `Ergebnis: ${total} ${qualityResult} [Modifikator: ${modifierText}]`;

    if (isKriticalSuccess) result = '⭐ Kritischer Erfolg!';
    if (isKriticalFail) result = '⚠️ Patzer!';

    dispatch(addRoll({
      id: crypto.randomUUID(),
      type: 'Talent',
      values: roll,
      result,
      date: new Date().toISOString()
    }));
  };

  const getTalentEvaluation = (): number => talentValue + talentResults.reduce((sum, currentValue) => sum + currentValue, 0);

  const getQualityLevel = (): number => {
    return Math.max(1, Math.ceil(getTalentEvaluation() / 3));
  };

  let modifierText = null;
  let modifierColor = '';

  if (modifier > 0) {
    modifierText = 'Erschwernis';
    modifierColor = 'text-amber-400';
  } else if (modifier < 0) {
    modifierText = 'Erleichterung';
    modifierColor = 'text-sky-400';
  }

  // Würfel-Varianten basierend auf Wert
  const getDiceVariant = (value: number): 'default' | 'critical' | 'failure' => {
    if (special === 'krit') return 'critical';
    if (special === 'patzer') return 'failure';
    if (value === 1) return 'critical';
    if (value === 20) return 'failure';
    return 'default';
  };

  return (
    <div className='flex flex-col items-center space-y-8 w-full max-w-5xl mx-auto'>
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
                {talentName || 'Talent wählen...'}
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
            {/* Eigenschaft 1 */}
            <div className='flex flex-col items-center gap-3 p-4 rounded-lg bg-aventurian-100/50 dark:bg-aventurian-800/50'>
              <Select
                value={firstAttribute}
                onValueChange={(val) => {
                  setFirstAttribute(val as AttributeKey);
                  setFirstProperty(attributes[val as AttributeKey]);
                }}
              >
                <SelectTrigger className="w-24 text-center font-heading">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {attributeKeys.map((key) => (
                    <SelectItem key={key} value={key} className="font-heading">
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <PropertyNumber value={firstProperty} onChange={setFirstProperty} />
            </div>

            {/* Eigenschaft 2 */}
            <div className='flex flex-col items-center gap-3 p-4 rounded-lg bg-aventurian-100/50 dark:bg-aventurian-800/50'>
              <Select
                value={secondAttribute}
                onValueChange={(val) => {
                  setSecondAttribute(val as AttributeKey);
                  setSecondProperty(attributes[val as AttributeKey]);
                }}
              >
                <SelectTrigger className="w-24 text-center font-heading">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {attributeKeys.map((key) => (
                    <SelectItem key={key} value={key} className="font-heading">
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <PropertyNumber value={secondProperty} onChange={setSecondProperty} />
            </div>

            {/* Eigenschaft 3 */}
            <div className='flex flex-col items-center gap-3 p-4 rounded-lg bg-aventurian-100/50 dark:bg-aventurian-800/50'>
              <Select
                value={thirdAttribute}
                onValueChange={(val) => {
                  setThirdAttribute(val as AttributeKey);
                  setThirdProperty(attributes[val as AttributeKey]);
                }}
              >
                <SelectTrigger className="w-24 text-center font-heading">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {attributeKeys.map((key) => (
                    <SelectItem key={key} value={key} className="font-heading">
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <PropertyNumber value={thirdProperty} onChange={setThirdProperty} min={-100} />
            </div>
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
              value={modifier}
              onChange={setModifier}
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
            <PropertyNumber value={talentValue} onChange={setTalentValue} size="s" />
          </CardContent>
        </Card>
      </div>

      {/* Würfel-Button */}
      <Button 
        onClick={handleRoll} 
        size="xl" 
        variant="aventurian"
        className="w-full max-w-xs shadow-lg hover:shadow-xl"
        disabled={!talentName}
      >
        <Dices className="w-6 h-6 mr-2" />
        Würfeln
      </Button>

      {/* Ergebnis-Anzeige */}
      {talentResults.length > 0 && (
        <Card 
          variant={
            special === 'krit' ? 'critical' : 
            special === 'patzer' ? 'failure' : 
            getTalentEvaluation() >= 0 ? 'success' : 'failure'
          }
          className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <CardHeader>
            {special === 'krit' && (
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="w-8 h-8 text-critical animate-glow" />
                <CardTitle className="text-3xl text-critical">
                  Kritischer Erfolg!
                </CardTitle>
                <Sparkles className="w-8 h-8 text-critical animate-glow" />
              </div>
            )}
            {special === 'patzer' && (
              <div className="flex items-center justify-center gap-3">
                <Skull className="w-8 h-8 text-failure shake-error" />
                <CardTitle className="text-3xl text-failure">
                  Patzer!
                </CardTitle>
                <Skull className="w-8 h-8 text-failure shake-error" />
              </div>
            )}
            {special === null && (
              <CardTitle className="text-center text-2xl">
                {getTalentEvaluation() >= 0 ? (
                  <span className="text-success">
                    Erfolg! (QS {getQualityLevel()})
                  </span>
                ) : (
                  <span className="text-failure">Misslungen</span>
                )}
              </CardTitle>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Würfel-Anzeige */}
            <div className="flex justify-center gap-4">
              {rollResult.map((value, index) => (
                <DiceIcon
                  key={index}
                  value={value}
                  size="lg"
                  variant={getDiceVariant(value)}
                />
              ))}
            </div>

            {/* Ergebnis-Text */}
            {special === null && (
              <div className="text-center">
                <p className="text-3xl font-heading font-bold">
                  {getTalentEvaluation()}
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
                <div className="flex justify-between">
                  <span>{firstAttribute}: {firstProperty} - {modifier} - {rollResult[0]}</span>
                  <span className="font-semibold">{talentResults[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span>{secondAttribute}: {secondProperty} - {modifier} - {rollResult[1]}</span>
                  <span className="font-semibold">{talentResults[1]}</span>
                </div>
                <div className="flex justify-between">
                  <span>{thirdAttribute}: {thirdProperty} - {modifier} - {rollResult[2]}</span>
                  <span className="font-semibold">{talentResults[2]}</span>
                </div>
                <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
                  <span>Talentwert: {talentValue} + Summe: {talentResults.reduce((a, b) => a + b, 0)}</span>
                  <span>= {getTalentEvaluation()}</span>
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