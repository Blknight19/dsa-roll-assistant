import ModifierControl from './ModifierControl';
import { Button } from '@/components/ui/button';
import { Dices } from 'lucide-react';
import { cn } from '@/lib/utils';

type RollBarProps = {
	modifier: number;
	onModifierChange: (value: number) => void;
	onRoll: () => void;
	disabled?: boolean;
	/**
	 * Warum der Auslöser grau ist. Gehört an die Leiste und nicht in die
	 * Ergebnisspalte: die gibt es auf dem Handy nicht, dort stand vorher ein
	 * toter Knopf ohne jede Begründung.
	 */
	disabledReason?: string;
	label?: string;
	/**
	 * `true` rendert die Handy-Fassung (klebt in der Daumenzone), `false` die
	 * Desktop-Fassung am Fuß der Eingabespalte — gleiche Karte, andere Position.
	 * Die Leiste bringt ihren Breakpoint selbst mit, statt in einem Wrapper zu
	 * stecken: ein Wrapper wäre der umschließende Block und exakt so hoch wie sie
	 * — dann hat `position: sticky` keinen Weg und wirkt gar nicht.
	 */
	sticky?: boolean;
	/**
	 * Aufschlag, den die App selbst herleitet (z. B. −1 je aufrechterhaltenem Zauber).
	 * Bewusst getrennt vom manuellen Wert: sonst driften beide auseinander, sobald
	 * sich die Herleitung ändert.
	 */
	autoModifier?: number;
	autoNote?: string;
	className?: string;
};

const RollBar = ({
	modifier,
	onModifierChange,
	onRoll,
	disabled = false,
	disabledReason,
	label = 'Würfeln',
	sticky = false,
	autoModifier = 0,
	autoNote,
	className
}: RollBarProps) => {
	const total = modifier + autoModifier;

	return (
		<div
			className={cn(
				'rounded-lg border border-aventurian-300 bg-card p-4 shadow-lg dark:border-aventurian-700',
				sticky
					? 'sticky bottom-4 z-40 mt-4 lg:hidden'
					: 'hidden lg:sticky lg:bottom-4 lg:block',
				className
			)}
		>
			<div className="mx-auto flex max-w-3xl flex-col items-center gap-3 sm:flex-row sm:items-end sm:gap-4">
				<ModifierControl value={modifier} onChange={onModifierChange} hintValue={total} />

				<Button
					onClick={onRoll}
					size="xl"
					variant="aventurian"
					disabled={disabled}
					className="w-full shadow-lg hover:shadow-xl sm:mb-5 sm:w-auto sm:flex-1"
				>
					<Dices className="mr-2 h-6 w-6" />
					{label}
				</Button>
			</div>

			{disabled && disabledReason && (
				<p className="mx-auto mt-2 max-w-3xl text-center text-sm text-muted-foreground">
					{disabledReason}
				</p>
			)}

			{autoModifier !== 0 && (
				<p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground">
					Gesamt {total >= 0 ? `+${total}` : total}
					{autoNote && <> — {autoNote}</>}
				</p>
			)}
		</div>
	);
};

export default RollBar;
