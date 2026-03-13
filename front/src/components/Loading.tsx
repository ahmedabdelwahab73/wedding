"use client"
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

const Loading = () => {
	const t = useTranslations('Common');
	return (
		<div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4 w-full">
			<div className="relative">
				<Loader2 className="w-12 h-12 text-[#03635a] animate-spin opacity-50" />
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="w-2 h-2 bg-[#03635a] rounded-full animate-pulse"></div>
				</div>
			</div>
			<p className="text-muted-foreground font-medium animate-pulse">
				{t('loading')}
			</p>
		</div>
	);
};

export default Loading;
