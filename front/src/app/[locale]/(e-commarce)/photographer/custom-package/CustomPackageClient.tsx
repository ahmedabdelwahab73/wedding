"use client"
import React, { useState } from 'react'
import { Check, ShoppingBag, Send, PackageOpen } from 'lucide-react'
import { useTranslations } from 'next-intl'
import HeadingTitle from '../componanets/HeadingTitle'
import Container from '@/components/Container'
import { useRouter } from 'next/navigation'

interface Option {
	_id: string;
	pointAr: string;
	pointEn: string;
	price: number;
}

interface CustomPackage {
	_id: string;
	sectionNameAr: string;
	sectionNameEn: string;
	options: Option[];
	sort: number;
	active: boolean;
}

interface CustomPackageClientProps {
	initialPackages: CustomPackage[];
	locale: string;
}

const CustomPackageClient = ({ initialPackages, locale }: CustomPackageClientProps) => {
	const router = useRouter();
	const isAr = locale === 'ar';
	const t = useTranslations('HomePage');

	const [selectedOptions, setSelectedOptions] = useState<Map<string, Option>>(new Map())
	const [totalPrice, setTotalPrice] = useState(0)

	const toggleOption = (sectionId: string, option: Option) => {
		setSelectedOptions(prev => {
			const newSelected = new Map(prev)
			const key = `${sectionId}-${option._id}`

			if (newSelected.has(key)) {
				newSelected.delete(key)
			} else {
				newSelected.set(key, option)
			}

			// Calculate new total
			let total = 0
			newSelected.forEach(opt => {
				total += opt.price
			})
			setTotalPrice(total)

			return newSelected
		})
	}

	const handleCheckout = () => {
		localStorage.setItem('selectedOptionIds', JSON.stringify(Array.from(selectedOptions.keys())));
		router.push('/booking/custom-package');
	}

	return (
		<Container className='mt-30 mb-20'>
			<div className="text-center mb-16">
				<HeadingTitle>
					{t(`DesignYourPackage`)}
				</HeadingTitle>
				<p className="text-muted-foreground max-w-2xl mx-auto text-md">
					{t('ChooseServices')}
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative items-start">
				<div className="lg:col-span-2 bg-[#c9beae87] p-5 border-2 border-Brown-color rounded-[30px] grid grid-cols-1 gap-5">
					{initialPackages.length > 0 ? initialPackages.map((section) => (
						<div key={`${section._id}-${section.sort}`}>
							<h3 className='text-2xl font-bold text-foreground mb-4 text-center'>{isAr ? section?.sectionNameAr : section?.sectionNameEn}</h3>

							<div className="gap-3 flex flex-col">
								{section?.options?.map((option) => {
									const isSelected = selectedOptions.has(`${section._id}-${option._id}`)

									return (
										<div
											key={option._id}
											onClick={() => toggleOption(section._id, option)}
											className={`cursor-pointer flex items-center justify-between gap-4 bg-background py-2
												 px-5 rounded-2xl border border-border/50 hover:border-[#b0a090]/40 hover:shadow-lg 
												 transition-all duration-300 group 
												${isSelected
													? 'border-[#03635a] !bg-[#b2a797] shadow-md scale-[1.02]'
													: 'border-border/50 hover:border-primary/50 hover:bg-muted/30'
												}`}
										>
											<div className='flex items-center gap-2'>
												<div className={`w-6 h-6 shrink-0 rounded-full border-2 
														flex flex-col items-center justify-center transition-all duration-300
													${isSelected ? 'bg-[#03635a] border-[#03635a] text-white'
														: 'bg-[#c9beae87] border-[#03635a]/40 shadow-sm'}`}>
													{isSelected && <Check size={14} className="stroke-[3]" />}
												</div>
												<h3 className={`text-lg max-mxmdd:text-[14px] font-[500] text-foreground/80 leading-snug
												${isSelected ? 'text-background' : 'text-foreground'}`}>
													{isAr ? option.pointAr : option.pointEn}
												</h3>
											</div>
											<span className="flex items-end gap-[2px] font-black text-foreground drop-shadow-sm">
												{option.price} <small className="text-[11px] uppercase text-foreground/60">EGP</small>
											</span>
										</div>
									)
								})}
							</div>
						</div>
					)) : (
						<div className="text-center py-20 bg-card rounded-3xl border border-border">
							<PackageOpen size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
							<h3 className="text-xl font-bold text-foreground">
								{isAr ? 'لا توجد أقسام متاحة حالياً' : 'No custom packages available right now'}
							</h3>
						</div>
					)}
				</div>

				<div className="lg:col-span-1 border border-border rounded-3xl p-6 bg-card sticky top-28 shadow-xl">
					<div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
						<ShoppingBag className="text-[#03635a]" size={28} />
						<h3 className="text-2xl font-bold">{t('packageDetails')}</h3>
					</div>

					<div className="space-y-4 mb-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
						{selectedOptions.size > 0 ? (
							Array.from(selectedOptions.entries()).map(([key, option]) => (
								<div key={key} className="flex justify-between items-start text-sm">
									<p className="font-medium max-w-[70%]">{isAr ? option.pointAr : option.pointEn}</p>
									<span className="font-bold whitespace-nowrap">{option.price} EGP</span>
								</div>
							))
						) : (
							<p className="text-muted-foreground text-center py-5">
								{t('Nooptionsselectedyet')}
							</p>
						)}
					</div>

					<div className="border-t border-border pt-3 mb-8 mt-auto">
						<div className="flex justify-between items-center text-xl">
							<span className="font-bold">{t('TotalPrice')} :</span>
							<span className="font-black text-2xl">{totalPrice} <span className="text-sm text-muted-foreground">EGP</span></span>
						</div>
					</div>

					<button
						onClick={handleCheckout}
						disabled={selectedOptions.size === 0}
						className="w-full bg-[#03635a] cursor-pointer disabled:cursor-not-allowed hover:opacity-90 disabled:from-muted disabled:to-muted disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/20"
					>
						<Send size={20} />
						{t('FollowBooking')}
					</button>
				</div>
			</div>
		</Container>
	)
}

export default CustomPackageClient;
