import type { RootState } from '@/store';
import { clearHistory, type RollHistoryEntry } from '@/store/rollSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';




const RollHistory = () => {
	const dispatch = useDispatch();
	const rollHistory: RollHistoryEntry[] = useSelector((state: RootState) => state.roll.history);

	const handleClear = () => {
		dispatch(clearHistory());
	};

	return (
		<div className="mt-6 w-full max-w-2xl mx-auto">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-semibold">Wurf-Historie</h3>
				<Button
					variant="ghost"
					size="sm"
					onClick={handleClear}
					disabled={rollHistory.length === 0}
				>
					<Trash2 className="w-4 h-4 mr-2" />
					Löschen
				</Button>
			</div>
			<ul className="space-y-2">
				{rollHistory.length === 0 ? (
				<div className="text-center py-12 bg-card rounded-lg border border-border">
					<div className="text-6xl mb-4">🎲</div>
					<h4 className="text-lg font-semibold mb-2">Noch keine Würfe</h4>
					<p className="text-sm text-muted-foreground">
						Würfle deine erste Probe und sie erscheint hier!
					</p>
				</div>
			) : (
				<ul className="space-y-2">
					{rollHistory.map((roll) => (
						<li
							key={roll.id}
							className="bg-card text-card-foreground rounded-lg p-3 text-sm border border-border hover:border-primary transition-colors"
						>
							<div className="flex justify-between items-start">
								<span className="font-medium">{roll.type}</span>
								<span className="text-xs text-muted-foreground">
									{new Date(roll.date).toLocaleTimeString('de-DE')}
								</span>
							</div>

							<div className="mt-1">{roll.result}</div>
							<div className="mt-1 text-xs text-muted-foreground">
								Würfel: {roll.values.join(', ')}
							</div>
						</li>
					))}
				</ul>
			)}
			</ul>
		</div>
	);
};


export default RollHistory;
