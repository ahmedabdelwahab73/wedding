import React from 'react';

interface StatusToggleProps {
	active: boolean | number;
	onChange: (checked: boolean) => void;
	label?: string;
	description?: string;
}

const StatusToggle = ({
	active,
	onChange,
	label = "حالة الظهور",
	description = "سيتم عرض هذا العنصر على الموقع إذا كان مفعلاً"
}: StatusToggleProps) => {

	// Convert numerical 1/0 to boolean for the checkbox
	const isChecked = typeof active === 'number' ? active === 1 : active;

	return (
		<div className="space-y-4 pt-4 border-t border-border w-full">
			<div className="flex items-center justify-between p-4 bg-secondary/50 rounded-2xl border border-blue-500">
				<div>
					<h4 className="font-bold text-sm">{label}</h4>
					<p className="text-xs text-muted-foreground mt-1">
						{description}
					</p>
				</div>
				<label className="relative inline-flex items-center cursor-pointer" dir="ltr">
					<input
						type="checkbox"
						className="sr-only peer"
						checked={isChecked}
						onChange={(e) => onChange(e.target.checked)}
					/>
					<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
					peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] 
					after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 
					after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
					peer-checked:bg-blue-600 shadow-inner"></div>
				</label>
			</div>
		</div>
	);
};

export default StatusToggle;
