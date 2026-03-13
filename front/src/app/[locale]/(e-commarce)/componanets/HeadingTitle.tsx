import React from 'react'

const HeadingTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => {
	return (
		<h2 className={`text-4xl font-light tracking-widest text-foreground 
							uppercase text-center relative pb-4 max-mxmdd:text-3xl max-ssmd:text-[21px] ${className || ''}`}>
			{children}
		</h2>
	)
}

export default HeadingTitle