import React from 'react';
import Container from '@/components/Container';
import HeadingTitle from '../../../componanets/HeadingTitle';
import Link from 'next/link';
import { PackageDetailsType } from '@/app/types';
import { getTranslations } from 'next-intl/server';
import { Star } from 'lucide-react';
import Subname from '../../../componanets/Subname';

type IProps = {
	packageItem: PackageDetailsType;
	t: Awaited<ReturnType<typeof getTranslations>>;
	locale: string;
}

const PackageDetailsBooking = ({ packageItem, t, locale }: IProps) => {
	return (
		<div className='bg-card/10 py-3'>
			<Container>
				<div className="space-y-10">
					<HeadingTitle>
						{t("packageDetails.FeaturesContents")}
						<span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-primary rounded-full opacity-80"></span>
					</HeadingTitle>
					<div className='relative bg-[#c9beae87] w-full  text-3xl font-black text-foreground p-5 border-2 border-Brown-color rounded-[30px]'>
						{
							packageItem?.number !== 0 && packageItem?.number !== "0" && packageItem?.number !== "" &&
							<p
								className='absolute top-3 left-3 w-12 h-12 max-ssmd:w-10 max-ssmd:h-10
								 rounded-full bg-[#03635a] text-[#ffffff] 
								 flex items-center justify-center z-1text-xl 
								 max-ssmd:text-[24px] font-bold shadow-sm transition-transform duration-300 hover:scale-110 text-center px-1 text-sm'>
								{packageItem?.number}
							</p>
						}
						<div className='flex flex-col items-center mb-10 max-ssmd:mb-7'>
							<h2 className='max-ssmd:text-[23px] flex flex-col gap-1 font-[800] tracking-widest text-foreground text-center relative uppercase'>
								<span>{packageItem?.title}</span>
							</h2>
							{packageItem?.subnameEn && (
								<Subname
									SubName={packageItem?.subnameEn}
									locale={locale}
									style={`text-[20px] max-ssmd:text-[19px] flex flex-col gap-1 
									font-[800] tracking-widest text-foreground/70
									 text-center relative uppercase`}
								/>
							)}
						</div>
						<div className='grid grid-cols-2 max-smd:grid-cols-1 max-smd:gap-10 max-ssmd:gap-5 items-start  
							  rounded-[30px]'>
							{/* Features Grid side (grows with many points) */}
							<div className="col-span-1 flex flex-col">
								{packageItem.points && packageItem.points.length > 0 ? (
									<div className="grid grid-cols-4 gap-4">
										<div className='flex flex-col gap-2 justify-center w-full col-span-3 max-smd:col-span-4'>
											{packageItem.points.map((p: string, i: number) => (
												<div key={i} className="flex items-center gap-4 bg-background py-2 px-5 rounded-2xl 
												border border-border/50 hover:border-[#b0a090]/40 hover:shadow-lg transition-all duration-300 group">
													<div className="flex-shrink-0 mt-0.5 p-1.5 rounded-full bg-[#b0a090]/10 text-[#b0a090] group-hover:scale-110 
														transition-transform duration-300">
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
														</svg>
													</div>
													<span className="text-lg max-mxmdd:text-[14px] font-[500] text-foreground/80 leading-snug">{p}</span>
												</div>
											))}
										</div>
									</div>
								) : (
									<p className="text-foreground/70 text-lg leading-relaxed italic border border-border/50 p-6 rounded-2xl bg-background">
										{packageItem.description}
									</p>
								)}
							</div>

							{/* Pricing Card side (sticky to screen scroll) */}
							<div className="bg-card p-1 rounded-[2.5rem]">
								<div className="p-8 max-ssmd:p-5 space-y-8 text-center relative 
								overflow-hidden">
									{/* Background subtle elements */}
									<div className="absolute top-0 end-0 -me-10 -mt-10 w-40 h-40 
									 rounded-full blur-2xl pointer-events-none" />

									<div className="space-y-4 relative z-10">
										<span className="text-sm max-smd:text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">
											{t('packageDetails.PackagePrice')}
										</span>
										<div className="flex flex-col items-center justify-center">
											{packageItem.offer > 0 ? (
												<>
													<span className="text-lg text-foreground/40 line-through font-bold">
														{packageItem.price} <small className="text-xs uppercase font-black tracking-tighter">EGP</small>
													</span>
													<span className="text-5xl max-ssmd:text-3xl font-black text-foreground drop-shadow-sm">
														{packageItem.price - packageItem.offer} <small className="text-lg uppercase text-foreground/60">EGP</small>
													</span>
												</>
											) : (
												<span className="text-5xl max-smd:text-4xl font-black text-foreground drop-shadow-sm">
													{packageItem.price} <small className="text-lg uppercase text-foreground/60">EGP</small>
												</span>
											)}
										</div>

									</div>
								</div>

								<Link href={`/booking/${packageItem.id}`}
									className="w-[94%] max-smd:w-[75%] max-ssmd:w-[85%] mx-auto py-5 px-8 rounded-full 
									bg-[#03635a] text-white font-black text-lg max-ssmd:text-[16px] 
									shadow-xl hover:shadow-[#b0a090]/30 hover:scale-[1.02] active:scale-[0.98] 
									transition-all duration-300 uppercase tracking-wide flex justify-center 
									items-center relative">
									{t('packageDetails.BookNow')}
								</Link>

								<p className="text-sm py-3 text-center text-foreground/50 font-medium relative z-10">
									{t('packageDetails.TermsAndConditions')}
								</p>
							</div>
						</div>
					</div>
				</div>
			</Container>
		</div>
	)
}

export default PackageDetailsBooking