import type { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';

const LoadingOverlay = () => {
	const isLoading = useSelector((state: RootState) => state.loading.isLoading);

	if (!isLoading) return null;

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center text-white gap-4">
			<div className="relative">
				{/* Rotating Ring */}
				<div className="w-20 h-20 border-4 border-aventurian-400/30 rounded-full"></div>
				<Loader2 className="w-20 h-20 absolute top-0 left-0 animate-spin text-aventurian-400" />
			</div>
			<span className="text-xl font-heading font-semibold text-aventurian-200">
				Bitte warten…
			</span>
			<div className="flex gap-1 text-aventurian-400">
				<span className="text-2xl animate-bounce" style={{ animationDelay: '0ms' }}>🎲</span>
				<span className="text-2xl animate-bounce" style={{ animationDelay: '150ms' }}>🎲</span>
				<span className="text-2xl animate-bounce" style={{ animationDelay: '300ms' }}>🎲</span>
			</div>
		</div>
	);
};

export default LoadingOverlay;