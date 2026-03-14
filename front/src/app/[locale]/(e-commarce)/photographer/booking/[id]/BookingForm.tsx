"use client";

import React, { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import {
	User,
	Calendar,
	Phone,
	Package,
	Sparkles,
	MapPin,
	Send,
	BookText,
	Brush
} from "lucide-react";

interface BookingFormProps {
	packageId: string;
}

interface FormData {
	groomName: string;
	brideName: string;
	dateLocation: string;
	phone1: string;
	phone2: string;
	makeupDetails: string;
	photoshootLocation: string;
	photoshootLocation2: string;
	packageId: string;
}

interface PackageData {
	_id: string;
	'name-en': string;
	'name-ar': string;
	number: number;
}

const BookingForm: React.FC<BookingFormProps> = ({ packageId: initialPackageId }) => {
	const t = useTranslations();
	const locale = useLocale();
	const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
		defaultValues: {
			packageId: initialPackageId === "custom-package" ? "" : initialPackageId
		}
	});

	const [packages, setPackages] = React.useState<PackageData[]>([]);
	const [customPackages, setCustomPackages] = React.useState<any[]>([]);
	const [isPackageDropdownOpen, setPackageDropdownOpen] = React.useState(false);
	const [packageLocal, setpackageLocal] = useState<any>(null);
	const [isCustomPackageAccordionOpen, setIsCustomPackageAccordionOpen] = useState(false);

	const selectedPackageId = watch("packageId");
	const selectedPackage = React.useMemo(() => {
		return packages.find(p => p._id === selectedPackageId || p.number?.toString() === selectedPackageId);
	}, [packages, selectedPackageId]);

	React.useEffect(() => {
		const fetchPackages = async () => {
			try {
				const base_url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
				const res = await fetch(`${base_url}/api/home/packages`, {
					headers: {
						'lang': locale,
					}
				});
				if (res.ok) {
					const data = await res.json();
					setPackages(data);
				}
			} catch (error) {
				console.error('Failed to fetch packages:', error);
			}

			if (initialPackageId === 'custom-package') {
				try {
					const base_url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
					const res = await fetch(`${base_url}/api/custom-packages`, {
						headers: {
							'lang': locale,
						}
					});
					if (res.ok) {
						const data = await res.json();
						setCustomPackages(data);
					}
				} catch (error) {
					console.error('Failed to fetch custom packages:', error);
				}
			}
		};
		fetchPackages();
	}, [locale, initialPackageId]);

	const onSubmit = (data: FormData) => {
		const whatsappNumber = "201055855779"; // Replace with actual number or fetch from config

		// Find selected package to get its true name for the message
		const selectedPackage = packages.find(
			p => String(p._id) === String(data.packageId) || String(p.number) === String(data.packageId)
		);

		let packageName = String(data.packageId);
		if (selectedPackage) {
			const nameAr = selectedPackage["name-ar"] || (selectedPackage as any).name;
			const nameEn = selectedPackage["name-en"] || (selectedPackage as any).name;
			// Use the Arabic or English name based on the current site locale
			packageName = locale === 'ar' ? nameAr : nameEn;
		}

		let packageSection = `5- اسم الباكدج: ${packageName}`;

		if (packageLocal && packageLocal.length > 0 && initialPackageId === 'custom-package') {
			let customTotal = 0;
			const packageLines = packageLocal.map((pack: any) => {
				const option = pack[1];
				customTotal += option?.price || 0;
				// Select correct translation for option name based on locale
				const optionName = locale === 'ar' ? option?.pointAr : option?.pointEn;
				// Select currency based on locale
				const currency = locale === 'ar' ? 'ج.م' : 'EGP';
				return `\u200F-\u00A0${optionName}: ${option?.price} ${currency}`;
			}).join('\n');

			packageSection = `5- اسم الباكدج: الباكدج المخصصه\n${packageLines}\n\u200F-\u00A0الإجمالي: ${customTotal} ج.م`;
		}

		// Hardcoded Arabic message regardless of the site locale, as requested
		const message = `1- اسم العريس: ${data.groomName}
2- اسم العروسة: ${data.brideName}
3- تاريخ ومكان التصوير: ${data.dateLocation}
4- أرقام التليفون: ${data.phone1}, ${data.phone2}
${packageSection}
6- الميكب: ${data.makeupDetails}
7- القاعة: ${data.photoshootLocation}
8- لوكيشن التصوير: ${data.photoshootLocation2 || "غير محدد"}`;

		const encodedMessage = encodeURIComponent(message);
		const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
		window.open(whatsappUrl, "_blank");
	};
	const StorePackageIdsStr = typeof window !== 'undefined' ? localStorage.getItem('selectedOptionIds') : null;
	useEffect(() => {
		if (StorePackageIdsStr && customPackages.length > 0) {
			try {
				const selectedIds = JSON.parse(StorePackageIdsStr) as string[];
				const resolvedOptions: any[] = [];
				customPackages.forEach(section => {
					section.options?.forEach((option: any) => {
						const key = `${section._id}-${option._id}`;
						if (selectedIds.includes(key)) {
							resolvedOptions.push([key, option]);
						}
					});
				});
				setpackageLocal(resolvedOptions);
			} catch (e) {
				console.error('Failed to parse selectedOptionIds', e);
			}
		}
	}, [StorePackageIdsStr, customPackages]);

	return (
		<div className="w-full mx-auto">
			<div className="relative overflow-hidden bg-background/60 backdrop-blur-xl p-5 md:p-10 
				animate-fade-in text-start">
				{/* Decorative elements */}
				<div className="absolute top-0 end-0 -me-20 -mt-20 w-64 h-64 bg-[#b0a090]/20 rounded-full blur-3xl opacity-50" />
				<div className="absolute bottom-0 start-0 -ms-20 -mb-20 w-64 h-64 bg-Brown-color/20 rounded-full blur-3xl opacity-50" />

				<div className="relative z-10 ">
					<div className="pb-10 max-ssmd:pb-6 text-center">
						<h1 className="text-3xl md:text-4xl font-bold bg-[#03635a] pb-1 head
						bg-clip-text text-transparent mb-4 max-ssmd:mb-0">
							{t("Booking.title")}
						</h1>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						{/* Groom Name */}
						<div className="group transition-all relative">
							<label className="block text-sm font-medium mb-2 text-foreground/80 group-focus-within:text-[#b0a090] transition-colors ps-1">
								{t("Booking.groomName")}
							</label>
							<div className="relative">
								<User className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-[#b0a090] transition-colors" />
								<input
									{...register("groomName", { required: t("Booking.groomNameRequired") })}
									className="w-full ps-12 pe-4 py-3 bg-foreground/5 border border-border/50 rounded-2xl outline-none focus:border-[#b0a090] focus:ring-4 focus:ring-[#b0a090]/10 transition-all placeholder:text-foreground/30"
									placeholder={locale === 'ar' ? "اسم العريس" : "Groom Name"}
								/>
							</div>
							{errors.groomName && <span className="text-red-500 text-xs mt-1 absolute -bottom-5 start-1">{errors.groomName.message}</span>}
						</div>

						{/* Bride Name */}
						<div className="group transition-all relative">
							<label className="block text-sm font-medium mb-2 text-foreground/80 group-focus-within:text-[#b0a090] transition-colors ps-1">
								{t("Booking.brideName")}
							</label>
							<div className="relative">
								<User className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-[#b0a090] transition-colors" />
								<input
									{...register("brideName", { required: t("Booking.brideNameRequired") })}
									className="w-full ps-12 pe-4 py-3 bg-foreground/5 border border-border/50 rounded-2xl outline-none focus:border-[#b0a090] focus:ring-4 focus:ring-[#b0a090]/10 transition-all placeholder:text-foreground/30"
									placeholder={locale === 'ar' ? "اسم العروسة" : "Bride Name"}
								/>
							</div>
							{errors.brideName && <span className="text-red-500 text-xs mt-1 absolute -bottom-5 start-1">{errors.brideName.message}</span>}
						</div>

						{/* Date of Shoot */}
						<div className="group transition-all relative">
							<label className="block text-sm font-medium mb-2 text-foreground/80 group-focus-within:text-[#b0a090] transition-colors ps-1">
								{t("Booking.dateLocation")}
							</label>
							<div className="relative">
								<Calendar className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-[#b0a090] transition-colors pointer-events-none z-10" />
								<input
									type="text"
									{...register("dateLocation", { required: t("Booking.dateLocationRequired") })}
									className="w-full ps-12 pe-4 py-3 bg-foreground/5 border border-border/50 rounded-2xl outline-none focus:border-[#b0a090] focus:ring-4 focus:ring-[#b0a090]/10 transition-all text-foreground"
									placeholder={locale === 'ar' ? "تاريخ ومكان التصوير" : "Date and Location"}
								/>
							</div>
							{errors.dateLocation && <span className="text-red-500 text-xs mt-1 absolute -bottom-5 start-1">{errors.dateLocation.message}</span>}
						</div>

						{/* Phone Numbers Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="group transition-all relative">
								<label className="block text-sm font-medium mb-2 text-foreground/80 group-focus-within:text-[#b0a090] transition-colors ps-1">
									{t("Booking.phone1")}
								</label>
								<div className="relative">
									<Phone className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-[#b0a090] transition-colors" />
									<input
										{...register("phone1", { required: t("Booking.phone1Required") })}
										className="w-full ps-12 pe-4 py-3 bg-foreground/5 border border-border/50 rounded-2xl outline-none focus:border-[#b0a090] focus:ring-4 focus:ring-[#b0a090]/10 transition-all placeholder:text-foreground/30"
										placeholder="01xxxxxxxxx"
									/>
								</div>
								{errors.phone1 && <span className="text-red-500 text-xs mt-1 absolute -bottom-5 start-1">{errors.phone1.message}</span>}
							</div>
							<div className="group transition-all relative">
								<label className="block text-sm font-medium mb-2 text-foreground/80 group-focus-within:text-[#b0a090] transition-colors ps-1">
									{t("Booking.phone2")}
								</label>
								<div className="relative">
									<Phone className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-[#b0a090] transition-colors" />
									<input
										// {...register("phone2", { required: t("Booking.phone2Required") })}
										className="w-full ps-12 pe-4 py-3 bg-foreground/5 border border-border/50 rounded-2xl outline-none focus:border-[#b0a090] focus:ring-4 focus:ring-[#b0a090]/10 transition-all placeholder:text-foreground/30"
										placeholder="01xxxxxxxxx"
									/>
								</div>
								{errors.phone2 && <span className="text-red-500 text-xs mt-1 absolute -bottom-5 start-1">{errors.phone2.message}</span>}
							</div>
						</div>

						{/* Package Selection Custom */}
						{
							(packageLocal && packageLocal.length > 0 && initialPackageId === 'custom-package') &&
							<div className="mb-4 bg-foreground/5 rounded-2xl border border-border/50 overflow-hidden">
								<button
									type="button"
									onClick={() => setIsCustomPackageAccordionOpen(!isCustomPackageAccordionOpen)}
									className="w-full cursor-pointer flex justify-between items-center p-4 hover:bg-foreground/5 transition-colors"
								>
									<span className="text-sm font-bold text-foreground/80">
										{t('Booking.packageDetails')}
									</span>
									<svg
										className={`w-5 h-5 text-[#03635a] transition-transform duration-300 ${isCustomPackageAccordionOpen ? 'rotate-180' : ''}`}
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
									</svg>
								</button>
								<div
									className={`grid transition-all duration-500 ease-in-out ${isCustomPackageAccordionOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
										}`}
								>
									<div className={`overflow-hidden`}>
										<div className="p-4 pt-3 space-y-3 border-t border-border/50 mt-1">
											{packageLocal.map((pack: any, index: number) => {
												const option = pack[1];
												return (
													<div key={index} className="flex justify-between items-center p-3 bg-background rounded-xl 
													border border-border/50">
														<span className="text-foreground/80 text-sm font-medium">
															{locale === 'ar' ? option?.pointAr : option?.pointEn}
														</span>
														<span className="font-bold text-[#03635a] text-sm whitespace-nowrap ms-4">
															{option?.price} EGP
														</span>
													</div>
												);
											})}
											<div className="flex justify-between items-center p-3 bg-[#03635a]/10 rounded-xl border border-[#03635a]/20 mt-2">
												<span className="font-bold text-foreground">
													{t('HomePage.TotalPrice')}
												</span>
												<span className="font-black text-[#03635a] whitespace-nowrap ms-4">
													{packageLocal.reduce((acc: number, curr: any) => acc + (curr[1]?.price || 0), 0)} EGP
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						}
						{/* Package Name */}
						{
							!(packageLocal && packageLocal.length > 0 && initialPackageId === 'custom-package') &&
							<div className="group transition-all relative z-50">
								<label className="block text-sm font-medium mb-2 text-foreground/80 group-focus-within:text-[#b0a090] transition-colors ps-1">
									{t("Booking.packageName")}
								</label>

								<div className="relative">
									<Package className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-[#b0a090] transition-colors z-10" />

									{/* Custom Select Trigger */}
									<div
										onClick={() => setPackageDropdownOpen(!isPackageDropdownOpen)}
										className={`w-full ps-12 pe-4 py-3 bg-foreground/5 border 
										${isPackageDropdownOpen ? 'border-[#b0a090] ring-4 ring-[#b0a090]/10' : 'border-border/50'} 
										rounded-2xl outline-none transition-all cursor-pointer flex justify-between items-center 
										group-hover:border-[#b0a090]/50`}
									>
										<span className={!selectedPackage ? "text-foreground/30" : "text-foreground font-medium"}>
											{selectedPackage
												? (locale === 'ar' ? selectedPackage["name-ar"] : selectedPackage['name-en'])
												: (locale === 'ar' ? 'اختر الباكدج المناسب لك' : 'Select your perfect package')}
										</span>
										<svg
											className={`w-5 h-5 text-foreground/40 transition-transform duration-300 
											${isPackageDropdownOpen ? 'rotate-180 text-[#b0a090]' : ''}`}
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
										</svg>
									</div>

									{/* Hidden native input for React Hook Form validation */}
									<input
										type="hidden"
										{...register("packageId", { required: t("Booking.packagesRequired") })}
									/>

									{/* Custom Dropdown Menu */}
									<div
										className={`absolute top-full start-0 mt-2 w-full bg-background border border-border/50 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-top z-50
										${isPackageDropdownOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}
									>
										<div className="max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#b0a090]/20 scrollbar-track-transparent py-2">
											{packages.length === 0 ? (
												<div className="p-4 text-center text-foreground/50 text-sm">
													{locale === 'ar' ? 'جاري تحميل الباكدجات...' : 'Loading packages...'}
												</div>
											) : (
												packages.map((pkg) => {
													const pkgValue = pkg.number?.toString() || pkg._id;
													const isSelected = selectedPackageId === pkgValue;

													return (
														<div
															key={pkg._id}
															onClick={() => {
																setValue("packageId", pkgValue, { shouldValidate: true });
																setPackageDropdownOpen(false);
															}}
															className={`px-4 py-3 mx-2 rounded-xl cursor-pointer transition-colors flex items-center justify-between
															${isSelected ? 'bg-[#b0a090]/10 text-[#b0a090] font-bold' : 'hover:bg-foreground/5 text-foreground/80'}`}
														>
															<span>{locale === 'ar' ? pkg['name-ar'] : pkg['name-en']}</span>
															{isSelected && (
																<svg className="w-5 h-5 text-[#b0a090]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
																</svg>
															)}
														</div>
													);
												})
											)}
										</div>
									</div>
								</div>
								{errors.packageId && <span className="text-red-500 text-xs mt-1 absolute -bottom-5 start-1">{errors.packageId.message}</span>}
							</div>
						}
						{/* Photoshoot Hall */}
						<div className="group transition-all relative">
							<label className="block text-sm font-medium mb-2 text-foreground/80 group-focus-within:text-[#b0a090] transition-colors ps-1">
								{t("Booking.photoshootLocation")}
							</label>
							<div className="relative">
								<MapPin className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-[#b0a090] transition-colors" />
								<input
									// {...register("photoshootLocation", { required: t("Booking.photoshootLocationRequired") })}
									className="w-full ps-12 pe-4 py-3 bg-foreground/5 border border-border/50 rounded-2xl outline-none focus:border-[#b0a090] focus:ring-4 focus:ring-[#b0a090]/10 transition-all placeholder:text-foreground/30"
								/>
							</div>
							{errors.photoshootLocation && <span className="text-red-500 text-xs mt-1 absolute -bottom-5 start-1">{errors.photoshootLocation.message}</span>}
						</div>
						{/* Photoshoot Location 2 */}
						<div className="group transition-all relative">
							<label className="block text-sm font-medium mb-2 text-foreground/80 group-focus-within:text-[#b0a090] transition-colors ps-1">
								{t("Booking.photoshootLocation2")}
							</label>
							<div className="relative">
								<MapPin className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-[#b0a090] transition-colors" />
								<input
									// {...register("photoshootLocation2")}
									className="w-full ps-12 pe-4 py-3 bg-foreground/5 border border-border/50 rounded-2xl outline-none focus:border-[#b0a090] focus:ring-4 focus:ring-[#b0a090]/10 transition-all placeholder:text-foreground/30"
								/>
							</div>
						</div>
						{/* Photoshoot Location */}
						<div className="group transition-all relative">
							<label className="block text-sm font-medium mb-2 text-foreground/80 group-focus-within:text-[#b0a090] transition-colors ps-1">
								{t("Booking.makeupDetails")}
							</label>
							<div className="relative">
								<Brush size={24} className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-[#b0a090]
								 transition-colors"  />
								<input
									// {...register("makeupDetails", { required: t("Booking.makeupDetailsRequired") })}
									className="w-full ps-12 pe-4 py-3 bg-foreground/5 border border-border/50 rounded-2xl outline-none focus:border-[#b0a090] focus:ring-4 focus:ring-[#b0a090]/10 transition-all placeholder:text-foreground/30"
								/>
							</div>
							{errors.makeupDetails && <span className="text-red-500 text-xs mt-1 absolute -bottom-5 start-1">{errors.makeupDetails.message}</span>}
						</div>

						{/* Terms & Conditions */}
						<div className="mt-6 p-5 rounded-2xl bg-Brown-color/10 border border-Brown-color/30 space-y-3">
							<p className="text-sm font-bold text-foreground/70 uppercase tracking-wider mb-3 flex items-center gap-2">
								<BookText />
								{t("Booking.BookingTerms")}
							</p>
							<ul className="space-y-2 text-sm text-foreground/80">
								<li className="flex items-start gap-2">
									<span className="text-Brown-color font-bold mt-0.5">•</span>
									<span>{t('Booking.depositisrequiredtoconfirmthebooking')} <strong>30%</strong> {t('Booking.Oftheamount')}</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-Brown-color font-bold mt-0.5">•</span>
									<span>{t('Booking.Incaseofcancellation')} <strong>{t('Booking.thedepositisnotrefundable')}</strong></span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-Brown-color font-bold mt-0.5">•</span>
									<span>{t('Booking.noreadyBooking')} <strong>{t('Booking.bookingday')}</strong></span>
								</li>
							</ul>
						</div>

						<button
							type="submit"
							className="w-full mt-8 py-4 bg-[#03635a] cursor-pointer text-white 
							rounded-2xl font-bold text-lg 
							flex items-center justify-center gap-3 
							hover:scale-[1.02] active:scale-95 
							transition-all max-ssmd:text-sm"
						>
							<svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
								width="50px" height="50px" viewBox="0 0 24 24" version="1.1">
								<title>whatsapp_fill</title>
								<g id="页面-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
									<g id="Brand" transform="translate(-864.000000, -48.000000)">
										<g id="whatsapp_fill" transform="translate(864.000000, 48.000000)">
											<path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" id="MingCute" fillRule="nonzero">

											</path>
											<path d="M12,2 C6.47715,2 2,6.47715 2,12 C2,13.8896 2.52505,15.6594 3.43756,17.1683 L2.54581,20.2002 C2.32023,20.9672 3.03284,21.6798 3.79975,21.4542 L6.83171,20.5624 C8.34058,21.475 10.1104,22 12,22 C17.5228,22 22,17.5228 22,12 C22,6.47715 17.5228,2 12,2 Z M9.73821,14.2627 C11.7607,16.2852 13.692,16.5518 14.3739,16.5769 C15.4111,16.6151 16.421,15.823 16.8147,14.9042 C16.9112,14.6792 16.8871,14.4085 16.7255,14.2014 C16.1782,13.5005 15.4373,12.9983 14.7134,12.4984 C14.4006,12.282 13.9705,12.349 13.7401,12.6555 L13.1394,13.5706 C13.0727,13.6721 12.9402,13.707 12.8348,13.6467 C12.4283,13.4143 11.8356,13.018 11.4092,12.5916 C10.9833,12.1657 10.6111,11.5998 10.4022,11.2195 C10.3473,11.1195 10.3777,10.996 10.4692,10.928 L11.3927,10.2422 C11.6681,10.0038 11.7165,9.59887 11.5138,9.30228 C11.065,8.64569 10.5422,7.8112 9.7855,7.25926 C9.57883,7.1085 9.3174,7.09158 9.10155,7.18408 C8.1817,7.5783 7.38574,8.58789 7.42398,9.62695 C7.44908,10.3089 7.71572,12.2402 9.73821,14.2627 Z" id="形状" fill="#ffffff">

											</path>
										</g>
									</g>
								</g>
							</svg>
							{t("Booking.submit")}
						</button>
					</form>
				</div >
			</div >
		</div >
	);
};

export default BookingForm;
