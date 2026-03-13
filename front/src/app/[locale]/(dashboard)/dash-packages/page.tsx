"use client"
import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Package as PackageIcon, Loader2, ImageIcon } from 'lucide-react'
import PackageModal from './PackageModal';
import Image from 'next/image'
import { apiFetch } from '@/app/[locale]/lib/api'
import { useConfirm } from '../componanets/ConfirmModalContext'

interface Package {
	_id: string;
	'name-ar': string;
	'name-en': string;
	'subname-ar': string;
	'subname-en': string;
	number: string;
	price: number;
	offer: number;
	sort: number;
	default_image: any;
	images: string[];
	'point-ar': string[];
	'point-en': string[];
	active: number;
	mostseller: number;
	rate: number | '';
	// Helper fields for the form state
	newGalleryFiles?: File[];
	deletedImages?: string[];
}

const DashPackages = () => {
	const { showConfirm } = useConfirm()
	const [packages, setPackages] = useState<Package[]>([])
	const [loading, setLoading] = useState(true)
	const [modalOpen, setModalOpen] = useState(false)
	const [editingPackage, setEditingPackage] = useState<Package | null>(null)
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const [formData, setFormData] = useState<Omit<Package, '_id' | 'price' | 'offer' | 'sort'> & { price: number | '', offer: number | '', sort: number | '' }>({
		'name-ar': '',
		'name-en': '',
		'subname-ar': '',
		'subname-en': '',
		number: '',
		price: '',
		offer: '',
		sort: '',
		default_image: '',
		images: [],
		'point-ar': [],
		'point-en': [],
		active: 1,
		mostseller: 0,
		rate: '',
		newGalleryFiles: [],
		deletedImages: []
	})

	const fetchPackages = async () => {
		try {
			setLoading(true)
			const res = await apiFetch('/dashboard/packages')
			if (!res.ok) throw new Error('فشلت عملية جلب البيانات')
			const data = await res.json()
			setPackages(data)
		} catch (error) {
			console.error('Error fetching packages:', error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchPackages()
	}, [])

	const handleStatusToggle = async (id: string) => {
		try {
			const res = await apiFetch(`/dashboard/packages/${id}/active`, {
				method: 'PATCH'
			})
			if (res.ok) {
				fetchPackages();
				// Trigger revalidation for packages
				try {
					const secret = 'mimo_secret_2026';
					await fetch(`/api/revalidate?tag=packages&secret=${secret}`);
				} catch (e) {
					console.error('Revalidation failed', e);
				}
			}
		} catch (error) {
			console.error('Error toggling status:', error)
		}
	}

	const handleMostRequestedToggle = async (id: string) => {
		try {
			const res = await apiFetch(`/dashboard/packages/${id}/mostseller`, {
				method: 'PATCH'
			})
			if (res.ok) {
				fetchPackages();
				// Trigger revalidation for packages
				try {
					const secret = 'mimo_secret_2026';
					await fetch(`/api/revalidate?tag=packages&secret=${secret}`);
				} catch (e) {
					console.error('Revalidation failed', e);
				}
			}
		} catch (error) {
			console.error('Error toggling most requested status:', error)
		}
	}

	const handleDelete = async (id: string) => {
		showConfirm({
			title: 'تأكيد الحذف',
			message: 'هل أنت متأكد من حذف هذه الباقة؟',
			confirmText: 'نعم، احذف',
			onConfirm: async () => {
				try {
					setDeletingId(id);
					const res = await apiFetch(`/dashboard/packages/${id}`, {
						method: 'DELETE'
					})
					if (res.ok) {
						fetchPackages();
						// Trigger revalidation for packages
						try {
							const secret = 'mimo_secret_2026';
							await fetch(`/api/revalidate?tag=packages&secret=${secret}`);
						} catch (e) {
							console.error('Revalidation failed', e);
						}
					}
				} catch (error) {
					console.error('Error deleting package:', error)
				} finally {
					setDeletingId(null);
				}
			}
		});
	}

	const handleOpenModal = (pkg: Package | null = null) => {
		if (pkg) {
			setEditingPackage(pkg)
			setFormData({
				'name-ar': pkg['name-ar'] || '',
				'name-en': pkg['name-en'] || '',
				'subname-ar': pkg['subname-ar'] || '',
				'subname-en': pkg['subname-en'] || '',
				number: pkg.number?.toString() || '',
				price: pkg.price ?? '',
				offer: pkg.offer ?? '',
				sort: pkg.sort ?? '',
				default_image: pkg.default_image || '',
				images: pkg.images || [],
				'point-ar': pkg['point-ar'] || [],
				'point-en': pkg['point-en'] || [],
				active: pkg.active !== undefined ? pkg.active : 1,
				mostseller: pkg.mostseller !== undefined ? pkg.mostseller : 0,
				rate: pkg.rate ?? '',
				newGalleryFiles: [],
				deletedImages: []
			})
		} else {
			setEditingPackage(null)
			setFormData({
				'name-ar': '',
				'name-en': '',
				'subname-ar': '',
				'subname-en': '',
				number: '',
				price: '',
				offer: '',
				sort: '',
				default_image: '',
				images: [],
				'point-ar': [],
				'point-en': [],
				active: 1,
				mostseller: 0,
				rate: '',
				newGalleryFiles: [],
				deletedImages: []
			})
		}
		setModalOpen(true)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const method = editingPackage ? 'PUT' : 'POST'
		const endpoint = editingPackage ? `/dashboard/packages/${editingPackage._id}` : '/dashboard/packages'


		try {
			const bodyData = new FormData();
			bodyData.append('name-ar', formData['name-ar']);
			bodyData.append('name-en', formData['name-en']);
			bodyData.append('subname-ar', formData['subname-ar']);
			bodyData.append('subname-en', formData['subname-en']);
			bodyData.append('number', formData.number);
			bodyData.append('price', formData.price.toString());
			bodyData.append('offer', (formData.offer || 0).toString());
			bodyData.append('sort', formData.sort.toString());
			bodyData.append('active', formData.active.toString());
			bodyData.append('mostseller', formData.mostseller.toString());
			bodyData.append('rate', formData.rate.toString());
			bodyData.append('point-ar', JSON.stringify(formData['point-ar']));
			bodyData.append('point-en', JSON.stringify(formData['point-en']));

			if (formData.default_image instanceof File) {
				bodyData.append('default_image', formData.default_image);
			}

			if (formData.newGalleryFiles && formData.newGalleryFiles.length > 0) {
				formData.newGalleryFiles.forEach(file => {
					bodyData.append('gallery', file);
				});
			}

			if (formData.deletedImages && formData.deletedImages.length > 0) {
				bodyData.append('deletedImages', JSON.stringify(formData.deletedImages));
			}

			const res = await apiFetch(endpoint, {
				method,
				body: bodyData,
				timeout: 90000 // 1.5 minutes timeout for large galleries
			})

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || 'فشلت العملية');
			}

			setModalOpen(false);
			fetchPackages();

			// Trigger revalidation for packages
			try {
				const secret = 'mimo_secret_2026';
				await fetch(`/api/revalidate?tag=packages&secret=${secret}`);
			} catch (e) {
				console.error('Revalidation failed', e);
			}
		} catch (error: any) {
			console.error('Error saving package:', error)
			throw error;
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-foreground">إدارة الباقات</h1>
					<p className="text-foreground/70 text-sm">إدارة باقات الخدمات والأسعار والمميزات</p>
				</div>
				<button
					onClick={() => handleOpenModal()}
					className="cursor-pointer flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 font-bold"
				>
					<Plus size={20} />
					إضافة باقة جديدة
				</button>
			</div>

			{loading ? (
				<div className="flex flex-col items-center justify-center py-32 gap-4">
					<Loader2 className="w-12 h-12 text-primary animate-spin opacity-50" />
					<p className="text-foreground/70 font-medium">جاري جلب البيانات من الخادم...</p>
				</div>
			) : (
				<div className="bg-card/40 backdrop-blur-xl border border-border rounded-3xl shadow-xl w-full max-w-full overflow-hidden">
					<div className="overflow-auto w-full max-h-[calc(100vh-220px)] max-mxmdd:max-h-[calc(100vh-250px)] custom-scrollbar">
						<table className="w-full text-right bg-transparent relative">
							<thead className="sticky top-0 z-20 bg-card shadow-sm">
								<tr className="border-b border-border text-foreground/80 text-[11px] uppercase tracking-[0.1em] font-black">
									<th className="px-6 py-5 sticky right-0 bg-card z-30 shadow-[-5px_0_10px_-5px_var(--border)] border-l border-border/50">صورة الباكدج</th>
									<th className="px-6 py-5">الاسم (عربي)</th>
									<th className="px-6 py-5 uppercase">Name (EN)</th>
									<th className="px-6 py-5">المميزات (عربي)</th>
									<th className="px-6 py-5 uppercase">Features (EN)</th>
									<th className="px-6 py-5 text-center">الترتيب</th>
									<th className="px-6 py-5 text-center">العدد</th>
									<th className="px-6 py-5 text-center">السعر</th>
									<th className="px-6 py-5 text-center">التقييم</th>
									<th className="px-6 py-5 text-center">الأكثر طلباً</th>
									<th className="px-6 py-5 text-center">الحالة</th>
									<th className="px-6 py-5 text-center">الإجراءات</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/40">
								{packages.length > 0 ? packages.map((pkg) => (
									<tr key={pkg._id} className="hover:bg-primary/5 transition-colors group">
										<td className="px-6 py-5 sticky right-0 bg-card group-hover:bg-primary/5 transition-colors z-10 shadow-[-5px_0_10px_-5px_var(--border)] border-l border-border/50">
											<div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border shadow-sm group-hover:scale-105 transition-transform duration-300">
												{pkg.default_image ? (
													<Image
														src={pkg.default_image.startsWith('/uploads') ?
															`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${pkg.default_image}` : pkg.default_image}
														alt={pkg['name-ar'] || ''}
														fill
														className="w-full h-full object-cover"
													/>
												) : (
													<div className="w-full h-full bg-secondary flex items-center justify-center">
														<ImageIcon size={20} className="text-foreground/20" />
													</div>
												)}
											</div>
										</td>
										<td className="px-6 py-5">
											<span className="font-bold text-sm whitespace-nowrap">{pkg['name-ar']}</span>
										</td>
										<td className="px-6 py-5">
											<span className="text-xs text-foreground/70 uppercase font-bold">{pkg['name-en']}</span>
										</td>
										<td className="px-6 py-5 min-w-[250px] max-w-[300px]">
											<div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto custom-scrollbar pr-1">
												{pkg['point-ar']?.map((p, i) => (
													<span key={i} className="inline-flex items-center bg-primary/5 text-foreground/80 px-2.5 py-1 rounded-md text-[11.5px] font-bold border border-primary/20 whitespace-normal text-right leading-tight">
														{p}
													</span>
												))}
											</div>
										</td>
										<td className="px-6 py-5 min-w-[250px] max-w-[300px]">
											<div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto custom-scrollbar pl-1" dir="ltr">
												{pkg['point-en']?.map((p, i) => (
													<span key={i} className="inline-flex items-center bg-primary/5 text-foreground/80 px-2.5 py-1 rounded-md text-[11.5px] font-bold border border-primary/20 whitespace-normal text-left leading-tight">
														{p}
													</span>
												))}
											</div>
										</td>
										<td className="px-6 py-5 text-center font-bold text-xs">
											{pkg.sort}
										</td>
										<td className="px-6 py-5 text-center font-bold text-xs text-primary">
											{pkg.number}
										</td>
										<td className="px-6 py-5 text-center">
											<div className="flex flex-col items-center">
												<span className="text-sm font-black">{pkg.price} <span className="text-[10px] font-normal uppercase">EGP</span></span>
												{pkg.offer > 0 && <span className="text-[10px] text-orange-500 font-bold">-{pkg.offer} Offer</span>}
											</div>
										</td>
										<td className="px-6 py-5 text-center font-bold text-xs text-amber-500">
											{pkg.rate || 0} ⭐
										</td>
										<td className="px-6 py-5 text-center">
											<button
												onClick={() => handleMostRequestedToggle(pkg._id)}
												className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black transition-all border ${pkg.mostseller === 1
													? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
													: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
													}`}>
												<span className={`w-1.5 h-1.5 rounded-full ${pkg.mostseller === 1 ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`}></span>
												{pkg.mostseller === 1 ? 'الأكثر طلباً' : 'عادي'}
											</button>
										</td>
										<td className="px-6 py-5 text-center">
											<button
												onClick={() => handleStatusToggle(pkg._id)}
												className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black transition-all border ${pkg.active === 1
													? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
													: 'bg-rose-500/10 text-rose-600 border-rose-500/20'
													}`}>
												<span className={`w-1.5 h-1.5 rounded-full ${pkg.active === 1 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
												{pkg.active === 1 ? 'نـشـط' : 'مـعـطـل'}
											</button>
										</td>
										<td className="px-6 py-5 text-center">
											<div className="flex items-center justify-center gap-2 transition-all duration-300">
												<button
													onClick={() => handleOpenModal(pkg)}
													className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
												>
													<Edit2 size={16} />
												</button>
												<button
													onClick={() => handleDelete(pkg._id)}
													disabled={deletingId === pkg._id}
													className={`cursor-pointer w-9 h-9 flex items-center justify-center rounded-xl transition-all shadow-sm ${deletingId === pkg._id
														? 'bg-muted text-muted-foreground cursor-not-allowed'
														: 'bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white'
														}`}
												>
													{deletingId === pkg._id ? (
														<Loader2 size={16} className="animate-spin" />
													) : (
														<Trash2 size={16} />
													)}
												</button>
											</div>
										</td>
									</tr>
								)) : (
									<tr>
										<td colSpan={8} className="py-20 text-center">
											<div className="flex flex-col items-center justify-center opacity-40">
												<PackageIcon size={48} className="mb-4 text-muted-foreground" />
												<p className="font-bold">لا توجد باقات حالياً</p>
												<p className="text-xs">اضغط على زر الإضافة للبدء</p>
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{modalOpen && (
				<PackageModal
					setModalOpen={setModalOpen}
					editingPackage={editingPackage}
					formData={formData}
					setFormData={setFormData}
					handleSubmit={handleSubmit} />
			)}
		</div>
	)
}

export default DashPackages