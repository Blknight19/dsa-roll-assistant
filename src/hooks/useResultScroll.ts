import { useEffect, useRef } from 'react';

/**
 * Ref für die Ergebnisanzeige, die nach einem neuen Wurf in den Blick geholt
 * wird – nicht beim bloßen Zurückwechseln auf den Tab.
 *
 * Das Ziel braucht `scroll-mt-*`: der App-Header klebt oben und verdeckt sonst
 * die Überschrift, sobald die Ergebniskarte höher ist als das Fenster.
 */
export const useResultScroll = <T,>(lastRoll: T) => {
	const ref = useRef<HTMLDivElement>(null);
	const previous = useRef(lastRoll);

	useEffect(() => {
		const element = ref.current;
		if (element && lastRoll && lastRoll !== previous.current) {
			// Die globale reduced-motion-Regel greift nur für CSS, dieses Scrollen ist JS.
			const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			// `nearest` bewegt am wenigsten, richtet aber an der Unterkante aus, sobald die
			// Karte höher ist als der Platz unter dem Header – dann verschwindet die
			// Überschrift. In dem Fall oben ausrichten und lieber unten abschneiden.
			const offset = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
			const fits = element.getBoundingClientRect().height <= window.innerHeight - offset;

			element.scrollIntoView({
				behavior: reduce ? 'auto' : 'smooth',
				block: fits ? 'nearest' : 'start'
			});
		}
		previous.current = lastRoll;
	}, [lastRoll]);

	return ref;
};
