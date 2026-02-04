import { useState } from 'react';
import { roll3D20 } from '../utils/dice';
import PropertyNumber from './PropertyNumber';
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
import type { RootState } from '@/store';
import type { AttributeKey } from '@/store/attributesSlice';
import { ChevronDown, Dices } from 'lucide-react';

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
  const [selectedTalentId, setSelectedTalentId] = useState<string>('');

  const [special, setSpecial] = useState<'krit' | 'patzer' | null>(null);

  const attributeKeys: AttributeKey[] = ['MU', 'KL', 'IN', 'CH', 'FF', 'GE', 'KO', 'KK'];

  const handleSelectTalent = (talentId: string) => {
    const currentTalent = talents.find(talent => talent.id === talentId);
    if (!currentTalent) return;

    const { attribute1, attribute2, attribute3, id, name, value } = currentTalent;
    setTalentName(name);
    setSelectedTalentId(id);

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

  const getResult = () => {
    const talentEvaluation = getTalentEvaluation();
    let output = `Ergebnis: ${getTalentEvaluation()} `;
    output += talentEvaluation >= 0 ? `(QS: ${getQualityLevel()})` : '(Misslungen)';
    return output;
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

  return (
    <div className='flex flex-col items-center space-y-6 w-full max-w-4xl mx-auto'>
      {/* Talent-Auswahl */}
      <div className="flex flex-col items-center w-full">
        <label className="mb-1 text-sm text-muted-foreground">Talent</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full max-w-sm justify-between"
              aria-expanded={open}
            >
              {talentName || 'Talent wählen'}
              <ChevronDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full max-w-sm p-0">
            <Command>
              <CommandInput placeholder="Talent suchen..." />
              <CommandList>
                <CommandEmpty>Kein Talent gefunden</CommandEmpty>
                <CommandGroup>
                  {talents.map((talent) => (
                    <CommandItem
                      key={talent.id}
                      onSelect={() => handleSelectTalent(talent.id)}>
                      {talent.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Eigenschaften */}
      <div className='grid grid-cols-3 gap-4 w-full max-w-2xl'>
        <div className='flex flex-col items-center gap-3'>
          <Select
            value={firstAttribute}
            onValueChange={(val) => {
              setFirstAttribute(val as AttributeKey);
              setFirstProperty(attributes[val as AttributeKey]);
            }}
          >
            <SelectTrigger className="w-20 text-center">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {attributeKeys.map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <PropertyNumber value={firstProperty} onChange={setFirstProperty} />
        </div>
        
        <div className='flex flex-col items-center gap-3'>
          <Select
            value={secondAttribute}
            onValueChange={(val) => {
              setSecondAttribute(val as AttributeKey);
              setSecondProperty(attributes[val as AttributeKey]);
            }}
          >
            <SelectTrigger className="w-20 text-center">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {attributeKeys.map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <PropertyNumber value={secondProperty} onChange={setSecondProperty} />
        </div>
        
        <div className='flex flex-col items-center gap-3'>
          <Select
            value={thirdAttribute}
            onValueChange={(val) => {
              setThirdAttribute(val as AttributeKey);
              setThirdProperty(attributes[val as AttributeKey]);
            }}
          >
            <SelectTrigger className="w-20 text-center">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {attributeKeys.map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <PropertyNumber value={thirdProperty} onChange={setThirdProperty} min={-100} />
        </div>
      </div>

      {/* Modifikator & Talentwert */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
        <div className="flex flex-col items-center">
          <PropertyNumber
            label="Modifikator"
            value={modifier}
            onChange={setModifier}
            min={-20}
            max={20}
            size="s"
          />
          {modifierText && (
            <span className={`text-xs mt-1 ${modifierColor}`}>{modifierText}</span>
          )}
        </div>
        
        <PropertyNumber label='Talentwert' value={talentValue} onChange={setTalentValue} size="s" />
      </div>

      {/* Würfel-Button */}
      <Button onClick={handleRoll} size="lg" className="w-full max-w-xs">
        <Dices className="w-5 h-5 mr-2" />
        Würfeln
      </Button>

      {rollResult.length !== 0 && (
        <p className='text-sm text-muted-foreground'>
          Würfel: {rollResult.join(', ')}
        </p>
      )}

      {/* Ergebnis */}
      {talentResults.length > 0 && (
        <div className="w-full max-w-md bg-card border border-border rounded-lg p-6 text-center space-y-4">
          {special === 'krit' && (
            <p className="text-green-400 font-bold text-2xl glow-success">⭐ Kritischer Erfolg!</p>
          )}
          {special === 'patzer' && (
            <p className="text-red-500 font-bold text-2xl shake-error">⚠️ Patzer!</p>
          )}
          {special === null && (
            <p className="text-xl font-semibold">{getResult()}</p>
          )}
          
          <ul className='text-sm text-muted-foreground space-y-1'>
            <li>{firstAttribute}: {firstProperty} - {modifier} - {rollResult[0]} = {talentResults[0]}</li>
            <li>{secondAttribute}: {secondProperty} - {modifier} - {rollResult[1]} = {talentResults[1]}</li>
            <li>{thirdAttribute}: {thirdProperty} - {modifier} - {rollResult[2]} = {talentResults[2]}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TalentRoll;