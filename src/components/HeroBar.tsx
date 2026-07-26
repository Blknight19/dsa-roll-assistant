import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from '@/components/ui/input';
import type { RootState } from '@/store';
import { lifeFillPercent } from '@/store/combatSlice';
import { CHARACTER_NAME_MAX, setCharacterName } from '@/store/profileSlice';
import { Pencil, User } from 'lucide-react';

/**
 * Name und Lebensenergie auf jedem Tab. Die LeP lag früher am Ende des Kampf-Tabs —
 * also genau dort, wo man mitten im Kampf am wenigsten hinsieht.
 */
const HeroBar = () => {
	const dispatch = useDispatch();
	const name = useSelector((state: RootState) => state.profile.name);
	const life = useSelector((state: RootState) => state.combat.life);
	const [editing, setEditing] = useState(false);

	const ratio = (life.current / life.max) * 100;
	const width = lifeFillPercent(life);
	const fill = ratio > 66 ? 'bg-success' : ratio > 33 ? 'bg-amber-500' : 'bg-failure';

	return (
		<div className="mb-6 flex items-center gap-3 rounded-lg border border-aventurian-300 bg-card px-4 py-3 dark:border-aventurian-700">
			{editing ? (
				<Input
					autoFocus
					value={name}
					maxLength={CHARACTER_NAME_MAX}
					placeholder="Name des Helden"
					aria-label="Name des Helden"
					onChange={(event) => dispatch(setCharacterName(event.target.value))}
					onBlur={() => setEditing(false)}
					onKeyDown={(event) => {
						if (event.key === 'Enter' || event.key === 'Escape') setEditing(false);
					}}
					className="h-9 max-w-[16rem] font-heading"
				/>
			) : (
				<button
					type="button"
					onClick={() => setEditing(true)}
					className="group flex min-w-0 items-center gap-2 rounded-md py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					aria-label="Name des Helden bearbeiten"
				>
					<User className="h-4 w-4 shrink-0 text-aventurian-600 dark:text-aventurian-400" />
					<span className="truncate font-heading font-semibold">
						{name || <span className="text-muted-foreground">Held benennen</span>}
					</span>
					<Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
				</button>
			)}

			<div className="ml-auto flex items-center gap-3">
				<span className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
					LeP
				</span>
				<div
					className="relative h-4 w-24 overflow-hidden rounded-full border border-aventurian-400 bg-muted sm:w-36 dark:border-aventurian-600"
					role="img"
					aria-label={`Lebensenergie ${life.current} von ${life.max}`}
				>
					<div className={`h-full ${fill} transition-all duration-500`} style={{ width: `${width}%` }} />
					{/* Schwellen der Schmerzstufen bei ¼, ½ und ¾ */}
					{[25, 50, 75].map((mark) => (
						<div
							key={mark}
							className="absolute top-0 h-full w-px bg-foreground/25"
							style={{ left: `${mark}%` }}
						/>
					))}
				</div>
				<span className="whitespace-nowrap font-heading text-sm font-semibold tabular-nums">
					{life.current} / {life.max}
				</span>
			</div>
		</div>
	);
};

export default HeroBar;
