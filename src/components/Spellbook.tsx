import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import PropertyNumber from './PropertyNumber';
import type { RootState } from '@/store';
import { ATTRIBUTE_KEYS, type AttributeKey } from '@/store/attributesSlice';
import { TALENT_VALUE_MAX } from '@/store/talentsSlice';
import {
	SPELL_COST_MAX, SPELL_LIMIT, SPELL_NAME_MAX, addSpell, removeSpell, updateSpell
} from '@/store/spellbookSlice';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

const DEFAULT_ATTRIBUTES: [AttributeKey, AttributeKey, AttributeKey] = ['KL', 'KL', 'IN'];

const Spellbook = () => {
	const dispatch = useDispatch();
	const spells = useSelector((state: RootState) => state.spellbook.spells);

	const [name, setName] = useState('');
	const [attributes, setAttributes] = useState<[AttributeKey, AttributeKey, AttributeKey]>(DEFAULT_ATTRIBUTES);
	const [cost, setCost] = useState(4);

	const full = spells.length >= SPELL_LIMIT;

	const create = () => {
		const trimmed = name.trim();
		if (!trimmed || full) return;
		dispatch(addSpell({
			id: nanoid(),
			name: trimmed,
			attributes: [...attributes] as [AttributeKey, AttributeKey, AttributeKey],
			cost,
			value: 0
		}));
		setName('');
		setAttributes(DEFAULT_ATTRIBUTES);
		setCost(4);
	};

	return (
		<div className="space-y-6">
			<Card variant="parchment">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BookOpen className="w-6 h-6" />
						Zauberbuch
					</CardTitle>
				</CardHeader>
				<CardContent>
					{spells.length === 0 ? (
						<p className="py-8 text-center text-sm text-muted-foreground">
							Noch keine Zauber. Lege unten einen eigenen an.
						</p>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full text-sm">
								<thead className="sticky top-0 z-10 bg-aventurian-100 dark:bg-aventurian-800">
									<tr className="border-b-2 border-aventurian-400 dark:border-aventurian-600">
										<th className="p-3 text-left font-heading">Name</th>
										<th className="p-3 text-center font-heading">Probe</th>
										<th className="p-3 text-center font-heading">AsP</th>
										<th className="p-3 text-center font-heading">FW</th>
										<th className="p-3 text-center font-heading"><span className="sr-only">Löschen</span></th>
									</tr>
								</thead>
								<tbody>
									{spells.map((spell, index) => (
										<tr
											key={spell.id}
											className={index % 2 === 0 ? 'bg-aventurian-50/50 dark:bg-aventurian-900/30' : ''}
										>
											<td className="p-3">
												<div className="font-heading">{spell.name}</div>
												{spell.costText && (
													<div className="text-xs text-muted-foreground">{spell.costText}</div>
												)}
											</td>
											<td className="p-3 text-center font-heading">{spell.attributes.join('/')}</td>
											<td className="p-3">
												<PropertyNumber
													value={spell.cost}
													max={SPELL_COST_MAX}
													size="s"
													onChange={(value) => dispatch(updateSpell({ id: spell.id, changes: { cost: value } }))}
													className="mx-auto"
												/>
											</td>
											<td className="p-3">
												<PropertyNumber
													value={spell.value}
													max={TALENT_VALUE_MAX}
													size="s"
													onChange={(value) => dispatch(updateSpell({ id: spell.id, changes: { value } }))}
													className="mx-auto"
												/>
											</td>
											<td className="p-3 text-center">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => dispatch(removeSpell(spell.id))}
													aria-label={`${spell.name} entfernen`}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>

			<Card variant="parchment">
				<CardHeader>
					<CardTitle className="text-lg">Eigenen Zauber anlegen</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Input
						value={name}
						maxLength={SPELL_NAME_MAX}
						placeholder="Name des Zaubers"
						aria-label="Name des Zaubers"
						onChange={(event) => setName(event.target.value)}
						className="font-heading"
					/>

					<div className="flex flex-wrap items-end gap-3">
						{attributes.map((attribute, index) => (
							<Select
								key={index}
								value={attribute}
								onValueChange={(value) => setAttributes(current => {
									const next = [...current] as [AttributeKey, AttributeKey, AttributeKey];
									next[index] = value as AttributeKey;
									return next;
								})}
							>
								<SelectTrigger className="w-24 text-center font-heading" aria-label={`Eigenschaft ${index + 1}`}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{ATTRIBUTE_KEYS.map(key => (
										<SelectItem key={key} value={key} className="font-heading">{key}</SelectItem>
									))}
								</SelectContent>
							</Select>
						))}

						<PropertyNumber label="AsP" value={cost} max={SPELL_COST_MAX} size="s" onChange={setCost} />

						<Button variant="aventurian" onClick={create} disabled={!name.trim() || full} className="mb-5">
							<Plus className="mr-1 h-4 w-4" />
							Hinzufügen
						</Button>
					</div>

					{full && (
						<p className="text-sm text-failure-dark dark:text-failure-light">
							Das Zauberbuch fasst höchstens {SPELL_LIMIT} Zauber.
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default Spellbook;
