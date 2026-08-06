import PropertyNumber from './PropertyNumber';
import { Button } from '@/components/ui/button';
import { Dices } from 'lucide-react';

export const MODIFIER_RANGE = 20;

type RollBarProps = {
	modifier: number;
	onModifierChange: (value: number) => void;
	/**
	 * Ohne `onRoll` trägt die Leiste nur den Modifikator — im Kampf sitzt der
	 * Auslöser an den einzelnen Kampfwerten, nicht in der Leiste.
	 */
	onRoll?: () => void;
	disabled?: boolean;
	label?: string;
	/** Text statt Knopf, wenn der Wurf woanders ausgelöst wird. */
	note?: string;
	/**
	 * Auf dem Handy klebt die Leiste am unteren Rand (Daumenzone); auf dem Desktop
	 * sitzt sie als Karte am Fuß der Eingabespalte.
	 */
	sticky?: boolean;
	/**
	 * Aufschlag, den die App selbst herleitet (z. B. −1 je aufrechterhaltenem Zauber).
	 * Bewusst getrennt vom manuellen Wert: sonst driften beide auseinander, sobald
	 * sich die Herleitung ändert.
	 */
	autoModifier?: number;
	autoNote?: string;
};

/** Buch-Konvention: negativer Modifikator = Erschwernis, positiver = Erleichterung. */
const ModifierHint = ({ modifier }: { modifier: number }) => {
	if (modifier === 0) {
		return <span className="text-xs text-muted-foreground">keine</span>;
	}
	return modifier < 0 ? (
		<span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Erschwernis</span>
	) : (
		<span className="text-xs font-semibold text-sky-700 dark:text-sky-400">Erleichterung</span>
	);
};

const RollBar = ({
	modifier,
	onModifierChange,
	onRoll,
	disabled = false,
	label = 'Würfeln',
	note,
	sticky = false,
	autoModifier = 0,
	autoNote
}: RollBarProps) => {
	const total = modifier + autoModifier;

	return (
		<div
			className={
				sticky
					? 'sticky bottom-0 z-40 -mx-4 border-t border-aventurian-300 bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm dark:border-aventurian-700'
					: 'rounded-lg border border-aventurian-300 bg-card p-4 dark:border-aventurian-700'
			}
		>
			<div className="mx-auto flex max-w-3xl items-end gap-4">
				<div className="flex flex-col items-center gap-1">
					<PropertyNumber
						label="Modifikator"
						value={modifier}
						min={-MODIFIER_RANGE}
						max={MODIFIER_RANGE}
						size="s"
						onChange={onModifierChange}
					/>
					<ModifierHint modifier={total} />
				</div>

				{onRoll ? (
					<Button
						onClick={onRoll}
						size="xl"
						variant="aventurian"
						disabled={disabled}
						className="mb-5 flex-1 shadow-lg hover:shadow-xl"
					>
						<Dices className="mr-2 h-6 w-6" />
						{label}
					</Button>
				) : (
					note && <p className="mb-7 flex-1 text-sm text-muted-foreground">{note}</p>
				)}
			</div>

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
