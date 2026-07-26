import { useState } from 'react';
import type { RootState } from '@/store';
import { clearHistory, type RollHistoryEntry } from '@/store/rollSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ConfirmDialog from './ConfirmDialog';
import { Trash2, Dices, Swords, Scroll } from 'lucide-react';

/** Uhrzeit reicht nur für heute — 100 Einträge können mehrere Spielabende umfassen. */
const formatRollDate = (iso: string): string => {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return '';

	const time = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
	const isToday = date.toDateString() === new Date().toDateString();
	if (isToday) return time;

	return `${date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} ${time}`;
};

const RollHistory = () => {
	const dispatch = useDispatch();
	const rollHistory: RollHistoryEntry[] = useSelector((state: RootState) => state.roll.history);
	const [confirmOpen, setConfirmOpen] = useState(false);

	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'Talent': return <Scroll className="w-4 h-4" />;
			case 'Kampf': return <Swords className="w-4 h-4" />;
			case 'Einzel': return <Dices className="w-4 h-4" />;
			default: return <Dices className="w-4 h-4" />;
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case 'Talent': return 'text-magic-dark dark:text-magic-light';
			case 'Kampf': return 'text-failure-dark dark:text-failure-light';
			case 'Einzel': return 'text-aventurian-600 dark:text-aventurian-400';
			default: return 'text-foreground';
		}
	};

	return (
		<div className="w-full max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<Card variant="parchment">
				<CardHeader>
					<div className="flex justify-between items-center">
						<CardTitle className="flex items-center gap-2">
							<Scroll className="w-6 h-6" />
							Wurf-Historie
						</CardTitle>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => setConfirmOpen(true)}
							disabled={rollHistory.length === 0}
						>
							<Trash2 className="w-4 h-4 mr-2" />
							Löschen
						</Button>
					</div>
				</CardHeader>
			</Card>

			<ConfirmDialog
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
				title="Historie löschen?"
				description="Alle gespeicherten Würfe werden entfernt. Das kann nicht rückgängig gemacht werden."
				confirmLabel="Historie löschen"
				onConfirm={() => dispatch(clearHistory())}
			/>

			{/* Empty State */}
			{rollHistory.length === 0 ? (
				<Card variant="parchment">
					<CardContent className="text-center py-16">
						<Dices className="w-20 h-20 mx-auto mb-6 float-dice text-aventurian-500" />
						<h3 className="text-2xl font-heading font-semibold mb-3">
							Noch keine Würfe
						</h3>
						<p className="text-muted-foreground mb-6">
							Würfle deine erste Probe und sie erscheint hier!
						</p>
						<div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
							<span className="flex items-center gap-1">
								<Scroll className="w-4 h-4" /> Talentproben
							</span>
							<span>•</span>
							<span className="flex items-center gap-1">
								<Dices className="w-4 h-4" /> Einzelwürfe
							</span>
							<span>•</span>
							<span className="flex items-center gap-1">
								<Swords className="w-4 h-4" /> Kampfwürfe
							</span>
						</div>
					</CardContent>
				</Card>
			) : (
				/* History List */
				<div className="space-y-3">
					{rollHistory.map((roll, index) => (
						<Card
							key={roll.id}
							variant="parchment"
							className="hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-top-2"
							style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}
						>
							<CardContent className="p-4">
								<div className="flex items-start justify-between gap-4">
									{/* Icon & Type */}
									<div className="flex items-center gap-3">
										<div className={`${getTypeColor(roll.type)}`}>
											{getTypeIcon(roll.type)}
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<span className={`font-heading font-semibold ${getTypeColor(roll.type)}`}>
													{roll.type}
												</span>
												<span className="text-xs text-muted-foreground">
													{formatRollDate(roll.date)}
												</span>
											</div>
											<p className="text-sm">{roll.result}</p>
											<p className="text-xs text-muted-foreground mt-1">
												Würfel: {roll.values.join(', ')}
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Footer Stats */}
			{rollHistory.length > 0 && (
				<Card variant="parchment">
					<CardContent className="p-4">
						<div className="flex justify-center gap-8 text-sm text-muted-foreground">
							<div className="text-center">
								<p className="font-heading font-semibold text-foreground text-lg">
									{rollHistory.length}
								</p>
								<p>Gesamt</p>
							</div>
							<div className="text-center">
								<p className="font-heading font-semibold text-magic-dark dark:text-magic-light text-lg">
									{rollHistory.filter(r => r.type === 'Talent').length}
								</p>
								<p>Talente</p>
							</div>
							<div className="text-center">
								<p className="font-heading font-semibold text-failure-dark dark:text-failure-light text-lg">
									{rollHistory.filter(r => r.type === 'Kampf').length}
								</p>
								<p>Kämpfe</p>
							</div>
							<div className="text-center">
								<p className="font-heading font-semibold text-aventurian-600 dark:text-aventurian-400 text-lg">
									{rollHistory.filter(r => r.type === 'Einzel').length}
								</p>
								<p>Einzelwürfe</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default RollHistory;