import type { RootState } from "@/store";
import { clearHistory, type RollHistoryEntry } from "@/store/rollSlice";
import { useDispatch, useSelector } from "react-redux";




const RollHistory = () => {
	const dispatch = useDispatch()
	const rollHistory: RollHistoryEntry[] = useSelector((state: RootState) => state.roll.history)

	const handleClear = () => {
		dispatch(clearHistory())
	}

	return (
		<div className="mt-6">
			<div className="flex justify-between items-center mb-2">
				<h3 className="text-lg font-semibold">Wurf-Historie</h3>
				<button
					className="text-sm text-muted-foreground hover:text-destructive"
					onClick={handleClear}
				>
					Löschen
				</button>
			</div>
			<ul className="space-y-2">
				{rollHistory.length === 0 ? (
					<li className="text-muted-foreground text-sm">Keine Würfe bisher.</li>
				) : (
					rollHistory.map((roll) => (
						<li
							key={roll.id}
							className="bg-card text-card-foreground rounded-lg p-3 text-sm border border-border"
						>
							<div className="flex justify-between">
								<span className="font-medium">{roll.type}</span>
								<span className="text-xs text-muted-foreground">
									{new Date(roll.date).toLocaleTimeString()}
								</span>
							</div>

							{/* Anzeige der einzelnen Würfel */}
							<div className="mt-1">{roll.result}</div>
							<div className="mt-1 text-xs text-muted-foreground">
								Würfel: {roll.values.join(", ")}
							</div>


						</li>
					))
				)}
			</ul>
		</div>
	);
}


export default RollHistory
