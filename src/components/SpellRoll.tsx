import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import { roll3D20 } from '@/utils/dice';
import { evaluateTalentCheck, spellAspCost, upkeepModifier } from '@/utils/rules';
import { signedModifier } from '@/utils/format';
import RollBar from './RollBar';
import CheckResultCard, { checkSummary } from './CheckResultCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from '@/components/ui/command';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { addRoll } from '@/store/rollSlice';
import { changeAsp } from '@/store/spellbookSlice';
import {
	markLastRollRefunded,
	selectSpell,
	setSpellLastRoll,
	setSpellModifier,
	type SpellRoll as SpellRollSnapshot
} from '@/store/spellRollSlice';
import type { RootState } from '@/store';
import { ChevronDown, RotateCcw, Wand2 } from 'lucide-react';

/** Begründung der Buchung — die halbe Zahl allein wirkt sonst wie ein Fehler. */
const costNote = (roll: SpellRollSnapshot): string => {
	if (roll.result.special === 'krit') return `−${roll.aspSpent} AsP (halbe Kosten, kritischer Erfolg)`;
	if (!roll.result.success) return `−${roll.aspSpent} AsP (halbe Kosten, Probe misslungen)`;
	return `−${roll.aspSpent} AsP`;
};

const SpellRoll = () => {
	const dispatch = useDispatch();
	const attributes = useSelector((state: RootState) => state.attributes);
	const { spells, asp, upkeep } = useSelector((state: RootState) => state.spellbook);
	const spellRoll = useSelector((state: RootState) => state.spellRoll);

	const [pickerOpen, setPickerOpen] = useState(false);

	const lastRoll = spellRoll.lastRoll;
	const auto = upkeepModifier(upkeep.length);
	const totalModifier = spellRoll.modifier + auto;
	const canAfford = spellRoll.cost <= asp.current;
	const ready = spellRoll.spellId !== null && canAfford;

	const resultRef = useRef<HTMLDivElement>(null);
	const previousRoll = useRef(lastRoll);
	useEffect(() => {
		if (lastRoll && lastRoll !== previousRoll.current) {
			resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
		previousRoll.current = lastRoll;
	}, [lastRoll]);

	const pick = (spellId: string) => {
		const spell = spells.find(entry => entry.id === spellId);
		if (!spell) return;
		dispatch(selectSpell({
			id: spell.id,
			name: spell.name,
			entries: spell.attributes.map(attribute => ({ attribute, value: attributes[attribute] })),
			taw: spell.value,
			cost: spell.cost,
			duration: spell.duration
		}));
		setPickerOpen(false);
	};

	const cast = () => {
		const dice = roll3D20();
		const attrs = spellRoll.entries.map(entry => entry.value) as [number, number, number];
		const result = evaluateTalentCheck(attrs, spellRoll.taw, totalModifier, dice);
		const aspSpent = spellAspCost(spellRoll.cost, result);

		const snapshot: SpellRollSnapshot = {
			spellId: spellRoll.spellId!,
			spellName: spellRoll.spellName,
			entries: spellRoll.entries.map(entry => ({ ...entry })),
			modifier: totalModifier,
			taw: spellRoll.taw,
			aspSpent,
			duration: spellRoll.duration,
			result
		};

		dispatch(setSpellLastRoll(snapshot));
		dispatch(changeAsp(-aspSpent));

		const outcome = result.success ? `(QS: ${result.qs})` : '(Misslungen)';
		const special = result.special === 'krit'
			? 'Kritischer Erfolg! '
			: result.special === 'patzer' ? 'Patzer! ' : '';

		dispatch(addRoll({
			id: nanoid(),
			type: 'Zauber',
			values: [...result.dice],
			result: `${special}${spellRoll.spellName}: ${result.fp} FP ${outcome} [Mod ${signedModifier(totalModifier)}, −${aspSpent} AsP]`,
			date: new Date().toISOString()
		}));
	};

	const undoBooking = () => {
		if (!lastRoll || !spellRoll.lastRollBooked) return;
		dispatch(changeAsp(lastRoll.aspSpent));
		dispatch(markLastRollRefunded());
	};

	const setup = (
		<Card variant="parchment">
			<CardHeader>
				<CardTitle className="text-lg">Zauberprobe</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<Popover open={pickerOpen} onOpenChange={setPickerOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="aventurian"
							size="lg"
							role="combobox"
							className="w-full justify-between"
							aria-expanded={pickerOpen}
							disabled={spells.length === 0}
						>
							{spellRoll.spellName || (spells.length === 0 ? 'Zauberbuch ist leer' : 'Zauber wählen…')}
							<ChevronDown className="opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[min(24rem,90vw)] p-0">
						<Command>
							<CommandInput placeholder="Zauber suchen…" className="font-body" />
							<CommandList>
								<CommandEmpty>Kein Zauber gefunden</CommandEmpty>
								<CommandGroup>
									{spells.map(spell => (
										<CommandItem key={spell.id} onSelect={() => pick(spell.id)} className="font-body">
											{spell.name}
											<span className="ml-auto text-xs text-muted-foreground">{spell.cost} AsP</span>
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>

				{spells.length === 0 && (
					<p className="text-sm text-muted-foreground">
						Trage im Charakterbogen unter „Zauberbuch" Zauber ein.
					</p>
				)}

				{spellRoll.spellId && (
					<>
						<div className="flex flex-wrap items-center gap-2">
							{spellRoll.entries.map((entry, index) => (
								<span
									key={index}
									className="rounded-lg bg-aventurian-100/60 px-3 py-2 font-heading text-sm dark:bg-aventurian-800/60"
								>
									{entry.attribute} <span className="font-bold">{entry.value}</span>
								</span>
							))}
							<span className="rounded-lg bg-aventurian-100/60 px-3 py-2 font-heading text-sm dark:bg-aventurian-800/60">
								FW <span className="font-bold">{spellRoll.taw}</span>
							</span>
						</div>

						<div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
							<span className="font-heading text-sm">
								Kosten <span className="font-bold text-magic-dark dark:text-magic-light">{spellRoll.cost} AsP</span>
							</span>
							<span className={`text-sm ${canAfford ? 'text-muted-foreground' : 'font-semibold text-failure-dark dark:text-failure-light'}`}>
								{canAfford
									? `→ ${asp.current - spellRoll.cost} AsP übrig`
									: `Nicht genug AsP (${asp.current} vorhanden)`}
							</span>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);

	const result = lastRoll && (
		<div ref={resultRef}>
			<CheckResultCard
				name={lastRoll.spellName}
				entries={lastRoll.entries}
				modifier={lastRoll.modifier}
				taw={lastRoll.taw}
				tawLabel="Fertigkeitswert"
				result={lastRoll.result}
				// Die AsP-Buchung verdrängt den Krit-Standardtext: am Tisch ist die
				// Frage „was hat es gekostet", nicht „warum ist es gelungen".
				consequence={
					spellRoll.lastRollBooked
						? costNote(lastRoll)
						: `Buchung zurückgenommen (${lastRoll.aspSpent} AsP erstattet)`
				}
				action={
					spellRoll.lastRollBooked && lastRoll.aspSpent > 0 ? (
						<Button variant="outline" size="sm" onClick={undoBooking}>
							<RotateCcw className="mr-1 h-4 w-4" />
							AsP zurückbuchen
						</Button>
					) : undefined
				}
			/>
		</div>
	);

	const rollBar = (sticky: boolean) => (
		<RollBar
			sticky={sticky}
			modifier={spellRoll.modifier}
			onModifierChange={(value) => dispatch(setSpellModifier(value))}
			onRoll={cast}
			disabled={!ready}
			label="Zaubern"
			autoModifier={auto}
			autoNote={upkeep.length > 0
				? `${auto} durch ${upkeep.length} ${upkeep.length === 1 ? 'laufenden Zauber' : 'laufende Zauber'}`
				: undefined}
		/>
	);

	return (
		<div className="mx-auto w-full max-w-6xl lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
			<div aria-live="polite" className="sr-only">
				{lastRoll ? checkSummary(lastRoll.result) : ''}
			</div>

			<div className="lg:sticky lg:top-24 lg:order-2">
				{result}
				{!result && (
					<Card variant="parchment" className="hidden border-dashed lg:block">
						<CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
							<Wand2 className="h-8 w-8 opacity-50" />
							<p className="text-sm">
								{spellRoll.spellName ? 'Das Ergebnis erscheint hier.' : 'Wähle einen Zauber, um zu wirken.'}
							</p>
						</CardContent>
					</Card>
				)}
			</div>

			<div className="mt-4 flex flex-col gap-4 lg:mt-0 lg:order-1">
				{setup}
				<div className="hidden lg:block">{rollBar(false)}</div>
			</div>

			<div className="lg:hidden">{rollBar(true)}</div>
		</div>
	);
};

export default SpellRoll;
