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
import { ChevronDown } from 'lucide-react';
// import { Info } from 'lucide-react';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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
    console.log('selectedTalentId :>> ', selectedTalentId);

    setFirstAttribute(attribute1);
    setSecondAttribute(attribute2);
    setThirdAttribute(attribute3);

    setTalentValue(value);

    setFirstProperty(attributes[attribute1]);
    setSecondProperty(attributes[attribute2]);
    setThirdProperty(attributes[attribute3]);
    setOpen(false);
  };

  // Hilfsfunktion für negative Ergebnisse
  const getCorrectPropertyValue = (rollResult: number): number => rollResult < 0 ? rollResult : 0;

  // Würfel-Logik
  const handleRoll = () => {
    const roll = roll3D20();
    setRollResult(roll);

    const isKriticalSuccess = roll.filter(x => x === 1).length >= 2;
    const isKriticalFail = roll.filter(x => x === 20).length >= 2;

    if (isKriticalSuccess) setSpecial('krit');
    if (isKriticalFail) setSpecial('patzer');

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
    <div className='flex flex-col items-center space-y-6'>
      {/* //Auswahl Talent */}
      <div className="flex flex-col items-center">
        <label className="mb-1">Talent</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-56 justify-between"
              aria-expanded={open}
            >
              {talentName || 'Talent wählen'}
              <ChevronDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0">
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

      <div className='grid grid-cols-3 gap-4 max-w-[800px] place-items-center'>
        <div className='flex flex-col items-center gap-3'>
          <Select
            value={firstAttribute}
            onValueChange={(val) => {
              setFirstAttribute(val as AttributeKey);
              setFirstProperty(attributes[val as AttributeKey]); // nur beim Auswählen aktualisieren
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
        <div className='flex flex-col items-center  gap-3'>
          <Select
            value={secondAttribute}
            onValueChange={(val) => {
              setSecondAttribute(val as AttributeKey);
              setSecondProperty(attributes[val as AttributeKey]); // nur beim Auswählen aktualisieren
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
        <div className='flex flex-col items-center  gap-3'>
          <Select
            value={thirdAttribute}
            onValueChange={(val) => {
              setThirdAttribute(val as AttributeKey);
              setThirdProperty(attributes[val as AttributeKey]); // nur beim Auswählen aktualisieren
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
        <div className="col-start-2">
          <div className="flex items-center gap-2">
            <PropertyNumber
              label="Modifikator"
              value={modifier}
              onChange={setModifier}
              min={-20}
              max={20}
              size="s"
            />
            {/* TODO: Überprüfen ob ich den Tooltip brauche */}
            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>+ = Erschwernis (schwerer)</p>
                  <p>− = Erleichterung (leichter)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider> */}
          </div>

          {/* Nur anzeigen, wenn != 0 */}
          {modifierText && (
            <span className={`text-xs mt-1 ${modifierColor}`}>{modifierText}</span>
          )}
        </div>
      </div>

      <PropertyNumber label='Talentwert' value={talentValue} onChange={setTalentValue} />
      <div className="p-4">
        <button onClick={handleRoll}>Würfeln</button>
        {rollResult.length !== 0 && (<p className='mt-2 text-muted-foreground'>{rollResult.join(', ')}</p>)}
      </div>
      {talentResults.length > 0 && (
        <div>
          {special === 'krit' && (
            <p className="text-green-400 font-bold text-lg glow-success">⭐ Kritischer Erfolg!</p>
          )}
          {special === 'patzer' && (
            <p className="text-red-500 font-bold text-lg shake-error">⚠️ Patzer!</p>
          )}
          {special === null && (
            <p>{getResult()}</p>
          )}
          <ul className='text-muted-foreground mt-4'>
            <li>Eigenschaft 1 - Würfelzahl - Modifier: {talentResults[0]}</li>
            <li>Eigenschaft 2 - Würfelzahl - Modifier: {talentResults[1]}</li>
            <li>Eigenschaft 3 - Würfelzahl - Modifier: {talentResults[2]}</li>
          </ul>
        </div>)}
    </div>
  );
};

export default TalentRoll;