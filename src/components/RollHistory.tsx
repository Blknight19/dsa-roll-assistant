type RollHistoryEntry = {
	id: string,
	type: 'Einzel' | 'Talent',
	values: number[],
	result: string,
	date: string
}



const generateMockHistory = (count = 20): RollHistoryEntry[] =>
	Array.from({ length: count }, (_, i) => {
		const isTalent = Math.random() > 0.5;

		const values = isTalent
			? [Math.ceil(Math.random() * 20), Math.ceil(Math.random() * 20), Math.ceil(Math.random() * 20)]
			: [Math.ceil(Math.random() * 20)];

		const result = isTalent
			? `Ergebnis: ${Math.ceil(Math.random() * 10)} (QS ${Math.ceil(Math.random() * 6)})`
			: `Wurf: ${values[0]}`;

		return {
			id: String(i),
			type: isTalent ? "Talent" : "Einzel",
			values,
			result,
			date: new Date(Date.now() - i * 1000 * 60 * 15).toISOString(),
		};
	});



const RollHistory = () => {
	const rollHistory: RollHistoryEntry[] = generateMockHistory(15)

	return (
		<div className="mt-6">
			<div className="flex justify-between items-center mb-2">
				<h3 className="text-lg font-semibold">Wurf-Historie</h3>
				<button
					className="text-sm text-muted-foreground hover:text-destructive"
				// onClick={clearHistory}
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
							<div className="mt-1 text-xs text-muted-foreground">
								Würfel: {roll.values.join(", ")}
							</div>

							<div className="mt-1">{roll.result}</div>
						</li>
					))
				)}
			</ul>
		</div>
	);
}


export default RollHistory
