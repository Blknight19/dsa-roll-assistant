import { memo } from 'react';
import PropertyNumber from './PropertyNumber';
import { TALENT_VALUE_MAX, type Talent } from '@/store/talentsSlice';

type TalentRowProps = {
	talent: Talent;
	striped: boolean;
	onChange: (id: string, value: number) => void;
};

const TalentRow = memo(({ talent, striped, onChange }: TalentRowProps) => (
	<tr
		className={`
			border-b border-aventurian-200 dark:border-aventurian-700
			hover:bg-aventurian-100/50 dark:hover:bg-aventurian-800/50
			transition-colors
			${striped ? 'bg-aventurian-50/30 dark:bg-aventurian-900/30' : ''}
		`}
	>
		<td className="p-3 text-base">{talent.name}</td>
		{[talent.attribute1, talent.attribute2, talent.attribute3].map((attribute, index) => (
			<td key={index} className="p-3 text-center">
				<span className="px-2 py-1 rounded bg-aventurian-200 dark:bg-aventurian-700 font-heading text-xs">
					{attribute}
				</span>
			</td>
		))}
		<td className="p-3 text-center">
			<PropertyNumber
				value={talent.value}
				max={TALENT_VALUE_MAX}
				size="s"
				onChange={(value) => onChange(talent.id, value)}
			/>
		</td>
	</tr>
));

TalentRow.displayName = 'TalentRow';

export default TalentRow;
