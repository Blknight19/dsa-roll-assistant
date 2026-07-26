/** Modifikator als lesbarer Rechenterm, z. B. " − 2" oder " + 3". Leer bei 0. */
export const modifierTerm = (modifier: number): string => {
	if (modifier === 0) return '';
	return modifier < 0 ? ` − ${Math.abs(modifier)}` : ` + ${modifier}`;
};

/** Modifikator mit explizitem Vorzeichen, z. B. "−2" oder "+3". */
export const signedModifier = (modifier: number): string =>
	modifier < 0 ? `−${Math.abs(modifier)}` : `+${modifier}`;
