"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalOptions {
	title: string;
	message: React.ReactNode;
	onConfirm: () => void;
	confirmText?: string;
	cancelText?: string;
}

interface ConfirmModalContextType {
	showConfirm: (options: ConfirmModalOptions) => void;
}

const ConfirmModalContext = createContext<ConfirmModalContextType | undefined>(undefined);

export const useConfirm = () => {
	const context = useContext(ConfirmModalContext);
	if (!context) {
		throw new Error('useConfirm must be used within a ConfirmModalProvider');
	}
	return context;
};

export const ConfirmModalProvider = ({ children }: { children: ReactNode }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [options, setOptions] = useState<ConfirmModalOptions | null>(null);

	const showConfirm = (opts: ConfirmModalOptions) => {
		setOptions(opts);
		setIsOpen(true);
	};

	const handleConfirm = () => {
		if (options?.onConfirm) {
			options.onConfirm();
		}
		setIsOpen(false);
	};

	const handleCancel = () => {
		setIsOpen(false);
	};

	return (
		<ConfirmModalContext.Provider value={{ showConfirm }}>
			{children}
			{isOpen && options && (
				<div
					className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
					dir="rtl"
					onClick={handleCancel}
				>
					<div
						className="bg-[#ffffff] w-full max-w-sm rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-500 p-8 flex flex-col items-center justify-center text-center relative"
						onClick={e => e.stopPropagation()}
					>
						<button
							onClick={handleCancel}
							className="cursor-pointer absolute top-4 right-4 p-3 hover:bg-red-100 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-200/40 rounded-2xl transition-all max-h-[44px]"
							aria-label="إغلاق"
						>
							<X size={20} />
						</button>
						<div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
							<AlertTriangle className="w-8 h-8 text-destructive" />
						</div>
						<h3 className="text-2xl font-bold mb-2">{options.title}</h3>
						<p className="text-muted-foreground mb-8 text-sm leading-relaxed">{options.message}</p>

						<div className="flex items-center gap-3 w-full">
							<button
								onClick={handleConfirm}
								className="cursor-pointer flex-1 bg-blue-400
								py-3 px-4 rounded-xl hover:bg-blue-600 hover:-translate-y-0.5 
								hover:shadow-lg hover:shadow-blue-500/40 
								text-white font-medium transition-all duration-200 
								shadow-md shadow-blue-500/20"
							>
								{options.confirmText || 'تأكيد الحذف'}
							</button>
							<button
								onClick={handleCancel}
								className="cursor-pointer flex-1 py-3 px-4 
								rounded-xl border border-border 
								bg-red-300 hover:bg-red-500 hover:-translate-y-0.5 
								hover:shadow-md text-foreground hover:text-white
								 font-medium transition-all duration-200"
							>
								{options.cancelText || 'إلغاء'}
							</button>
						</div>
					</div>
				</div>
			)}
		</ConfirmModalContext.Provider>
	);
};
