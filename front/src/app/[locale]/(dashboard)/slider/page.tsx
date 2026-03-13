"use client"
import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ImageIcon, Loader2, ExternalLink } from 'lucide-react'
import SliderModal from './SliderModal';
import DashboardHeading from '../componanets/DashboardHeading';
import FeedbackModal from '../componanets/FeedbackModal';
import { apiFetch } from '@/app/[locale]/lib/api'
import { useConfirm } from '../componanets/ConfirmModalContext'

interface Slider {
	_id: string;
	'title-ar': string;
	'title-en': string;
	image: any; // Changed from string to any to handle File object during upload
	link?: string;
	sort: number;
	active: number;
}


const SliderManagement = () => {
	const { showConfirm } = useConfirm()
	const [sliders, setSliders] = useState<Slider[]>([])
	const [loading, setLoading] = useState(true)
	const [modalOpen, setModalOpen] = useState(false)
	const [editingSlider, setEditingSlider] = useState<Slider | null>(null)
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const [serverErrors, setServerErrors] = useState<Record<string, string>>({})
	const [formData, setFormData] = useState<Omit<Slider, '_id' | 'sort'> & { sort: number | '' }>({
		'title-ar': '',
		'title-en': '',
		image: '',
		link: '',
		sort: '',
		active: 1
	})

	const [feedbackModal, setFeedbackModal] = useState({
		isOpen: false,
		type: 'success' as 'success' | 'error',
		message: ''
	});

	const fetchSliders = async () => {
		try {
			setLoading(true)
			const res = await apiFetch('/dashboard/sliders')
			if (!res.ok) throw new Error('فشلت عملية جلب البيانات')
			const data = await res.json()
			setSliders(data)
		} catch (error) {
			console.error('Error fetching sliders:', error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchSliders()
	}, [])

	const handleStatusToggle = async (id: string, currentStatus: number) => {
		try {
			const res = await apiFetch(`/dashboard/sliders/${id}`, {
				method: 'PATCH',
				body: JSON.stringify({ active: currentStatus === 1 ? 0 : 1 })
			})
			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || 'فشلت العملية');
			}
			fetchSliders();
			// Trigger revalidation for sliders
			try {
				const secret = 'mimo_secret_2026';
				await fetch(`/api/revalidate?tag=sliders&secret=${secret}`);
			} catch (e) {
				console.error('Revalidation failed', e);
			}
		} catch (error: any) {
			console.error('Error toggling status:', error)
			setFeedbackModal({ isOpen: true, type: 'error', message: error.message || 'حدث خطأ أثناء تغيير الحالة' });
		}
	}

	const handleDelete = async (id: string) => {
		showConfirm({
			title: 'تأكيد الحذف',
			message: 'هل أنت متأكد من حذف هذا السلايدر؟',
			confirmText: 'تاكيد',
			onConfirm: async () => {
				try {
					const res = await apiFetch(`/dashboard/sliders/${id}`, {
						method: 'DELETE'
					})
					if (!res.ok) {
						const errorData = await res.json();
						throw new Error(errorData.message || 'فشلت العملية');
					}
					fetchSliders();
					// Trigger revalidation for sliders
					try {
						const secret = 'mimo_secret_2026';
						await fetch(`/api/revalidate?tag=sliders&secret=${secret}`);
					} catch (e) {
						console.error('Revalidation failed', e);
					}
					setFeedbackModal({ isOpen: true, type: 'success', message: 'تم حذف السلايدر بنجاح!' });
				} catch (error: any) {
					console.error('Error deleting slider:', error)
					setFeedbackModal({ isOpen: true, type: 'error', message: error.message || 'حدث خطأ أثناء الحذف' });
				}
			}
		});
	}

	const handleOpenModal = (slider: Slider | null = null) => {
		setServerErrors({});
		if (slider) {
			setEditingSlider(slider)
			setFormData({
				'title-ar': slider['title-ar'] || '',
				'title-en': slider['title-en'] || '',
				image: slider.image || '',
				link: slider.link || '',
				sort: slider.sort,
				active: slider.active !== undefined ? slider.active : 1
			})
		} else {
			setEditingSlider(null)
			setFormData({
				'title-ar': '',
				'title-en': '',
				image: '',
				link: '',
				sort: '',
				active: 1
			})
		}
		setModalOpen(true)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setServerErrors({});
		const method = editingSlider ? 'PUT' : 'POST'
		const endpoint = editingSlider ? `/dashboard/sliders/${editingSlider._id}` : '/dashboard/sliders'

		try {
			const bodyData = new FormData();
			bodyData.append('sort', formData.sort.toString());
			bodyData.append('active', formData.active.toString());

			if (formData.image && typeof formData.image !== 'string') {
				bodyData.append('image', formData.image);
			}

			const res = await apiFetch(endpoint, {
				method,
				body: bodyData,
				timeout: 60000 // 60 seconds timeout
			})

			if (!res.ok) {
				const errorData = await res.json();
				const errorMessage = errorData.message || 'فشلت العملية';

				if (errorMessage.includes('رقم الترتيب')) {
					setServerErrors({ sort: errorMessage });
					throw new Error('VALIDATION_ERROR');
				}

				throw new Error(errorMessage);
			}

			setModalOpen(false);
			fetchSliders();
			// Trigger revalidation for sliders
			try {
				const secret = 'mimo_secret_2026';
				await fetch(`/api/revalidate?tag=sliders&secret=${secret}`);
			} catch (e) {
				console.error('Revalidation failed', e);
			}
			setFeedbackModal({ isOpen: true, type: 'success', message: editingSlider ? 'تم تحديث السلايدر بنجاح!' : 'تم إضافة السلايدر بنجاح!' });
		} catch (error: any) {
			console.error('Error saving slider:', error)

			if (error.message !== 'VALIDATION_ERROR') {
				setFeedbackModal({ isOpen: true, type: 'error', message: error.message || 'حدث خطأ أثناء الحفظ' });
			}
			throw error;
		}
	}

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<DashboardHeading
				title="التحكم في السلايدر"
				description="إدارة الصور والعروض المتحركة في الصفحة الرئيسية"
			>
				<button
					onClick={() => handleOpenModal()}
					className="cursor-pointer flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 font-bold"
				>
					<Plus size={20} />
					إضافة غلاف
				</button>
			</DashboardHeading>

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
									<th className="px-6 py-5">صورة السلايدر</th>
									<th className="px-6 py-5 text-center">الترتيب</th>
									<th className="px-6 py-5 text-center">الحالة</th>
									<th className="px-6 py-5 text-center">الإجراءات</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/40">
								{sliders.length > 0 ? sliders?.map((slider) => (
									<tr key={slider._id} className="hover:bg-primary/5 transition-colors group">
										<td className="px-6 py-5">
											<div className="relative w-24 h-14 rounded-xl overflow-hidden border border-border shadow-sm group-hover:scale-105 transition-transform duration-300">
												<img
													src={slider.image?.startsWith('/uploads') ? `http://localhost:5000${slider.image}` : slider.image}
													alt=""
													className="w-full h-full object-cover"
												/>
												<div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
													<ImageIcon className="text-white w-5 h-5" />
												</div>
											</div>
										</td>
										<td className="px-6 py-5 text-center text-sm font-black text-primary/80">
											#{slider.sort}
										</td>
										<td className="px-6 py-5 text-center">
											<button
												onClick={() => handleStatusToggle(slider._id, slider.active)}
												className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black transition-all border ${slider.active === 1
													? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
													: 'bg-rose-500/10 text-rose-600 border-rose-500/20'
													}`}>
												<span className={`w-1.5 h-1.5 rounded-full ${slider.active === 1 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
												{slider.active === 1 ? 'نـشـط' : 'مـعـطـل'}
											</button>
										</td>
										<td className="px-6 py-5 text-center">
											<div className="flex items-center justify-center gap-2 transition-all duration-300">
												<button
													onClick={() => handleOpenModal(slider)}
													className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
												>
													<Edit2 size={16} />
												</button>
												<button
													onClick={() => handleDelete(slider._id)}
													disabled={deletingId === slider._id}
													className={`cursor-pointer w-9 h-9 flex items-center justify-center rounded-xl transition-all shadow-sm ${deletingId === slider._id
															? 'bg-muted text-muted-foreground cursor-not-allowed'
															: 'bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white'
														}`}
												>
													{deletingId === slider._id ? (
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
												<ImageIcon size={48} className="mb-4 text-muted-foreground" />
												<p className="font-bold">لا توجد بيانات حالياً</p>
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

			{/* Management Modal */}
			{modalOpen && (
				<SliderModal
					setModalOpen={setModalOpen}
					editingSlider={editingSlider}
					formData={formData}
					setFormData={setFormData}
					handleSubmit={handleSubmit}
					serverErrors={serverErrors}
					setServerErrors={setServerErrors}
				/>
			)}

			<FeedbackModal
				isOpen={feedbackModal.isOpen}
				onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
				type={feedbackModal.type}
				message={feedbackModal.message}
			/>
		</div>
	)
}

export default SliderManagement