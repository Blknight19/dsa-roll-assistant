import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { RootState } from '@/store';
import { setSpellcaster } from '@/store/spellbookSlice';
import { User } from 'lucide-react';

/**
 * Charakterbezogene Schalter — bewusst getrennt von `RulesSettings`: die dortigen
 * Einstellungen gehören der App, dieser hier wandert mit in die .dsa-Datei.
 */
const HeroSettings = () => {
	const dispatch = useDispatch();
	const isSpellcaster = useSelector((state: RootState) => state.spellbook.isSpellcaster);

	return (
		<Card variant="parchment">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<User className="w-5 h-5" />
					Held
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between gap-4">
					<div className="text-left">
						<label htmlFor="is-spellcaster" className="font-semibold">
							Zauberkundig
						</label>
						<p className="text-sm text-muted-foreground">
							Blendet den Magie-Tab, die AsP-Leiste und das Zauberbuch ein.
							Ausschalten versteckt nur — Zauber und AsP bleiben erhalten.
						</p>
					</div>
					<Switch
						id="is-spellcaster"
						checked={isSpellcaster}
						onCheckedChange={(checked) => dispatch(setSpellcaster(checked))}
						aria-label="Held ist zauberkundig"
					/>
				</div>
			</CardContent>
		</Card>
	);
};

export default HeroSettings;
