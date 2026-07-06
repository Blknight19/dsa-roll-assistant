import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import PropertyNumber from './PropertyNumber';
import DiceIcon from './DiceIcon';
import { Button } from './ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { updateCombatStat, updateLifeStat, type CombatStatKey } from '@/store/combatSlice';
import type { RootState } from '@/store';
import { useState } from 'react';
import { rollDie } from '@/utils/dice';
import { evaluateCombatRoll } from '@/utils/rules';
import { nanoid } from '@reduxjs/toolkit';
import { addRoll } from '@/store/rollSlice';
import { Swords, Shield, Footprints, Target, Clock, Heart, Sparkles, Skull, Check, X } from 'lucide-react';

type CombatType = 'AT' | 'PA' | 'AW' | 'FK' | 'INI'

type LastCombatResult = {
	type: CombatType;
	label: string;
	values: number[];
	isSuccessful: boolean;
	status: string;
	crit?: boolean;
	fail?: boolean;
	confirmation?: { roll: number; confirmed: boolean };
}

const combatLabels: Record<CombatType, string> = {
	AT: 'Attacke',
	PA: 'Parade',
	AW: 'Ausweichen',
	FK: 'Fernkampf',
	INI: 'Initiative',
};

const combatIcons: Record<CombatType, typeof Swords> = {
	AT: Swords,
	PA: Shield,
	AW: Footprints,
	FK: Target,
	INI: Clock,
};

/** Modifikator als lesbarer Rechenterm, z. B. " − 2" oder " + 3". */
const modifierTerm = (modifier: number): string => {
	if (modifier === 0) return '';
	return modifier < 0 ? ` − ${Math.abs(modifier)}` : ` + ${modifier}`;
};

const Combat = () => {
	const dispatch = useDispatch();
	const combat = useSelector((state: RootState) => state.combat);
	const confirmCriticals = useSelector((state: RootState) => state.settings.confirmCriticals);
	const [modifier, setModifier] = useState<number>(0);
	const [rollText, setRollText] = useState<string>('');

	const [lastCombatResult, setLastCombatResult] = useState<LastCombatResult | null>(null);

	const isAttackType = (type: CombatType) => ['AT', 'PA', 'AW', 'FK'].includes(type);

	const addCombatResult = (result: LastCombatResult, historyText: string) => {
		setLastCombatResult(result);
		dispatch(addRoll({
			id: nanoid(),
			type: 'Kampf',
			values: result.values,
			result: historyText,
			date: new Date().toISOString()
		}));
	};

	const rollCombatValue = (name: CombatType, value: number) => {
		const label = combatLabels[name];

		if (name === 'INI') {
			const w6 = rollDie(6);
			const initiative = value + w6 + modifier;

			const text = `Initiative: ${value} + ${w6}${modifierTerm(modifier)} = ${initiative}`;
			setRollText(text);
			addCombatResult({ type: name, label, values: [w6], isSuccessful: true, status: `${initiative}` }, text);

			return;
		}

		const d20 = rollDie(20);
		const needsConfirmation = confirmCriticals && (d20 === 1 || d20 === 20);
		const evaluation = evaluateCombatRoll(value, modifier, d20, needsConfirmation ? rollDie(20) : undefined);
		const { target, success, special, confirmation } = evaluation;

		let status: string;
		if (special === 'krit') status = 'Kritischer Erfolg!';
		else if (special === 'patzer') status = 'Patzer!';
		else if (d20 === 1) status = 'Gelungen (Krit nicht bestätigt)';
		else if (d20 === 20) status = 'Misslungen (Patzer nicht bestätigt)';
		else status = success ? 'Gelungen' : 'Misslungen';

		let valueText = `Wurf: ${d20}, Zielwert: ${target}`;
		if (modifier !== 0) {
			valueText = `Wurf: ${d20}, Basis: ${value}${modifierTerm(modifier)} → ${target}`;
		}
		if (confirmation) {
			valueText += ` | Bestätigung: ${confirmation.roll}`;
		}

		setRollText(valueText);

		addCombatResult({
			type: name,
			label,
			values: confirmation ? [d20, confirmation.roll] : [d20],
			isSuccessful: success,
			status,
			crit: special === 'krit',
			fail: special === 'patzer',
			confirmation
		}, `${label}: ${status} (${valueText})`);
	};

	// Buch-Konvention: negativer Modifikator = Erschwernis
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

	const ResultIcon = lastCombatResult ? combatIcons[lastCombatResult.type] : null;

	return (
		<div className="space-y-6 w-full max-w-5xl mx-auto">
			{/* Screenreader-Ansage des Ergebnisses */}
			<div aria-live="polite" className="sr-only">
				{lastCombatResult ? `${lastCombatResult.label}: ${lastCombatResult.status}` : ''}
			</div>

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
										aria-label={`${combatLabels[item.label]} würfeln`}
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

			{/* Letzter Wurf — direkt unter den Würfel-Buttons, ohne Scrollen sichtbar */}
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
							{!lastCombatResult.crit && !lastCombatResult.fail && ResultIcon && <ResultIcon className="w-6 h-6" />}
							{lastCombatResult.label}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Status */}
						{isAttackType(lastCombatResult.type) && !lastCombatResult.crit && !lastCombatResult.fail && (
							<div className="text-center">
								<p className="text-2xl font-heading font-bold flex items-center justify-center gap-2">
									{lastCombatResult.isSuccessful
										? <Check className="w-6 h-6 text-success-dark dark:text-success-light" />
										: <X className="w-6 h-6 text-failure-dark dark:text-failure-light" />}
									{lastCombatResult.status}
								</p>
							</div>
						)}

						{/* Würfel */}
						<div className="flex justify-center gap-3">
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

						{/* Bestätigungswurf */}
						{lastCombatResult.confirmation && (
							<div className="flex items-center justify-center gap-2 text-sm font-semibold">
								<span>Bestätigung: {lastCombatResult.confirmation.roll}</span>
								{lastCombatResult.confirmation.confirmed
									? <Check className="w-4 h-4 text-success-dark dark:text-success-light" aria-label="bestätigt" />
									: <X className="w-4 h-4 text-failure-dark dark:text-failure-light" aria-label="nicht bestätigt" />}
							</div>
						)}

						{/* Details */}
						<div className="bg-background/50 rounded-lg p-4 text-center">
							<p className="text-sm">{rollText}</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Lebensenergie Card */}
			<Card variant="parchment">
				<CardHeader>
					<CardTitle className="flex items-center justify-center gap-2">
						<Heart className="w-6 h-6 text-red-500" />
						Lebensenergie
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Health Bar mit Schmerzstufen-Markern bei ¼, ½ und ¾ */}
					<div className="relative w-full bg-muted rounded-full h-8 overflow-hidden border-2 border-aventurian-400 dark:border-aventurian-600">
						<div
							className={`h-full ${healthColor} transition-all duration-500 flex items-center justify-center text-white font-heading font-bold text-sm`}
							style={{ width: `${Math.max(0, healthPercentage)}%` }}
						>
							{combat.life.current > 0 && `${combat.life.current} / ${combat.life.max}`}
						</div>
						{[25, 50, 75].map((percent) => (
							<div
								key={percent}
								className="absolute top-0 h-full w-px bg-foreground/30"
								style={{ left: `${percent}%` }}
								title={`Schmerzstufe bei ${Math.ceil(combat.life.max * percent / 100)} LeP`}
							/>
						))}
					</div>

					{/* Schnell-Schaden */}
					<div className="flex items-center justify-center gap-2">
						<span className="text-sm font-heading uppercase tracking-wide text-aventurian-700 dark:text-aventurian-300 mr-1">
							Schaden
						</span>
						{[1, 3, 5].map((damage) => (
							<Button
								key={damage}
								variant="outline"
								size="sm"
								className="h-11 min-w-11 font-heading"
								onClick={() => dispatch(updateLifeStat({ current: combat.life.current - damage }))}
								aria-label={`${damage} Schaden nehmen`}
							>
								−{damage}
							</Button>
						))}
						<Button
							variant="outline"
							size="sm"
							className="h-11 min-w-11 font-heading"
							onClick={() => dispatch(updateLifeStat({ current: Math.min(combat.life.max, combat.life.current + 1) }))}
							aria-label="1 Lebenspunkt heilen"
						>
							+1
						</Button>
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

		</div>
	);
};

export default Combat;
