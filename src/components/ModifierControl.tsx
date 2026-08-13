import PropertyNumber from './PropertyNumber';

const MODIFIER_RANGE = 20;

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

type ModifierControlProps = {
	value: number;
	onChange: (value: number) => void;
	/**
	 * Wert für den Hinweistext, falls die App noch etwas aufschlägt (Magie rechnet
	 * je aufrechterhaltenem Zauber −1 dazu). Ohne Angabe gilt der Wert selbst.
	 */
	hintValue?: number;
	/**
	 * `row` stellt die Deutung neben den Stepper statt darunter. In der
	 * Kampfwerte-Karte zählt jeder Pixel Höhe: die Zeile steht über den
	 * Würfeln-Buttons und schiebt sie auf kurzen Fenstern sonst unter den Falz.
	 */
	orientation?: 'stacked' | 'row';
};

/**
 * Der Modifikator-Stepper samt Deutung. Eigene Komponente, weil ihn zwei Stellen
 * zeigen: die Wurfleiste und die Kampfwerte-Karte — dort steht er bewusst direkt
 * über den Würfeln-Buttons, statt am Fuß der Spalte übersehen zu werden.
 */
const ModifierControl = ({
	value,
	onChange,
	hintValue,
	orientation = 'stacked'
}: ModifierControlProps) => (
	<div
		className={orientation === 'row'
			? 'flex items-center gap-2'
			: 'flex flex-col items-center gap-1'}
	>
		<PropertyNumber
			label="Modifikator"
			value={value}
			min={-MODIFIER_RANGE}
			max={MODIFIER_RANGE}
			size="s"
			onChange={onChange}
		/>
		<ModifierHint modifier={hintValue ?? value} />
	</div>
);

export default ModifierControl;
