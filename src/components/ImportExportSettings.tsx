import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { exportCharacter } from '@/utils/exportCharacter';
import { importCharacter } from '@/utils/importCharacter';
import { resetLocalStorage } from '@/utils/resetLocalStorage';

const ImportExportSettings = () => {
	const [fileName, setFileName] = useState<string | null>(null);

	const handleImportClick = () => {
		document.getElementById('characterImportInput')?.click();
	};

	const handleFileSelected = async (file: File) => {
		await importCharacter(file);
		setFileName(file.name);
	};

	const handleReset = () => {
		resetLocalStorage();
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-2">
				<h3 className="font-semibold text-lg">Charakter Daten</h3>
				<Button onClick={exportCharacter}>⬇️ Charakter exportieren</Button>
			</div>

			<div className="flex flex-col gap-2">
				<input
					id="characterImportInput"
					type="file"
					accept=".dsa"
					className="hidden"
					onChange={(e) => {
						if (e.target.files?.length) handleFileSelected(e.target.files[0]);
					}}
				/>

				<Button variant="secondary" onClick={handleImportClick}>
					⬆️ Charakter importieren
				</Button>

				{fileName && (
					<p className="text-sm text-muted-foreground">Ausgewählt: {fileName}</p>
				)}
			</div>

			<div className="pt-4 border-t border-red-600">
				<h3 className="font-semibold text-lg text-red-600">Danger Zone</h3>
				<Button variant="destructive" onClick={handleReset}>
					🧨 Alle Daten zurücksetzen
				</Button>
			</div>
		</div>
	);
};

export default ImportExportSettings;
