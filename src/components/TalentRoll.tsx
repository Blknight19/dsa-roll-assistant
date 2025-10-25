import { useState } from 'react';
import { roll3D20 } from '../utils/dice';
import PropertyNumber from './PropertyNumber';
import { useDispatch } from 'react-redux';
import { addRoll } from '@/store/rollSlice';
// import { Info } from 'lucide-react';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const TalentRoll = () => {
  const dispatch = useDispatch();

  const [firstProperty, setFirstProperty] = useState<number>(10);
  const [secondProperty, setSecondProperty] = useState<number>(10);
  const [thirdProperty, setThirdProperty] = useState<number>(10);
  const [modifier, setModifier] = useState<number>(0);
  const [talentValue, setTalentValue] = useState<number>(10);
  const [rollResult, setRollResult] = useState<number[]>([]);
  const [talentResults, setTalentResults] = useState<number[]>([]);

  // Hilfsfunktion für negative Ergebnisse
  const getCorrectPropertyValue = (rollResult: number): number => rollResult < 0 ? rollResult : 0;

  // Würfel-Logik
  const handleRoll = () => {
    const roll = roll3D20();
    setRollResult(roll);
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
    const result = `Ergebnis: ${total} ${qualityResult} [Modifikator: ${modifierText}]`;

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
      <div className='grid grid-cols-3 gap-4 max-w-[800px] place-items-center'>
        <PropertyNumber label='Eig. 1' value={firstProperty} onChange={setFirstProperty} />
        <PropertyNumber label='Eig. 2' value={secondProperty} onChange={setSecondProperty} />
        <PropertyNumber label='Eig. 3' value={thirdProperty} onChange={setThirdProperty} min={-100} />
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
      {talentResults.length > 0 && (<div>
        <p>{getResult()}</p>
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