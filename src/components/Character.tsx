import { useDispatch, useSelector } from 'react-redux';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Combat from './Combat';
import PropertyNumber from './PropertyNumber';
import ImportExportSettings from './ImportExportSettings';
import type { RootState } from '@/store';
import { setAttribute } from '@/store/attributesSlice';
import type { AttributeKey } from '@/store/attributesSlice';
import { updateTalent } from '@/store/talentsSlice';
import { User, Sparkles, Swords, Settings } from 'lucide-react';

const Character = () => {
	const dispatch = useDispatch();
	const attributes = useSelector((state: RootState) => state.attributes);
	const talents = useSelector((state: RootState) => state.talents.talents);

	return (
		<div className="w-full max-w-6xl mx-auto">
			<Tabs defaultValue="attributes" className="w-full">
				<TabsList className="mb-6">
					<TabsTrigger value="attributes" className="font-heading flex items-center gap-2">
						<User className="w-4 h-4" />
						<span className="hidden sm:inline">Eigenschaften</span>
					</TabsTrigger>
					<TabsTrigger value="talents" className="font-heading flex items-center gap-2">
						<Sparkles className="w-4 h-4" />
						<span className="hidden sm:inline">Talente</span>
					</TabsTrigger>
					<TabsTrigger value="combat" className="font-heading flex items-center gap-2">
						<Swords className="w-4 h-4" />
						<span className="hidden sm:inline">Kampf</span>
					</TabsTrigger>
					<TabsTrigger value="settings" className="font-heading flex items-center gap-2">
						<Settings className="w-4 h-4" />
						<span className="hidden sm:inline">Einstellungen</span>
					</TabsTrigger>
				</TabsList>

				{/* Eigenschaften */}
				<TabsContent value="attributes">
					<Card variant="parchment">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="w-6 h-6" />
								Eigenschaften
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-4 sm:grid-cols-2 gap-6">
								{Object.entries(attributes).map(([key, value]) => (
									<div 
										key={key}
										className="flex flex-col items-center p-6 rounded-lg bg-aventurian-100/50 dark:bg-aventurian-800/50 hover:bg-aventurian-200/50 dark:hover:bg-aventurian-700/50 transition-colors"
									>
										<PropertyNumber
											label={key}
											value={value}
											onChange={(newValue) => dispatch(setAttribute({ key: key as AttributeKey, value: newValue }))}
											size="m"
										/>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Talente */}
				<TabsContent value="talents">
					<Card variant="parchment">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Sparkles className="w-6 h-6" />
								Talente
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<table className="min-w-full text-sm">
									<thead className="sticky top-0 bg-aventurian-100 dark:bg-aventurian-800 z-10">
										<tr className="border-b-2 border-aventurian-400 dark:border-aventurian-600">
											<th className="p-3 text-left font-heading">Name</th>
											<th className="p-3 text-center font-heading">Eig. 1</th>
											<th className="p-3 text-center font-heading">Eig. 2</th>
											<th className="p-3 text-center font-heading">Eig. 3</th>
											<th className="p-3 text-center font-heading">Wert</th>
										</tr>
									</thead>
									<tbody>
										{talents.map((talent, index) => (
											<tr 
												key={talent.id} 
												className={`
													border-b border-aventurian-200 dark:border-aventurian-700 
													hover:bg-aventurian-100/50 dark:hover:bg-aventurian-800/50 
													transition-colors
													${index % 2 === 0 ? 'bg-aventurian-50/30 dark:bg-aventurian-900/30' : ''}
												`}
											>
												<td className="p-3 text-2xl">{talent.name}</td>
												<td className="p-3 text-center">
													<span className="px-2 py-1 rounded bg-aventurian-200 dark:bg-aventurian-700 font-heading text-xs">
														{talent.attribute1}
													</span>
												</td>
												<td className="p-3 text-center">
													<span className="px-2 py-1 rounded bg-aventurian-200 dark:bg-aventurian-700 font-heading text-xs">
														{talent.attribute2}
													</span>
												</td>
												<td className="p-3 text-center">
													<span className="px-2 py-1 rounded bg-aventurian-200 dark:bg-aventurian-700 font-heading text-xs">
														{talent.attribute3}
													</span>
												</td>
												<td className="p-3 text-center">
													<PropertyNumber
														value={talent.value}
														size="s"
														onChange={(value) => { dispatch(updateTalent({ id: talent.id, value })); }}
													/>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Kampf */}
				<TabsContent value='combat'>
					<Combat />
				</TabsContent>

				{/* Einstellungen */}
				<TabsContent value='settings'>
					<ImportExportSettings />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default Character;