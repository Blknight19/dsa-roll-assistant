import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import PropertyNumber from './PropertyNumber';
import { Button } from './ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { updateCombatStat, updateLifeStat } from '@/store/combatSlice';
import type { RootState } from '@/store';
import { useState } from 'react';
import { roll } from '@/utils/dice';
import { nanoid } from '@reduxjs/toolkit';
import { addRoll } from '@/store/rollSlice';

const Combat = () => {
	const dispatch = useDispatch();
	const combat = useSelector((state: RootState) => state.combat);
	const [modifier, setModifier] = useState<number>(0);
	const [rollText, setRollText] = useState<string>('');

	type CombatType = 'AT' | 'PA' | 'AW' | 'FK' | 'INI'
	type LastCombatResult = {
		type: CombatType;
		label: string;
		values: number[];
		isSuccessful: boolean;
		crit?: boolean;
		fail?: boolean;
	}

	const [lastCombatResult, setLastCombatResult] = useState<LastCombatResult | null>(null);

	const isAttackType = (type: CombatType) => ['AT', 'PA', 'AW', 'FK'].includes(type);

	const addCombatResult = (type: CombatType, label: string, result: string, values: number[], isSuccessful = false, crit = false, fail = false) => {
		setLastCombatResult({ type, label, values, isSuccessful, crit, fail });
		dispatch(addRoll({
			id: nanoid(),
			type: 'Kampf',
			values,
			result,
			date: new Date().toISOString()
		}));
	};

	const rollCombatValue = (name: CombatType, value: number) => {
		const labelEnum: Record<string, string> = {
			'AT': '⚔️ Attacke',
			'PA': '🛡️ Parade',
			'AW': '✈️ Ausweichen',
			'FK': '🎯Fernkampf',
			'INI': '⏱ Initiative',
		};
		const currentCombatLabel = labelEnum[name];

		if (name === 'INI') {
			const [w6] = roll('1d6');
			const initiative = w6 + value + modifier;
			const modifierText = modifier < 0 ? modifier.toString().split('-').join('- ') : `+ ${modifier}`;

			const result = `⏱ Initiative: ${value} + ${w6} ${modifierText} = ${initiative}`;
			setRollText(result);
			addCombatResult(name, currentCombatLabel, result, [w6]);

			return;
		}

		const [d20] = roll('1d20');

		if (d20 === 1) {
			const failText = '⭐ Kritischer Erfolg!';
			setRollText(failText);
			addCombatResult(name, currentCombatLabel, failText, [d20], false, true, false);
			return;
		}

		if (d20 === 20) {
			const critText = '⚠️ Patzer!';
			setRollText(critText);
			addCombatResult(name, currentCombatLabel, critText, [d20], true, false, true);
			return;
		}

		const currentRoll = d20;
		const finalValue = value + modifier;
		const isSuccessful = currentRoll <= finalValue;
		let valueText = `(Wurf: ${d20}, Basiswert: ${finalValue})`;

		if (modifier !== 0) {
			valueText = `(Wurf: ${d20}, Basiswert: ${value}${modifier !== 0 ? `, Mod: ${modifier > 0 ? '+' : ''}${modifier}` : ''} → Endwert: ${finalValue})`;
		}
		setRollText(valueText);
		const resultText = `${currentCombatLabel} ${isSuccessful ? '✅ gelungen' : '❌ nicht gelungen'} (Wurf: ${d20}, ${valueText}`;

		addCombatResult(name, currentCombatLabel, resultText, [d20], isSuccessful);
	};


	let modifierText = null;
	let modifierColor = '';

	if (modifier < 0) {
		modifierText = 'Erschwernis';
		modifierColor = 'text-amber-400';
	} else if (modifier > 0) {
		modifierText = 'Erleichterung';
		modifierColor = 'text-sky-400';
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Kampf</CardTitle>
				</CardHeader>

				<CardContent className="grid gap-6">
					{/* Lebensenergie */}
					<div className="flex items-center justify-center gap-3">
						<PropertyNumber
							label="Aktuell"
							value={combat.life.current}
							size="m"
							onChange={(value) => dispatch(updateLifeStat({ current: value }))}
						/>
						<span>/</span>
						<PropertyNumber
							label="LeP Max."
							value={combat.life.max}
							size="m"
							onChange={(value) => dispatch(updateLifeStat({ max: value }))}
						/>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
						{[
							{ label: 'AT', key: 'attack' },
							{ label: 'FK', key: 'ranged' },
							{ label: 'PA', key: 'save' },
							{ label: 'AW', key: 'dodge' },
							{ label: 'INI', key: 'initiative' },
						].map((item) => (
							<div key={item.key} className="flex flex-col items-center gap-2">
								<PropertyNumber
									label={item.label}
									value={combat[item.key as keyof typeof combat] as number}
									size="m"
									onChange={(value) =>
										dispatch(
											updateCombatStat({
												key: item.key as keyof typeof combat,
												value,
											})
										)
									}
								/>
								<Button size="sm" variant="outline" onClick={() => rollCombatValue(item.label as CombatType, combat[item.key as keyof typeof combat] as number)}>
									🎲 Würfeln
								</Button>
							</div>
						))}
					</div>
					<div className="flex flex-col items-center justify-center">
						<PropertyNumber
							label="Modifikator"
							value={modifier}
							size="s"
							min={-20}
							max={20}
							onChange={setModifier}
						/>
						{modifierText && (
							<span className={`text-xs mt-1 ${modifierColor}`}>{modifierText}</span>
						)}
					</div>
				</CardContent>
			</Card>
			{lastCombatResult && (
				<Card className={`
					animate -in fade -in slide -in -from - top - 2
					${lastCombatResult.crit ? 'glow-success border-green-400' : ''}
					${lastCombatResult.fail ? 'shake-error border-red-500' : ''}
				`}>
					<CardHeader>
						<CardTitle className='text-xl'>Letzter Kampfwurf: {lastCombatResult.label}</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col items-center gap-3">
						{(isAttackType(lastCombatResult.type) && (!lastCombatResult.crit && !lastCombatResult.fail)) && (<div className="text-xl font-bold">
							{lastCombatResult.isSuccessful ? '✅ Gelungen' : '❌ Misslungen'}
						</div>)}
						<div className="text-lg font-semibold">{rollText}</div>
						<div className="text-sm text-muted-foreground">
							Wurf: {lastCombatResult.values.join(', ')}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default Combat;