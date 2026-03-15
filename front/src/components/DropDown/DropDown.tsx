
import React, { useState, useEffect, useRef } from 'react'

const DropDown = ({ title, IconBtn, children, dir = 'right' }: { title: string, IconBtn: React.ReactNode, children: React.ReactNode, dir?: 'left' | 'right' | 'center' }) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	const getPositionClass = () => {
		if (dir === 'left') return 'left-0';
		if (dir === 'right') return 'right-0';
		return 'left-1/2 -translate-x-1/2';
	};

	return (
		<div className="relative h-full flex items-center" ref={dropdownRef}>
			<button 
				onClick={() => setIsOpen(!isOpen)}
				className="cursor-pointer h-full uppercase text-[14px] font-medium flex items-center gap-1 text-background duration-200 transition-colors hover:text-background/80"
			>
				{title}
				{IconBtn}
			</button>
			<div 
				onClick={() => setIsOpen(false)}
				className={`absolute top-full pt-2 transition-all duration-300 transform z-50 ${getPositionClass()} 
				${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}
			>
				<div className="bg-background min-w-[240px] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)]
				 border border-border/40 overflow-hidden flex flex-col py-2">
					{children}
				</div>
			</div>
		</div>
	)
}

export default DropDown;