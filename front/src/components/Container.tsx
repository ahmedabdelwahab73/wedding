import React from "react";

interface ContainerProps {
	children: React.ReactNode;
	className?: string;
}

const Container: React.FC<ContainerProps> = ({ children, className = "" }) => {
	return (
		<div className={`mamd:px-1 w-[80%] max-llg:w-[90%] max-mmd:w-[95%] max-mxmdd:w-full max-mxmdd:px-3 mx-auto ${className}`}>
			{children}
		</div>
	);
};

export default Container;
