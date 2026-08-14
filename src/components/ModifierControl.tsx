import PropertyNumber from './PropertyNumber';

const MODIFIER_RANGE = 20;

/** Buch-Konvention: negativer Modifikator = Erschwernis, positiver = Erleichterung. */
const ModifierHint = ({ modifier }: { modifier: number }) => {
	if (modifier === 0) {
		// Leerzeile in Texthöhe, damit der Stepper beim Schritt über 0 nicht springt.
		return <span aria-hidden className="block h-4" />;
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
};

/** Modifikator-Stepper samt Deutung; genutzt von Wurfleiste und Kampfwerte-Raster. */
const ModifierControl = ({ value, onChange, hintValue }: ModifierControlProps) => (
	<div className="flex flex-col items-center gap-1">
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
