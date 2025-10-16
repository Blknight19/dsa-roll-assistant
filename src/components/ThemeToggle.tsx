import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';



const ThemeToggle = () => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState<boolean>(false);
	useEffect(() => setMounted(true), []);
	if (!mounted) return null;

	return <button
		onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
		className="p-2 rounded-full transition-colors hover:bg-accent flex items-center justify-center"
		aria-label='Toggle Theme'>
		{theme === 'dark' ? (<Moon className="w-5 h-5 text-zinc-400" />) : (<Sun className="w-5 h-5 text-yellow-400" />)}
	</button>;
};

export default ThemeToggle;