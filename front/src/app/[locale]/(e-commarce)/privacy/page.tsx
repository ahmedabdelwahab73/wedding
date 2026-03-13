"use client"
import React from 'react'
import Container from '@/components/Container'
import { useTranslations } from 'next-intl'
import HeadingTitle from '../componanets/HeadingTitle'
import { Shield, Lock, Eye, CheckCircle, Search } from 'lucide-react'

const PrivacyPage = () => {
	const t = useTranslations('Privacy')

	const sections = [
		{
			id: 'infoCollection',
			icon: <Eye className="w-6 h-6 text-Brown-color" />,
			title: t('infoCollectionTitle'),
			text: t('infoCollectionText')
		},
		{
			id: 'howUse',
			icon: <Search className="w-6 h-6 text-Brown-color" />,
			title: t('howUseTitle'),
			text: t('howUseText')
		},
		{
			id: 'sharing',
			icon: <Shield className="w-6 h-6 text-Brown-color" />,
			title: t('sharingTitle'),
			text: t('sharingText')
		},
		{
			id: 'security',
			icon: <Lock className="w-6 h-6 text-Brown-color" />,
			title: t('securityTitle'),
			text: t('securityText')
		},
		{
			id: 'contact',
			icon: <CheckCircle className="w-6 h-6 text-Brown-color" />,
			title: t('contactTitle'),
			text: t('contactText')
		}
	];

	return (
		<div className="bg-background min-h-screen py-32 overflow-hidden">
			<Container>
				<div className="max-w-4xl mx-auto bg-card rounded-3xl shadow-xl shadow-foreground/5 
				border border-border p-8 md:p-12 relative overflow-hidden">

					{/* Background Decorations */}
					<div className="absolute top-0 right-0 w-64 h-64 bg-Brown-color/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
					<div className="absolute bottom-0 left-0 w-80 h-80 bg-Brown-color/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

					<div className="relative z-10 flex flex-col items-center text-center space-y-4 mb-12">
						<div className="w-16 h-16 bg-Brown-color/10 rounded-2xl flex items-center justify-center mb-4">
							<Shield className="w-8 h-8 text-Brown-color" />
						</div>
						<HeadingTitle className="!mb-2">
							{t('title')}
						</HeadingTitle>
						<span className="text-muted-foreground text-sm font-medium bg-muted px-4 py-1.5 rounded-full">
							{t('lastUpdated')}
						</span>
						<p className="text-foreground/80 mt-6 leading-relaxed max-w-2xl text-justify md:text-center text-lg">
							{t('intro')}
						</p>
					</div>

					<div className="space-y-10 relative z-10 mt-16 px-2 md:px-8">
						{sections.map((section, index) => (
							<div key={section.id} className="group flex flex-col md:flex-row gap-6 items-start">
								<div className="shrink-0 w-12 h-12 bg-muted/50 rounded-2xl flex items-center justify-center border border-border group-hover:border-Brown-color/30 group-hover:bg-Brown-color/5 transition-all duration-300">
									{section.icon}
								</div>
								<div className="space-y-3 pt-1">
									<h3 className="text-xl font-bold text-foreground flex items-center gap-2">
										{section.title}
									</h3>
									<p className="text-muted-foreground leading-relaxed text-justify">
										{section.text}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</Container>
		</div>
	)
}

export default PrivacyPage;
