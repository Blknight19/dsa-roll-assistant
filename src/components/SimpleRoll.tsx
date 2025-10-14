import { useState } from 'react';
import PropertyNumber from './PropertyNumber';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { roll } from '@/utils/dice';
import { useDispatch } from 'react-redux';
import { addRoll } from '@/store/rollSlice';

const diceOptions = [
    { label: 'W20', value: '20' },
    { label: 'W12', value: '12' },
    { label: 'W10', value: '10' },
    { label: 'W8', value: '8' },
    { label: 'W6', value: '6' },
    { label: 'W4', value: '4' },
];

const SimpleRoll = () => {
    const dispatch = useDispatch();
    const [diceCount, setDiceCount] = useState<number>(1);
    const [modifier, setModifier] = useState<number>(0);
    const [selectedDice, setSelectedDice] = useState<string>('20');
    const [results, setResults] = useState<number[]>([]);
    const [total, setTotal] = useState<number | null>(null);

    const handleRoll = () => {
        const dices = `${diceCount}d${selectedDice}`;
        const rolls = roll(dices);
        setResults(rolls);
        const total = rolls.reduce((sum, currentValue) => sum + currentValue, 0) + modifier;
        setTotal(total);

        dispatch(addRoll({
            id: crypto.randomUUID(),
            type: 'Einzel',
            values: rolls,
            result: `Gesamt: ${total} (${diceCount}W${selectedDice} ${modifier >= 0 ? `+${modifier}` : modifier})`,
            date: new Date().toISOString()
        }));
    };

    return (
        <div className="flex flex-col items-center space-y-6 mt-6">
            <div className="flex flex-col items-center space-y-2">
                <label className="text-sm text-muted-foreground">Würfel auswählen</label>
                <Select defaultValue={selectedDice} onValueChange={setSelectedDice} >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Wähle einen Würfel" />
                    </SelectTrigger>
                    <SelectContent>
                        {diceOptions.map(die => <SelectItem key={die.value} value={die.value}>{die.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
                <PropertyNumber label='Anzahl' value={diceCount} onChange={setDiceCount} min={1} max={20} />
                <PropertyNumber label='Modifier' value={modifier} onChange={setModifier} min={-20} max={20} />
            </div>
            <button onClick={handleRoll} className="w-[155px]">Würfeln</button>
            {total !== null && (
                <div className="text-center mt-4 space-y-2">
                    <p className="text-lg font-semibold">Gesamtergebnis: {total}</p>
                    <p className="text-sm text-muted-foreground">{diceCount}W{selectedDice}</p>
                    <p className="text-sm text-muted-foreground">Einzelwürfe: {results.join(', ')}</p>
                </div>
            )}
        </div>
    );
};

export default SimpleRoll;