"use client"
import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ImageIcon, Loader2 } from 'lucide-react'
import LogoModal from './LogoModal';
import FeedbackModal from '../componanets/FeedbackModal';
import DashboardHeading from '../componanets/DashboardHeading';
import { apiFetch } from '@/app/[locale]/lib/api'
import { useConfirm } from '../componanets/ConfirmModalContext'

interface Logo {
	_id: string;
	imageLight: any;
	imageDark: any;
	active: number;
}

const LogoManagement = () => {
	const { showConfirm } = useConfirm()
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
	const [logos, setLogos] = useState<Logo[]>([])
	const [loading, setLoading] = useState(true)
	const [modalOpen, setModalOpen] = useState(false)
	const [editingLogo, setEditingLogo] = useState<Logo | null>(null)
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const [formData, setFormData] = useState<Omit<Logo, '_id'>>({
		imageLight: '',
		imageDark: '',
		active: 1
	})

	const [feedbackModal, setFeedbackModal] = useState({
		isOpen: false,
		type: 'success' as 'success' | 'error',
		message: ''
	});

	const fetchLogos = async () => {
		try {
			setLoading(true)
			const res = await apiFetch('/dashboard/logos')
			if (!res.ok) throw new Error('فشلت عملية جلب البيانات')
			const data = await res.json()
			setLogos(data)
		} catch (error) {
			console.error('Error fetching logos:', error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchLogos()
	}, [])

	const handleStatusToggle = async (id: string, currentStatus: number) => {
		if (currentStatus === 1) {
			setFeedbackModal({ isOpen: true, type: 'error', message: 'هذا اللوجو نشط بالفعل. لتغيير اللوجو النشط، قم بتفعيل لوجو آخر بدلاً منه.' });
			return;
		}

		try {
			const res = await apiFetch(`/dashboard/logos/${id}/active`, {
				method: 'PATCH'
			})
			if (res.ok) {
				fetchLogos()
			}
		} catch (error) {
			console.error('Error toggling status:', error)
		}
	}

	const handleDelete = async (id: string) => {
		if (logos.length <= 1) {
			setFeedbackModal({ isOpen: true, type: 'error', message: 'لا يمكن حذف اللوجو الوحيد. يجب أن يكون هناك لوجو واحد على الأقل في النظام.' });
			return;
		}

		const logoToDelete = logos.find(l => l._id === id);
		const activeLogosCount = logos.filter(l => l.active === 1).length;
		if (logoToDelete?.active === 1 && activeLogosCount <= 1) {
			setFeedbackModal({ isOpen: true, type: 'error', message: 'لا يمكن حذف اللوجو النشط الوحيد. الرجاء تفعيل لوجو آخر قبل الحذف.' });
			return;
		}

		showConfirm({
			title: 'تأكيد الحذف',
			message: 'هل أنت متأكد من حذف هذا اللوجو؟',
			confirmText: 'نعم، احذف',
			onConfirm: async () => {
				try {
					setDeletingId(id);
					const res = await apiFetch(`/dashboard/logos/${id}`, {
						method: 'DELETE'
					})
					if (res.ok) {
						fetchLogos()
						setFeedbackModal({ isOpen: true, type: 'success', message: 'تم حذف اللوجو بنجاح!' });
					}
				} catch (error) {
					console.error('Error deleting logo:', error)
				} finally {
					setDeletingId(null);
				}
			}
		});
	}

	const handleOpenModal = (logo: Logo | null = null) => {
		if (logo) {
			setEditingLogo(logo)
			setFormData({
				imageLight: logo.imageLight || '',
				imageDark: logo.imageDark || '',
				active: logo.active !== undefined ? logo.active : 1
			})
		} else {
			setEditingLogo(null)
			setFormData({
				imageLight: '',
				imageDark: '',
				active: 1
			})
		}
		setModalOpen(true)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const method = editingLogo ? 'PUT' : 'POST'
		const endpoint = editingLogo ? `/dashboard/logos/${editingLogo._id}` : '/dashboard/logos'

		try {
			const bodyData = new FormData();
			bodyData.append('active', formData.active.toString());

			// Only append image if it's a File (newly selected)
			if (formData.imageLight && typeof formData.imageLight !== 'string') {
				bodyData.append('imageLight', formData.imageLight);
			}
			if (formData.imageDark && typeof formData.imageDark !== 'string') {
				bodyData.append('imageDark', formData.imageDark);
			}

			const realMethod = 'POST';
			const realEndpoint = '/dashboard/logos';

			const res = await apiFetch(realEndpoint, {
				method: realMethod,
				body: bodyData,
				timeout: 60000 // 60 seconds timeout
			})

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || 'فشلت العملية');
			}

			setModalOpen(false);
			fetchLogos();

			// Trigger revalidation for logos
			try {
				const secret = 'mimo_secret_2026'; // In a real app, this would be an env var accessed via a server action or secured better
				await fetch(`/api/revalidate?tag=logo&secret=${secret}`);
			} catch (e) {
				console.error('Revalidation failed', e);
			}

			setFeedbackModal({ isOpen: true, type: 'success', message: editingLogo ? 'تم تحديث اللوجو بنجاح!' : 'تم إضافة اللوجو بنجاح!' });
		} catch (error: any) {
			console.error('Error saving logo:', error)
			setFeedbackModal({ isOpen: true, type: 'error', message: error.message || 'حدث خطأ أثناء الحفظ' });
		}
	}

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<DashboardHeading
				title="التحكم في اللوجو"
				description="إدارة الشعار المخصص لعرضه على الموقع"
			>
				<button
					onClick={() => handleOpenModal()}
					className="cursor-pointer flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 font-bold"
				>
					<Plus size={20} />
					إضافة لوجو
				</button>
			</DashboardHeading>

			{/* Content Section */}
			{loading ? (
				<div className="flex flex-col items-center justify-center py-32 gap-4">
					<Loader2 className="w-12 h-12 text-primary animate-spin opacity-50" />
					<p className="text-muted-foreground font-medium">جاري جلب البيانات من الخادم...</p>
				</div>
			) : (
				<div className="bg-card/40 backdrop-blur-xl border border-border rounded-3xl overflow-hidden shadow-xl">
					<div className="overflow-x-auto">
						<table className="w-full text-right">
							<thead>
								<tr className="bg-muted/30 border-b border-border text-muted-foreground text-[11px] uppercase tracking-[0.1em] font-black">
									<th className="px-6 py-5">اللوجو المضيء (Light)</th>
									<th className="px-6 py-5">اللوجو المظلم (Dark)</th>
									<th className="px-6 py-5 text-center">الحالة</th>
									<th className="px-6 py-5 text-center">الإجراءات</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/40">
								{logos.length > 0 ? logos?.map((logo) => (
									<tr key={logo._id} className="hover:bg-primary/5 transition-colors group">
										<td className="px-6 py-5">
											<div className="relative w-24 h-14 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300 bg-gray-300 p-2 flex items-center justify-center border border-border">
												<img
													src={logo.imageLight?.startsWith('/uploads') ? `${apiUrl}${logo.imageLight}` : logo.imageLight}
													alt="Light Logo"
													className="w-full h-full object-contain"
												/>
											</div>
										</td>
										<td className="px-6 py-5">
											<div className="relative w-24 h-14 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300 bg-gray-700 p-2 flex items-center justify-center border border-gray-700">
												<img
													src={logo.imageDark?.startsWith('/uploads') ? `${apiUrl}${logo.imageDark}` : logo.imageDark}
													alt="Dark Logo"
													className="w-full h-full object-contain"
												/>
											</div>
										</td>
										<td className="px-6 py-5 text-center">
											<button
												onClick={() => handleStatusToggle(logo._id, logo.active)}
												className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black transition-all border ${logo.active === 1
													? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
													: 'bg-rose-500/10 text-rose-600 border-rose-500/20'
													}`}>
												<span className={`w-1.5 h-1.5 rounded-full ${logo.active === 1 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
												{logo.active === 1 ? 'نـشـط' : 'مـعـطـل'}
											</button>
										</td>
										<td className="px-6 py-5 text-center">
											<div className="flex items-center justify-center gap-2 transition-all duration-300">
												{/* Removing Edit button since it wasn't requested natively and usually a logo is just deleted and re-added */}
												<button
													onClick={() => handleDelete(logo._id)}
													disabled={deletingId === logo._id}
													className={`cursor-pointer w-9 h-9 flex items-center justify-center rounded-xl transition-all shadow-sm ${deletingId === logo._id
															? 'bg-muted text-muted-foreground cursor-not-allowed'
															: 'bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white'
														}`}
												>
													{deletingId === logo._id ? (
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
										<td colSpan={4} className="py-20 text-center">
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
				<LogoModal
					setModalOpen={setModalOpen}
					editingLogo={editingLogo}
					formData={formData}
					setFormData={setFormData}
					handleSubmit={handleSubmit} />
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

export default LogoManagement
