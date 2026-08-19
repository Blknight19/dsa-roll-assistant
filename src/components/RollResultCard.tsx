import { useState, type ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DiceIcon from './DiceIcon';
import { ChevronRight } from 'lucide-react';

export type ResultTone = 'success' | 'failure' | 'critical';

export type ResultDie = {
	value: number;
	tone?: 'default' | 'critical' | 'failure';
	size?: 'sm' | 'md' | 'lg';
};

type RollResultCardProps = {
	tone: ResultTone;
	title: string;
	icon?: ReactNode;
	/** Die eine Zahl, die am Tisch gefragt wird – QS, Initiative oder Summe. */
	hero?: { value: ReactNode; caption: string; note?: string };
	dice: ResultDie[];
	/** Regelfolge in einem Satz, z. B. „Verteidigung des Ziels halbiert". */
	consequence?: string;
	/** Herleitung, eingeklappt: am Tisch zählt das Ergebnis, nicht der Weg dorthin. */
	details?: ReactNode;
	detailsLabel?: string;
	/** Eine Folgeaktion zum Ergebnis, z. B. „Aufrechterhalten" oder „Rückgängig". */
	action?: ReactNode;
};

const toneClasses: Record<ResultTone, { text: string; card: ResultTone }> = {
	success: { text: 'text-success-dark dark:text-success-light', card: 'success' },
	failure: { text: 'text-failure-dark dark:text-failure-light', card: 'failure' },
	critical: { text: 'text-critical-dark dark:text-critical-light', card: 'critical' }
};

const RollResultCard = ({
	tone,
	title,
	icon,
	hero,
	dice,
	consequence,
	details,
	detailsLabel = 'Rechenweg',
	action
}: RollResultCardProps) => {
	const [showDetails, setShowDetails] = useState(false);
	const { text } = toneClasses[tone];

	return (
		<Card
			variant={tone}
			className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500"
		>
			<CardHeader className="pb-4">
				<CardTitle className={`flex items-center justify-center gap-3 text-center text-xl ${text}`}>
					{icon}
					{title}
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-5">
				{hero && (
					<div className="text-center">
						<p className={`font-heading font-bold leading-none text-6xl sm:text-7xl ${text}`}>
							{hero.value}
						</p>
						<p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
							{hero.caption}
						</p>
						{hero.note && (
							<p className="mt-2 text-sm text-muted-foreground">{hero.note}</p>
						)}
					</div>
				)}

				<div className="flex flex-wrap justify-center gap-3">
					{dice.map((die, index) => (
						<DiceIcon
							key={index}
							value={die.value}
							size={die.size ?? 'lg'}
							variant={die.tone ?? 'default'}
						/>
					))}
				</div>

				{consequence && (
					<p className="text-center text-sm text-muted-foreground">{consequence}</p>
				)}

				{action && <div className="flex flex-wrap justify-center gap-2">{action}</div>}

				{details && (
					<div className="border-t border-border pt-3">
						<button
							type="button"
							onClick={() => setShowDetails(open => !open)}
							aria-expanded={showDetails}
							className="mx-auto flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							<ChevronRight
								className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-90' : ''}`}
							/>
							{detailsLabel}
						</button>
						{showDetails && <div className="mt-3">{details}</div>}
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default RollResultCard;
