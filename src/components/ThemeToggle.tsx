import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

const ThemeToggle = () => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState<boolean>(false);
	
	useEffect(() => setMounted(true), []);
	
	if (!mounted) return null;
	
	if (!theme || !['light', 'dark'].includes(theme)) setTheme('dark');

	return (
		<Button
			onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
			variant="ghost"
			size="icon"
			className="rounded-full hover:bg-aventurian-200 dark:hover:bg-aventurian-700"
			aria-label='Toggle Theme'
		>
			{theme === 'dark' ? (
				<Moon className="w-5 h-5 text-aventurian-400" />
			) : (
				<Sun className="w-5 h-5 text-aventurian-600" />
			)}
		</Button>
	);
};

export default ThemeToggle;