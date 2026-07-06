import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ConfirmDialog from './ConfirmDialog';
import { exportCharacter } from '@/utils/exportCharacter';
import { importCharacter } from '@/utils/importCharacter';
import { resetLocalStorage } from '@/utils/resetLocalStorage';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';

const ImportExportSettings = () => {
	const [fileName, setFileName] = useState<string | null>(null);
	const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

	const handleImportClick = () => {
		document.getElementById('characterImportInput')?.click();
	};

	const handleFileSelected = async (file: File) => {
		await importCharacter(file);
		setFileName(file.name);
	};

	return (
		<div className="space-y-6 max-w-2xl mx-auto">
			{/* Export */}
			<Card variant="parchment">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Download className="w-5 h-5" />
						Charakter Exportieren
					</CardTitle>
					<CardDescription>
						Sichere deinen Charakter als .dsa-Datei
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button 
						onClick={exportCharacter}
						variant="aventurian"
						size="lg"
						className="w-full"
					>
						<Download className="w-5 h-5 mr-2" />
						Charakter exportieren
					</Button>
				</CardContent>
			</Card>

			{/* Import */}
			<Card variant="parchment">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Upload className="w-5 h-5" />
						Charakter Importieren
					</CardTitle>
					<CardDescription>
						Lade einen gespeicherten Charakter
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<input
						id="characterImportInput"
						type="file"
						accept=".dsa"
						className="hidden"
						onChange={(e) => {
							if (e.target.files?.length) handleFileSelected(e.target.files[0]);
						}}
					/>

					<Button 
						variant="secondary" 
						size="lg"
						onClick={handleImportClick}
						className="w-full"
					>
						<Upload className="w-5 h-5 mr-2" />
						Charakter importieren
					</Button>

					{fileName && (
						<div className="p-3 rounded-lg bg-success/10 border border-success text-sm">
							<p className="font-semibold text-success-dark dark:text-success-light">✅ Import erfolgreich!</p>
							<p className="text-muted-foreground mt-1">Datei: {fileName}</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Danger Zone */}
			<Card variant="failure" className="border-2">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-failure-dark dark:text-failure-light">
						<AlertTriangle className="w-5 h-5" />
						Danger Zone
					</CardTitle>
					<CardDescription className="text-failure-dark dark:text-failure-light">
						Diese Aktion kann nicht rückgängig gemacht werden!
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						variant="destructive"
						size="lg"
						onClick={() => setResetConfirmOpen(true)}
						className="w-full"
					>
						<Trash2 className="w-5 h-5 mr-2" />
						Alle Daten zurücksetzen
					</Button>
					<ConfirmDialog
						open={resetConfirmOpen}
						onOpenChange={setResetConfirmOpen}
						title="Alle Daten zurücksetzen?"
						description="Charakter, Talente, Kampfwerte und Historie werden unwiderruflich gelöscht."
						confirmLabel="Alles löschen"
						onConfirm={resetLocalStorage}
					/>
				</CardContent>
			</Card>
		</div>
	);
};

export default ImportExportSettings;