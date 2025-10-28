import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PropertyNumber from './PropertyNumber';
import { setAttribute } from '@/store/attributesSlice';
import type { AttributeKey } from '@/store/attributesSlice';
import { updateTalent } from '@/store/talentsSlice';

const Character = () => {
	const dispatch = useDispatch();
	const attributes = useSelector((state: RootState) => state.attributes);
	const talents = useSelector((state: RootState) => state.talents.talents);

	return (
		<div className="w-full mx-auto">
			<Tabs defaultValue="attributes" className="w-full">
				<TabsList className="mb-4">
					<TabsTrigger value="attributes">Eigenschaften</TabsTrigger>
					<TabsTrigger value="talents">Talente</TabsTrigger>
				</TabsList>

				{/* Eigenschaften */}
				<TabsContent value="attributes">
					<Card>
						<CardHeader>
							<CardTitle>Eigenschaften</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
								{Object.entries(attributes).map(([key, value]) => (
									<PropertyNumber
										key={key}
										label={key}
										value={value}
										onChange={(newValue) => dispatch(setAttribute({ key: key as AttributeKey, value: newValue }))}
										size="m"
									/>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Talente */}
				<TabsContent value="talents">
					<Card>
						<CardHeader>
							<CardTitle>Talente</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<table className="min-w-full text-sm border-collapse">
									<thead>
										<tr className="border-b border-border text-left">
											<th className="p-2">Name</th>
											<th className="p-2 text-center">Eig. 1</th>
											<th className="p-2 text-center">Eig. 2</th>
											<th className="p-2 text-center">Eig. 3</th>
											<th className="p-2 text-center">Wert</th>
										</tr>
									</thead>
									<tbody>
										{talents.map(talent => (
											<tr key={talent.id} className="border-b border-border text-left">
												<td className="p-2 font-medium">{talent.name}</td>
												<td className="p-2 text-center">{talent.attribute1}</td>
												<td className="p-2 text-center">{talent.attribute2}</td>
												<td className="p-2 text-center">{talent.attribute3}</td>
												<td className="p-2 text-center">
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
			</Tabs>
		</div>
	);
};

export default Character;