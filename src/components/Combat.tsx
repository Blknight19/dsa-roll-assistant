import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import PropertyNumber from './PropertyNumber';
import DiceIcon from './DiceIcon';
import { Button } from './ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { updateCombatStat, updateLifeStat, type CombatStatKey } from '@/store/combatSlice';
import type { RootState } from '@/store';
import { useState } from 'react';
import { rollDie } from '@/utils/dice';
import { nanoid } from '@reduxjs/toolkit';
import { addRoll } from '@/store/rollSlice';
import { Swords, Shield, Footprints, Target, Clock, Heart, Sparkles, Skull } from 'lucide-react';

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
			'FK': '🎯 Fernkampf',
			'INI': '⏱️ Initiative',
		};
		const currentCombatLabel = labelEnum[name];

		if (name === 'INI') {
			const w6 = rollDie(6);
			const initiative = w6 + value + modifier;
			const modifierText = modifier < 0 ? modifier.toString().split('-').join('- ') : `+ ${modifier}`;

			const result = `⏱️ Initiative: ${value} + ${w6} ${modifierText} = ${initiative}`;
			setRollText(result);
			addCombatResult(name, currentCombatLabel, result, [w6]);

			return;
		}

		const d20 = rollDie(20);

		if (d20 === 1) {
			const critText = '⭐ Kritischer Erfolg!';
			setRollText(critText);
			addCombatResult(name, currentCombatLabel, critText, [d20], false, true, false);
			return;
		}

		if (d20 === 20) {
			const failText = '⚠️ Patzer!';
			setRollText(failText);
			addCombatResult(name, currentCombatLabel, failText, [d20], true, false, true);
			return;
		}

		const currentRoll = d20;
		const finalValue = value + modifier;
		const isSuccessful = currentRoll <= finalValue;
		let valueText = `Wurf: ${d20}, Zielwert: ${finalValue}`;

		if (modifier !== 0) {
			valueText = `Wurf: ${d20}, Basis: ${value}, Mod: ${modifier > 0 ? '+' : ''}${modifier} → ${finalValue}`;
		}
		setRollText(valueText);
		const resultText = `${currentCombatLabel} ${isSuccessful ? '✅ gelungen' : '❌ nicht gelungen'} (${valueText})`;

		addCombatResult(name, currentCombatLabel, resultText, [d20], isSuccessful);
	};

	let modifierText = null;
	let modifierColor = '';

	if (modifier < 0) {
		modifierText = 'Erschwernis';
		modifierColor = 'text-amber-700 dark:text-amber-400';
	} else if (modifier > 0) {
		modifierText = 'Erleichterung';
		modifierColor = 'text-sky-700 dark:text-sky-400';
	}

	// Health Bar Percentage
	const healthPercentage = (combat.life.current / combat.life.max) * 100;
	const healthColor = 
		healthPercentage > 66 ? 'bg-success' :
		healthPercentage > 33 ? 'bg-amber-500' :
		'bg-failure';

	return (
		<div className="space-y-6 w-full max-w-5xl mx-auto">
			{/* Lebensenergie Card */}
			<Card variant="parchment">
				<CardHeader>
					<CardTitle className="flex items-center justify-center gap-2">
						<Heart className="w-6 h-6 text-red-500" />
						Lebensenergie
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Health Bar */}
					<div className="w-full bg-muted rounded-full h-8 overflow-hidden border-2 border-aventurian-400 dark:border-aventurian-600">
						<div 
							className={`h-full ${healthColor} transition-all duration-500 flex items-center justify-center text-white font-heading font-bold text-sm`}
							style={{ width: `${Math.max(0, healthPercentage)}%` }}
						>
							{combat.life.current > 0 && `${combat.life.current} / ${combat.life.max}`}
						</div>
					</div>

					{/* LeP Controls */}
					<div className="flex items-center justify-center gap-3">
						<PropertyNumber
							label="Aktuell"
							value={combat.life.current}
							size="m"
							onChange={(value) => dispatch(updateLifeStat({ current: value }))}
						/>
						<span className="text-2xl font-heading">/</span>
						<PropertyNumber
							label="Maximum"
							value={combat.life.max}
							size="m"
							onChange={(value) => dispatch(updateLifeStat({ max: value }))}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Kampfwerte */}
			<Card variant="parchment">
				<CardHeader>
					<CardTitle className="text-center">Kampfwerte</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Kampfwerte Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
						{([
							{ label: 'AT', key: 'attack', icon: Swords },
							{ label: 'FK', key: 'ranged', icon: Target },
							{ label: 'PA', key: 'save', icon: Shield },
							{ label: 'AW', key: 'dodge', icon: Footprints },
							{ label: 'INI', key: 'initiative', icon: Clock },
						] as { label: CombatType; key: CombatStatKey; icon: typeof Swords }[]).map((item) => {
							const Icon = item.icon;
							return (
								<div
									key={item.key}
									className="flex flex-col items-center gap-3 p-4 rounded-lg bg-aventurian-100/50 dark:bg-aventurian-800/50 hover:bg-aventurian-200/50 dark:hover:bg-aventurian-700/50 transition-colors"
								>
									<Icon className="w-6 h-6 text-aventurian-600 dark:text-aventurian-400" />
									<PropertyNumber
										label={item.label}
										value={combat[item.key]}
										size="m"
										onChange={(value) =>
											dispatch(
												updateCombatStat({
													key: item.key,
													value,
												})
											)
										}
									/>
									<Button
										size="sm"
										variant="aventurian"
										onClick={() => rollCombatValue(item.label, combat[item.key])}
										className="w-full"
									>
										Würfeln
									</Button>
								</div>
							);
						})}
					</div>

					{/* Modifikator */}
					<div className="flex flex-col items-center justify-center pt-4 border-t border-aventurian-300 dark:border-aventurian-700">
						<PropertyNumber
							label="Modifikator"
							value={modifier}
							size="s"
							min={-20}
							max={20}
							onChange={setModifier}
						/>
						{modifierText && (
							<span className={`text-sm font-semibold mt-2 ${modifierColor}`}>
								{modifierText}
							</span>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Letzter Wurf */}
			{lastCombatResult && (
				<Card 
					variant={
						lastCombatResult.crit ? 'critical' : 
						lastCombatResult.fail ? 'failure' : 
						lastCombatResult.isSuccessful ? 'success' : 'failure'
					}
					className="animate-in fade-in slide-in-from-bottom-4 duration-500"
				>
					<CardHeader>
						<CardTitle className='text-center flex items-center justify-center gap-3'>
							{lastCombatResult.crit && <Sparkles className="w-6 h-6 animate-glow" />}
							{lastCombatResult.fail && <Skull className="w-6 h-6 shake-error" />}
							{lastCombatResult.label}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Status */}
						{(isAttackType(lastCombatResult.type) && (!lastCombatResult.crit && !lastCombatResult.fail)) && (
							<div className="text-center">
								<p className="text-2xl font-heading font-bold">
									{lastCombatResult.isSuccessful ? '✅ Gelungen' : '❌ Misslungen'}
								</p>
							</div>
						)}

						{/* Würfel */}
						<div className="flex justify-center">
							<DiceIcon
								value={lastCombatResult.values[0]}
								size="lg"
								variant={
									lastCombatResult.crit ? 'critical' : 
									lastCombatResult.fail ? 'failure' : 
									'default'
								}
							/>
						</div>

						{/* Details */}
						<div className="bg-background/50 rounded-lg p-4 text-center">
							<p className="text-sm">{rollText}</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default Combat;