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

	type LastCombatResult = {
		label: string;
		result: string;
		values: number[];
		crit?: boolean;
		fail?: boolean;
	}

	const [lastCombatResult, setLastCombatResult] = useState<LastCombatResult | null>(null);

	const addCombatResult = (label: string, result: string, values: number[], crit = false, fail = false) => {
		setLastCombatResult({ label, result, values, crit, fail });

		dispatch(addRoll({
			id: nanoid(),
			type: 'Kampf',
			values,
			result,
			date: new Date().toISOString()
		}));
	};

	const rollCombatValue = (name: string, value: number) => {
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
			const initiative = w6 + value;
			const result = `⏱ Initiative: ${value} + ${w6} = ${initiative}`;
			addCombatResult(currentCombatLabel, result, [w6]);

			return;
		}

		const [d20] = roll('1d20');

		if (d20 === 1) {
			addCombatResult(currentCombatLabel, `${currentCombatLabel}: ⭐ Kritischer Erfolg!`, [d20], true, false);
			return;
		}

		if (d20 === 20) {
			addCombatResult(currentCombatLabel, `${currentCombatLabel}: ⚠️ Patzer!`, [d20], false, true);
			return;
		}

		const isSuccessful = d20 < value;
		const resultText = `${currentCombatLabel} ${isSuccessful ? '✅ gelungen' : '❌ nicht gelungen'}(Wurf: ${d20} / Wert: ${value})`;
		addCombatResult(currentCombatLabel, resultText, [d20]);
	};
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
							{ label: 'PA', key: 'save' },
							{ label: 'AW', key: 'dodge' },
							{ label: 'INI', key: 'initiative' },
							{ label: 'FK', key: 'ranged' },
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
								<Button size="sm" variant="outline" onClick={() => rollCombatValue(item.label, combat[item.key as keyof typeof combat] as number)}>
									🎲 Würfeln
								</Button>
							</div>
						))}
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
						<CardTitle>🎯 Letzter Kampfwurf</CardTitle>
					</CardHeader>
					<CardContent className="text-center">
						<div className="text-xl font-semibold">{lastCombatResult.result}</div>
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