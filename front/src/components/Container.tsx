import React from "react";

interface ContainerProps {
	children: React.ReactNode;
	className?: string;
}

const Container: React.FC<ContainerProps> = ({ children, className = "" }) => {
	return (
		<div className={`mamd:px-1 w-[70%] max-llg:w-[85%] max-mmd:w-[95%] max-mxmdd:w-full max-mxmdd:px-3 mx-auto ${className}`}>
			{children}
		</div>
	);
};

export default Container;
