import { useState } from 'react';
import PropertyNumber from './PropertyNumber';
import DiceIcon from './DiceIcon';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { rollDice } from '@/utils/dice';
import { useDispatch } from 'react-redux';
import { addRoll } from '@/store/rollSlice';
import { Dices } from 'lucide-react';

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
        const rolls = rollDice(diceCount, Number(selectedDice));
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
        <div className="flex flex-col items-center space-y-8 w-full max-w-4xl mx-auto">
            {/* Würfel-Auswahl */}
            <Card variant="parchment" className="w-full">
                <CardHeader>
                    <CardTitle className="text-center">Einzelwurf</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Würfel-Typ */}
                    <div className="flex flex-col items-center space-y-3">
                        <label className="text-sm font-heading font-semibold uppercase tracking-wide text-aventurian-700 dark:text-aventurian-300">
                            Würfel-Typ
                        </label>
                        <Select defaultValue={selectedDice} onValueChange={setSelectedDice}>
                            <SelectTrigger className="w-[200px] font-heading">
                                <SelectValue placeholder="Wähle einen Würfel" />
                            </SelectTrigger>
                            <SelectContent>
                                {diceOptions.map(die => (
                                    <SelectItem key={die.value} value={die.value} className="font-heading">
                                        {die.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Anzahl & Modifier */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col items-center p-4 rounded-lg bg-aventurian-100/50 dark:bg-aventurian-800/50">
                            <PropertyNumber 
                                label='Anzahl' 
                                value={diceCount} 
                                onChange={setDiceCount} 
                                min={1} 
                                max={20} 
                            />
                        </div>
                        <div className="flex flex-col items-center p-4 rounded-lg bg-aventurian-100/50 dark:bg-aventurian-800/50">
                            <PropertyNumber 
                                label='Modifier' 
                                value={modifier} 
                                onChange={setModifier} 
                                min={-20} 
                                max={20} 
                            />
                        </div>
                    </div>

                    {/* Würfel-Button */}
                    <div className="flex justify-center pt-4">
                        <Button 
                            onClick={handleRoll} 
                            size="xl" 
                            variant="aventurian"
                            className="w-full max-w-xs shadow-lg hover:shadow-xl"
                        >
                            <Dices className="w-6 h-6 mr-2" />
                            Würfeln
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Ergebnis */}
            {total !== null && (
                <Card 
                    variant="success"
                    className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                    <CardHeader>
                        <CardTitle className="text-center text-3xl text-success">
                            {total}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Würfel-Anzeige */}
                        <div className="flex flex-wrap justify-center gap-3">
                            {results.map((value, index) => (
                                <DiceIcon
                                    key={index}
                                    value={value}
                                    size="md"
                                    variant="default"
                                />
                            ))}
                        </div>

                        {/* Details */}
                        <div className="bg-background/50 rounded-lg p-4 text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                                {diceCount}W{selectedDice} {modifier !== 0 && `${modifier >= 0 ? '+' : ''}${modifier}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Würfel: {results.join(' + ')} 
                                {modifier !== 0 && ` ${modifier >= 0 ? '+' : ''}${modifier}`} = {total}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default SimpleRoll;