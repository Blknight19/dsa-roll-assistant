import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { RootState } from '@/store';
import { setConfirmCriticals } from '@/store/settingsSlice';
import { Scale } from 'lucide-react';

const RulesSettings = () => {
	const dispatch = useDispatch();
	const confirmCriticals = useSelector((state: RootState) => state.settings.confirmCriticals);

	return (
		<Card variant="parchment">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Scale className="w-5 h-5" />
					Regeln
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between gap-4">
					<div className="text-left">
						<label htmlFor="confirm-criticals" className="font-semibold">
							Bestätigungswurf bei 1 und 20
						</label>
						<p className="text-sm text-muted-foreground">
							Kritische Erfolge und Patzer im Kampf müssen mit einem zweiten W20
							bestätigt werden (DSA-5-Grundregel). Ausgeschaltet gelten 1 und 20 direkt.
						</p>
					</div>
					<Switch
						id="confirm-criticals"
						checked={confirmCriticals}
						onCheckedChange={(checked) => dispatch(setConfirmCriticals(checked))}
						aria-label="Bestätigungswurf bei Kritisch und Patzer"
					/>
				</div>
			</CardContent>
		</Card>
	);
};

export default RulesSettings;
