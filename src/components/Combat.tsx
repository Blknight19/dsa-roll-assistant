import { useDispatch, useSelector } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import PropertyNumber from './PropertyNumber';
import RollBar from './RollBar';
import RollResultCard from './RollResultCard';
import { Button } from './ui/button';
import type { RootState } from '@/store';
import {
	COMBAT_STAT_MAX,
	LIFE_MAX,
	lifeFillPercent,
	updateCombatStat,
	updateLifeStat,
	type CombatStatKey
} from '@/store/combatSlice';
import {
	setCombatLastRoll,
	setCombatModifier,
	type CombatRoll,
	type CombatType
} from '@/store/combatRollSlice';
import { addRoll } from '@/store/rollSlice';
import { rollDie } from '@/utils/dice';
import { evaluateCombatRoll } from '@/utils/rules';
import { modifierTerm } from '@/utils/format';
import { Swords, Shield, Footprints, Target, Clock, Heart, Sparkles, Skull, Check, X } from 'lucide-react';

const combatLabels: Record<CombatType, string> = {
	AT: 'Attacke',
	PA: 'Parade',
	AW: 'Ausweichen',
	FK: 'Fernkampf',
	INI: 'Initiative'
};

const combatIcons: Record<CombatType, typeof Swords> = {
	AT: Swords,
	PA: Shield,
	AW: Footprints,
	FK: Target,
	INI: Clock
};

const combatStats: { type: CombatType; key: CombatStatKey }[] = [
	{ type: 'AT', key: 'attack' },
	{ type: 'FK', key: 'ranged' },
	{ type: 'PA', key: 'save' },
	{ type: 'AW', key: 'dodge' },
	{ type: 'INI', key: 'initiative' }
];

const statusText = (roll: CombatRoll): string => {
	if (!roll.result) return String(roll.initiative ?? '');
	const { special, d20, success } = roll.result;
	if (special === 'krit') return 'Kritischer Erfolg!';
	if (special === 'patzer') return 'Patzer!';
	if (d20 === 1) return 'Gelungen (Krit nicht bestätigt)';
	if (d20 === 20) return 'Misslungen (Patzer nicht bestätigt)';
	return success ? 'Gelungen' : 'Misslungen';
};

/**
 * Regelfolge zum Wurf. Nur für Attacke und Fernkampf belegt — für Parade und
 * Ausweichen behandelt das Regelwerk kritische Erfolge gesondert, teils optional.
 */
const consequenceText = (roll: CombatRoll): string | undefined => {
	if (roll.type !== 'AT' && roll.type !== 'FK') return undefined;
	if (!roll.result) return undefined;
	const { special, d20 } = roll.result;
	if (special === 'krit') return 'Verteidigung des Ziels halbiert, Schaden verdoppelt';
	if (special === 'patzer') return 'Patzer-Tabelle auswerten';
	if (d20 === 1) return 'Verteidigung des Ziels halbiert';
	return undefined;
};

const derivationText = (roll: CombatRoll): string => {
	if (!roll.result) {
		return `${roll.base} + ${roll.dice[0]}${modifierTerm(roll.modifier)} = ${roll.initiative}`;
	}
	const { d20, target, confirmation } = roll.result;
	const base = roll.modifier === 0
		? `Wurf: ${d20}, Zielwert: ${target}`
		: `Wurf: ${d20}, Basis: ${roll.base}${modifierTerm(roll.modifier)} → ${target}`;
	return confirmation ? `${base} | Bestätigung: ${confirmation.roll}` : base;
};

const buildInitiativeRoll = (base: number, modifier: number): CombatRoll => {
	const w6 = rollDie(6);
	return { type: 'INI', base, modifier, initiative: base + w6 + modifier, dice: [w6] };
};

const buildCheckRoll = (
	type: CombatType,
	base: number,
	modifier: number,
	confirmCriticals: boolean
): CombatRoll => {
	const d20 = rollDie(20);
	const needsConfirmation = confirmCriticals && (d20 === 1 || d20 === 20);
	const result = evaluateCombatRoll(base, modifier, d20, needsConfirmation ? rollDie(20) : undefined);
	return {
		type,
		base,
		modifier,
		dice: result.confirmation ? [d20, result.confirmation.roll] : [d20],
		result
	};
};

const Combat = () => {
	const dispatch = useDispatch();
	const combat = useSelector((state: RootState) => state.combat);
	const confirmCriticals = useSelector((state: RootState) => state.settings.confirmCriticals);
	const { modifier, lastRoll } = useSelector((state: RootState) => state.combatRoll);

	const roll = (type: CombatType, base: number) => {
		const snapshot = type === 'INI'
			? buildInitiativeRoll(base, modifier)
			: buildCheckRoll(type, base, modifier, confirmCriticals);

		dispatch(setCombatLastRoll(snapshot));
		dispatch(addRoll({
			id: nanoid(),
			type: 'Kampf',
			values: snapshot.dice,
			result: `${combatLabels[type]}: ${statusText(snapshot)} (${derivationText(snapshot)})`,
			date: new Date().toISOString()
		}));
	};

	// Farbe nach dem exakten Verhältnis, Breite mit Mindest-Streifen — sonst
	// würde der Streifen bei sehr wenig LeP die Farbschwelle verfälschen.
	const lifeRatio = (combat.life.current / combat.life.max) * 100;
	const lifeWidth = lifeFillPercent(combat.life);
	const healthColor =
		lifeRatio > 66 ? 'bg-success' : lifeRatio > 33 ? 'bg-amber-500' : 'bg-failure';

	const setup = (
		<>
			<Card variant="parchment">
				<CardHeader>
					<CardTitle className="text-lg">Kampfwerte</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						{combatStats.map(({ type, key }) => {
							const Icon = combatIcons[type];
							return (
								<div
									key={key}
									className="flex flex-col items-center gap-2 rounded-lg bg-aventurian-100/50 p-3 transition-colors hover:bg-aventurian-200/50 dark:bg-aventurian-800/50 dark:hover:bg-aventurian-700/50"
								>
									<Icon className="h-5 w-5 text-aventurian-600 dark:text-aventurian-400" />
									<PropertyNumber
										label={type}
										value={combat[key]}
										max={COMBAT_STAT_MAX}
										size="s"
										onChange={(value) => dispatch(updateCombatStat({ key, value }))}
									/>
									<Button
										size="sm"
										variant="aventurian"
										onClick={() => roll(type, combat[key])}
										className="w-full"
										aria-label={`${combatLabels[type]} würfeln`}
									>
										Würfeln
									</Button>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			<Card variant="parchment">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-lg">
						<Heart className="h-5 w-5 text-failure-dark dark:text-failure-light" />
						Lebensenergie
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div
						className="relative h-8 w-full overflow-hidden rounded-full border-2 border-aventurian-400 bg-muted dark:border-aventurian-600"
						role="img"
						aria-label={`Lebensenergie ${combat.life.current} von ${combat.life.max}`}
					>
						<div
							className={`h-full transition-all duration-500 ${healthColor}`}
							style={{ width: `${lifeWidth}%` }}
						/>
						{[25, 50, 75].map((mark) => (
							<div
								key={mark}
								className="absolute top-0 h-full w-px bg-foreground/30"
								style={{ left: `${mark}%` }}
								title={`Schmerzstufe bei ${Math.ceil(combat.life.max * mark / 100)} LeP`}
							/>
						))}

						{/*
						  Die Zahl liegt über der ganzen Leiste (in der Füllung wurde sie bei
						  wenig LeP abgeschnitten) und wird zweimal gezeichnet: einmal in
						  Vordergrundfarbe für die leere Spur, darüber dieselbe Zahl in dunkler
						  Tinte, exakt an der Füllkante beschnitten. So stimmt der Kontrast auf
						  beiden Seiten, ohne Kasten hinter dem Text.
						*/}
						<span
							aria-hidden
							className="absolute inset-0 flex items-center justify-center font-heading text-sm font-bold tabular-nums text-foreground"
						>
							{combat.life.current} / {combat.life.max}
						</span>
						<span
							aria-hidden
							className="absolute inset-0 flex items-center justify-center font-heading text-sm font-bold tabular-nums text-black transition-all duration-500"
							style={{ clipPath: `inset(0 ${100 - lifeWidth}% 0 0)` }}
						>
							{combat.life.current} / {combat.life.max}
						</span>
					</div>

					<div className="flex flex-wrap items-center justify-center gap-2">
						<span className="mr-1 font-heading text-sm uppercase tracking-wide text-aventurian-700 dark:text-aventurian-300">
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
							onClick={() => dispatch(updateLifeStat({ current: combat.life.current + 1 }))}
							aria-label="1 Lebenspunkt heilen"
						>
							+1
						</Button>
					</div>

					<div className="flex items-center justify-center gap-3">
						<PropertyNumber
							label="Aktuell"
							value={combat.life.current}
							max={combat.life.max}
							size="s"
							onChange={(value) => dispatch(updateLifeStat({ current: value }))}
						/>
						<span className="mb-5 font-heading text-xl">/</span>
						<PropertyNumber
							label="Maximum"
							value={combat.life.max}
							min={1}
							max={LIFE_MAX}
							size="s"
							onChange={(value) => dispatch(updateLifeStat({ max: value }))}
						/>
					</div>
				</CardContent>
			</Card>
		</>
	);

	const ResultIcon = lastRoll ? combatIcons[lastRoll.type] : null;

	const result = lastRoll && (
		<RollResultCard
			tone={
				lastRoll.result?.special === 'krit' ? 'critical' :
				lastRoll.result && !lastRoll.result.success ? 'failure' : 'success'
			}
			title={`${combatLabels[lastRoll.type]}${lastRoll.result ? ` — ${statusText(lastRoll)}` : ''}`}
			icon={
				lastRoll.result?.special === 'krit' ? <Sparkles className="h-6 w-6 animate-glow" /> :
				lastRoll.result?.special === 'patzer' ? <Skull className="h-6 w-6 shake-error" /> :
				lastRoll.result ? (
					lastRoll.result.success
						? <Check className="h-6 w-6" />
						: <X className="h-6 w-6" />
				) : ResultIcon ? <ResultIcon className="h-6 w-6" /> : undefined
			}
			hero={
				lastRoll.result
					? undefined
					: { value: lastRoll.initiative ?? 0, caption: 'Initiative' }
			}
			dice={lastRoll.dice.map((value, index) => ({
				value,
				size: index === 0 ? 'lg' : 'md',
				tone: index > 0 ? 'default' :
					lastRoll.result?.special === 'krit' ? 'critical' :
					lastRoll.result?.special === 'patzer' ? 'failure' : 'default'
			}))}
			consequence={consequenceText(lastRoll)}
			details={
				<div className="space-y-2 rounded-lg bg-background/50 p-4 text-center text-sm">
					<p>{derivationText(lastRoll)}</p>
					{lastRoll.result?.confirmation && (
						<p className="flex items-center justify-center gap-2 font-semibold">
							Bestätigungswurf {lastRoll.result.confirmation.roll}
							{lastRoll.result.confirmation.confirmed
								? <Check className="h-4 w-4 text-success-dark dark:text-success-light" aria-label="bestätigt" />
								: <X className="h-4 w-4 text-failure-dark dark:text-failure-light" aria-label="nicht bestätigt" />}
						</p>
					)}
				</div>
			}
		/>
	);

	const modifierBar = (sticky: boolean) => (
		<RollBar
			sticky={sticky}
			modifier={modifier}
			onModifierChange={(value) => dispatch(setCombatModifier(value))}
			note="Gilt für den nächsten Kampfwurf."
		/>
	);

	return (
		<div className="mx-auto w-full max-w-6xl lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
			<div aria-live="polite" className="sr-only">
				{lastRoll ? `${combatLabels[lastRoll.type]}: ${statusText(lastRoll)}` : ''}
			</div>

			<div className="lg:sticky lg:top-24 lg:order-2">
				{result}
				{!result && (
					<Card variant="parchment" className="hidden border-dashed lg:block">
						<CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
							<Swords className="h-8 w-8 opacity-50" />
							<p className="text-sm">Das Ergebnis erscheint hier.</p>
						</CardContent>
					</Card>
				)}
			</div>

			<div className="mt-4 flex flex-col gap-4 lg:mt-0 lg:order-1">
				{setup}
				<div className="hidden lg:block">{modifierBar(false)}</div>
			</div>

			<div className="lg:hidden">{modifierBar(true)}</div>
		</div>
	);
};

export default Combat;
