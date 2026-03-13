import React from 'react';

interface DashboardHeadingProps {
	title: string;
	description: string;
	children?: React.ReactNode;
}

const DashboardHeading = ({ title, description, children }: DashboardHeadingProps) => {
	return (
		<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div>
				<h1 className="text-2xl font-bold text-foreground">{title}</h1>
				<p className="text-muted-foreground text-sm">{description}</p>
			</div>
			{children && (
				<div className="flex items-center gap-3">
					{children}
				</div>
			)}
		</div>
	);
};

export default DashboardHeading;
