import type { RootState } from '@/store';
import { useSelector } from 'react-redux';

const LoadingOverlay = () => {
	const isLoading = useSelector((state: RootState) => state.loading.isLoading);

	if (!isLoading) return null;

	return (
		<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center text-white gap-3">
			<div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full" />
			<span className="text-lg font-medium">Bitte warten…</span>
		</div>
	);
};

export default LoadingOverlay;

//Für Framer Motion
// import type { RootState } from "@/store";
// import { useSelector } from "react-redux";
// import { motion } from "framer-motion";

// const LoadingOverlay = () => {
// 	const isLoading = useSelector((state: RootState) => state.loading.isLoading);

// 	if (!isLoading) return null;

// 	return (
// 		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center gap-6 text-amber-200">

// 			{/* Runen-Kreis */}
// 			<motion.div
// 				animate={{ rotate: 360 }}
// 				transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
// 				className="w-32 h-32 border-4 border-amber-300/40 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,200,80,0.5)]"
// 			>
// 				{/* Würfel in der Mitte */}
// 				<motion.div
// 					animate={{ rotate: -360 }}
// 					transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
// 					className="text-4xl"
// 				>
// 					🎲
// 				</motion.div>
// 			</motion.div>

// 			{/* Glow-Text */}
// 			<motion.div
// 				initial={{ opacity: 0 }}
// 				animate={{ opacity: 1 }}
// 				transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
// 				className="text-xl font-semibold tracking-wide"
// 			>
// 				Daten werden geladen…
// 			</motion.div>

// 			{/* optional kleine Runenlinie */}
// 			<div className="flex gap-1 opacity-75">
// 				<span className="text-xs">ᚠ</span>
// 				<span className="text-xs">ᚢ</span>
// 				<span className="text-xs">ᚦ</span>
// 				<span className="text-xs">ᚨ</span>
// 				<span className="text-xs">ᚱ</span>
// 				<span className="text-xs">ᚲ</span>
// 			</div>
// 		</div>
// 	);
// };

// export default LoadingOverlay;
