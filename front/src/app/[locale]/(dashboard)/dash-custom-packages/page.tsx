"use client"
import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Loader2, PackageOpen } from 'lucide-react'
import CustomPackageModal from './CustomPackageModal';
import FeedbackModal from '../componanets/FeedbackModal';
import { apiFetch } from '@/app/[locale]/lib/api'

interface Option {
	_id?: string;
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
	createdAt?: string;
}

const CustomPackages = () => {
	const [packages, setPackages] = useState<CustomPackage[]>([])
	const [loading, setLoading] = useState(true)
	const [modalOpen, setModalOpen] = useState(false)
	const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, type: 'success' as 'success' | 'error', message: '' })
	const [editingPackage, setEditingPackage] = useState<CustomPackage | null>(null)
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const [formData, setFormData] = useState({
		sectionNameAr: '',
		sectionNameEn: '',
		options: [] as Option[],
		sort: '' as number | '',
		active: true
	})

	const fetchPackages = async () => {
		try {
			setLoading(true)
			const res = await apiFetch('/custom-packages')
			if (!res.ok) throw new Error('فشلت عملية جلب البيانات')
			const data = await res.json()
			setPackages(data)
		} catch (error) {
			console.error('Error fetching custom packages:', error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchPackages()
	}, [])

	const handleStatusToggle = async (id: string, currentStatus: boolean) => {
		try {
			const res = await apiFetch(`/custom-packages/${id}`, {
				method: 'PUT',
				body: JSON.stringify({ active: !currentStatus })
			})
			if (res.ok) fetchPackages()
		} catch (error) {
			console.error('Error toggling status:', error)
		}
	}

	const handleDelete = async (id: string) => {
		if (!confirm('هل أنت متأكد من حذف هذا القسم؟ جميع بياناته ستُفقد.')) return
		try {
			setDeletingId(id);
			const res = await apiFetch(`/custom-packages/${id}`, {
				method: 'DELETE'
			})
			if (res.ok) fetchPackages()
		} catch (error) {
			console.error('Error deleting custom package:', error)
		} finally {
			setDeletingId(null);
		}
	}

	const handleOpenModal = (pkg: CustomPackage | null = null) => {
		if (pkg) {
			setEditingPackage(pkg)
			setFormData({
				sectionNameAr: pkg.sectionNameAr || '',
				sectionNameEn: pkg.sectionNameEn || '',
				options: pkg.options ? [...pkg.options] : [],
				sort: pkg.sort,
				active: pkg.active !== undefined ? pkg.active : true
			})
		} else {
			setEditingPackage(null)
			setFormData({
				sectionNameAr: '',
				sectionNameEn: '',
				options: [],
				sort: '',
				active: true
			})
		}
		setModalOpen(true)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const method = editingPackage ? 'PUT' : 'POST'
		const endpoint = editingPackage ? `/custom-packages/${editingPackage._id}` : '/custom-packages'

		try {
			const res = await apiFetch(endpoint, {
				method,
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			})

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || 'فشلت العملية');
			}

			setModalOpen(false);
			fetchPackages();
		} catch (error: any) {
			console.error('Error saving custom package:', error)
			throw error;
		}
	}

	return (
		<div className="space-y-6" dir="rtl">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-foreground">الباقات المخصصة</h1>
					<p className="text-muted-foreground text-sm">إدارة الأقسام والخيارات المتوفرة للباقات المخصصة (اصنع باقتك)</p>
				</div>
				<button
					onClick={() => handleOpenModal()}
					className="cursor-pointer flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 font-bold"
				>
					<Plus size={20} />
					إضافة قسم جديد
				</button>
			</div>

			{/* Content Section */}
			{loading ? (
				<div className="flex flex-col items-center justify-center py-32 gap-4">
					<Loader2 className="w-12 h-12 text-primary animate-spin opacity-50" />
					<p className="text-muted-foreground font-medium">جاري جلب البيانات من الخادم...</p>
				</div>
			) : (
				<div className="bg-card/40 backdrop-blur-xl border border-border rounded-3xl overflow-hidden shadow-xl w-full max-w-full">
					<div className="overflow-auto w-full max-h-[calc(100vh-220px)]">
						<table className="w-full text-right bg-transparent relative">
							<thead className="sticky top-0 z-20 bg-card shadow-sm">
								<tr className="border-b border-border text-muted-foreground text-[11px] uppercase tracking-[0.1em] font-black">
									<th className="px-6 py-5">اسم القسم</th>
									<th className="px-6 py-5 text-center">عدد الخيارات</th>
									<th className="px-6 py-5 text-center">الترتيب</th>
									<th className="px-6 py-5 text-center">الحالة</th>
									<th className="px-6 py-5 text-center">الإجراءات</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/40">
								{packages.length > 0 ? packages.map((pkg) => (
									<tr key={pkg._id} className="hover:bg-primary/5 transition-colors group">
										<td className="px-6 py-5">
											<div className="flex flex-col">
												<span className="font-bold text-sm">{pkg.sectionNameAr}</span>
												<span className="text-xs text-muted-foreground font-medium mt-0.5">{pkg.sectionNameEn}</span>
											</div>
										</td>
										<td className="px-6 py-5 text-center">
											<span className="inline-flex items-center justify-center bg-muted/50 text-foreground px-3 py-1 rounded-full text-xs font-bold border border-border">
												{pkg.options?.length || 0} خيارات
											</span>
										</td>
										<td className="px-6 py-5 text-center text-sm font-black text-primary/80">
											#{pkg.sort}
										</td>
										<td className="px-6 py-5 text-center">
											<button
												onClick={() => handleStatusToggle(pkg._id, pkg.active)}
												className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black transition-all border ${pkg.active
													? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
													: 'bg-rose-500/10 text-rose-600 border-rose-500/20'
													}`}>
												<span className={`w-1.5 h-1.5 rounded-full ${pkg.active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
												{pkg.active ? 'نـشـط' : 'مـعـطـل'}
											</button>
										</td>
										<td className="px-6 py-5 text-center">
											<div className="flex items-center justify-center gap-2 transition-all duration-300">
												<button
													onClick={() => handleOpenModal(pkg)}
													className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
													title="تعديل"
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
													title="حذف"
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
										<td colSpan={5} className="py-20 text-center">
											<div className="flex flex-col items-center justify-center opacity-40">
												<PackageOpen size={48} className="mb-4 text-muted-foreground" />
												<p className="font-bold">لا توجد أقسام حالياً</p>
												<p className="text-xs mt-1">اضغط على زر الإضافة للبدء في إنشاء باقة مخصصة</p>
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Management Modal */}
			{modalOpen && (
				<CustomPackageModal
					setModalOpen={setModalOpen}
					editingPackage={editingPackage}
					formData={formData}
					setFormData={setFormData as any}
					handleSubmit={handleSubmit}
					setFeedbackModal={setFeedbackModal} />
			)}

			<FeedbackModal
				isOpen={feedbackModal.isOpen}
				onClose={() => setFeedbackModal(prev => ({ ...prev, isOpen: false }))}
				type={feedbackModal.type}
				message={feedbackModal.message}
			/>
		</div>
	)
}

export default CustomPackages