import React, { ReactNode } from 'react';

interface DashContainerProps {
	children: ReactNode;
	className?: string;
	isHeader?: boolean;
}

const DashContainer = ({ children, className = '', isHeader = false }: DashContainerProps) => {
	return (
		<div
			className={`w-full mx-auto px-4 sm:px-6 lg:px-8 
      ${isHeader ? '' : 'py-6 md:py-8 lg:py-10'} 
      ${className}`}
		>
			{children}
		</div>
	);
};

export default DashContainer;
