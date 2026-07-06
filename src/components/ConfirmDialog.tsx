import type { ReactNode } from 'react';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

type ConfirmDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: ReactNode;
	confirmLabel?: string;
	onConfirm: () => void;
};

/** Themen-konformer Ersatz für window.confirm() bei destruktiven Aktionen. */
const ConfirmDialog = ({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = 'Löschen',
	onConfirm,
}: ConfirmDialogProps) => (
	<Dialog open={open} onOpenChange={onOpenChange}>
		<DialogContent className="max-w-md">
			<DialogHeader>
				<DialogTitle className="flex items-center gap-2 font-heading">
					<AlertTriangle className="w-5 h-5 text-failure-dark dark:text-failure-light" />
					{title}
				</DialogTitle>
				<DialogDescription>{description}</DialogDescription>
			</DialogHeader>
			<DialogFooter className="gap-2">
				<DialogClose asChild>
					<Button variant="outline">Abbrechen</Button>
				</DialogClose>
				<Button
					variant="destructive"
					onClick={() => {
						onConfirm();
						onOpenChange(false);
					}}
				>
					{confirmLabel}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);

export default ConfirmDialog;
