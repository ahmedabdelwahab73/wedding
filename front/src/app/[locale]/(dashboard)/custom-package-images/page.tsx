"use client"
import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Loader2, Image as ImageIconMultiple } from 'lucide-react'
import CustomPackageImageModal from './PackageImageModal';
import FeedbackModal from '../componanets/FeedbackModal';
import DashboardHeading from '../componanets/DashboardHeading';
import { apiFetch } from '@/app/[locale]/lib/api'
import { useConfirm } from '../componanets/ConfirmModalContext';

interface CustomPackageGroup {
	_id: string;
	images: string[];
	active: boolean;
}

const CustomPackageImageManagement = () => {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
	const { showConfirm } = useConfirm();
	const [groups, setGroups] = useState<CustomPackageGroup[]>([])
	const [loading, setLoading] = useState(true)
	const [modalOpen, setModalOpen] = useState(false)
	const [editingGroup, setEditingGroup] = useState<CustomPackageGroup | null>(null)
	const [deletingId, setDeletingId] = useState<string | null>(null)

	const [formData, setFormData] = useState<{ existingImages: string[], images: File[], active: boolean }>({
		existingImages: [],
		images: [],
		active: true
	})

	const [feedbackModal, setFeedbackModal] = useState({
		isOpen: false,
		type: 'success' as 'success' | 'error',
		message: ''
	});

	const fetchGroups = async () => {
		try {
			setLoading(true)
			const res = await apiFetch('/dashboard/custom-package-images')
			if (!res.ok) throw new Error('فشلت عملية جلب البيانات')
			const data = await res.json()
			setGroups(data)
		} catch (error) {
			console.error('Error fetching custom package image groups:', error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchGroups()
	}, [])

	const handleStatusToggle = async (id: string, currentStatus: boolean, group: CustomPackageGroup) => {
		try {
			// If we try to turn OFF an item that is CURRENTLY ON, make sure we aren't turning off the LAST one.
			// (Turning ON a different item will automatically be handled and allowed by the backend)
			if (currentStatus === true && groups.filter(g => g.active).length <= 1) {
				setFeedbackModal({ isOpen: true, type: 'error', message: 'يجب أن تكون هناك مجموعة واحدة على الأقل مفعلة. قم بتفعيل مجموعة أخرى بدلاً من تعطيل هذه.' });
				return;
			}

			const bodyData = new FormData();
			// We send the NEW status we want
			bodyData.append('active', (!currentStatus).toString());
			bodyData.append('existingImages', JSON.stringify(group.images));

			const res = await apiFetch(`/dashboard/custom-package-images/${id}`, {
				method: 'PUT',
				body: bodyData
			})

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || 'فشلت العملية');
			}
			fetchGroups();
		} catch (error: any) {
			console.error('Error toggling status:', error)
			setFeedbackModal({ isOpen: true, type: 'error', message: error.message || 'حدث خطأ أثناء تغيير الحالة' });
		}
	}

	const handleDelete = async (id: string, isActive: boolean, index: number) => {
		if (groups.length <= 1) {
			setFeedbackModal({ isOpen: true, type: 'error', message: 'لا يمكن حذف هذه المجموعة لأنها المجموعة الوحيدة المتبقية في النظام.' });
			return;
		}
		if (isActive) {
			setFeedbackModal({ isOpen: true, type: 'error', message: 'لا يمكن حذف المجموعة المفعلة حالياً. يرجى تفعيل مجموعة أخرى أولاً.' });
			return;
		}

		showConfirm({
			title: 'تأكيد الحذف',
			message: <>هل أنت متأكد من حذف المجموعة رقم <b className="text-foreground text-base px-1">{index + 1}</b> بكل ما فيها من صور؟</>,
			onConfirm: async () => {
				try {
					setDeletingId(id);
					const res = await apiFetch(`/dashboard/custom-package-images/${id}`, {
						method: 'DELETE'
					})
					if (!res.ok) {
						const errorData = await res.json();
						throw new Error(errorData.message || 'فشلت العملية');
					}
					fetchGroups();
					setFeedbackModal({ isOpen: true, type: 'success', message: 'تم حذف المجموعة بنجاح!' });
				} catch (error: any) {
					console.error('Error deleting group:', error)
					setFeedbackModal({ isOpen: true, type: 'error', message: error.message || 'حدث خطأ أثناء الحذف' });
				} finally {
					setDeletingId(null);
				}
			}
		});
	}

	const handleOpenModal = (group: CustomPackageGroup | null = null) => {
		if (group) {
			setEditingGroup(group)
			setFormData({
				existingImages: group.images || [],
				images: [], // new files to append
				active: group.active !== undefined ? group.active : true
			})
		} else {
			setEditingGroup(null)
			setFormData({
				existingImages: [],
				images: [],
				active: true
			})
		}
		setModalOpen(true)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const method = editingGroup ? 'PUT' : 'POST'
		const endpoint = editingGroup ? `/dashboard/custom-package-images/${editingGroup._id}` : '/dashboard/custom-package-images'

		try {
			const bodyData = new FormData();
			bodyData.append('active', formData.active.toString());

			if (editingGroup) {
				// During edit, send stringified array of kept original images 
				bodyData.append('existingImages', JSON.stringify(formData.existingImages));
			}

			// Append all new File selections to Form data 'images'
			if (formData.images && formData.images.length > 0) {
				for (let i = 0; i < formData.images.length; i++) {
					bodyData.append('images', formData.images[i]);
				}
			} else {
				// For new additions, we MUST have files. For edits, we can just retain `existingImages`
				if (!editingGroup && formData.existingImages.length === 0) {
					throw new Error('يجب اختيار صورة واحدة على الأقل');
				}
			}

			// Optional: Throw error if they try saving an empty group
			if (editingGroup && formData.images.length === 0 && formData.existingImages.length === 0) {
				throw new Error('لا يمكن أن تكون المجموعة فارغة من الصور. احذف المجموعة بدلاً من ذلك.');
			}

			const res = await apiFetch(endpoint, {
				method: method,
				body: bodyData,
				timeout: 60000 // 60 seconds timeout
			})

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || 'فشلت العملية');
			}

			setModalOpen(false);
			fetchGroups();
			setFeedbackModal({ isOpen: true, type: 'success', message: editingGroup ? 'تم تعديل مجموعة الصور بنجاح!' : 'تم إضافة مجموعة الصور بنجاح!' });
		} catch (error: any) {
			console.error('Error saving group:', error)
			setFeedbackModal({ isOpen: true, type: 'error', message: error.message || 'حدث خطأ أثناء الحفظ' });
		}
	}

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<DashboardHeading
				title="صور الباقة المخصصة"
				description="إدارة المجموعات المعروضة لصفحة الباقة المخصصة"
			>
				<button
					onClick={() => handleOpenModal()}
					className="cursor-pointer flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 font-bold"
				>
					<Plus size={20} />
					إضافة مجموعة صور
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
									<th className="px-6 py-5">الصور</th>
									<th className="px-6 py-5">عدد الصور</th>
									<th className="px-6 py-5 text-center">حالة العرض</th>
									<th className="px-6 py-5 text-center">الإجراءات</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/40">
								{groups.length > 0 ? groups.map((group, index) => (
									<tr key={group._id} className="hover:bg-primary/5 transition-colors group">
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div className="flex -space-x-3 -space-x-reverse relative group-hover:scale-105 transition-transform duration-300">
													{/* Preview up to 3 thumbnails of the group */}
													{group.images && group.images.slice(0, 3).map((img, i) => (
														<div key={i} className="w-14 h-14 rounded-full overflow-hidden border-2 border-background shadow-sm bg-gray-100 relative z-10">
															<img
																src={img.startsWith('/uploads') ? `${apiUrl}${img}` : img}
																alt="Thumb"
																className="w-full h-full object-cover"
															/>
														</div>
													))}
													{group.images && group.images.length > 3 && (
														<div className="w-14 h-14 rounded-full border-2 border-background bg-secondary/80 flex items-center justify-center text-xs font-bold relative z-0 backdrop-blur-sm">
															+{group.images.length - 3}
														</div>
													)}
												</div>
												<span className="font-bold text-foreground">مجموعة #{index + 1}</span>
											</div>
										</td>
										<td className="px-6 py-5">
											<div className="flex items-center gap-1 font-bold text-muted-foreground">
												<ImageIconMultiple size={16} />
												{group.images?.length || 0} صور
											</div>
										</td>
										<td className="px-6 py-5 text-center">
											<button
												onClick={() => handleStatusToggle(group._id, group.active, group)}
												className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black transition-all border ${group.active
													? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20'
													: 'bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20'
													}`}>
												<span className={`w-1.5 h-1.5 rounded-full ${group.active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
												{group.active ? 'نـشـط' : 'مـعـطـل'}
											</button>
										</td>
										<td className="px-6 py-5 text-center">
											<div className="flex items-center justify-center gap-2 transition-all duration-300">
												<button
													onClick={() => handleOpenModal(group)}
													className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
												>
													<Edit2 size={16} />
												</button>
												<button
													onClick={() => handleDelete(group._id, group.active, index)}
													disabled={deletingId === group._id}
													className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all shadow-sm ${deletingId === group._id
														? 'bg-muted text-muted-foreground cursor-not-allowed'
														: 'bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white'
														}`}
												>
													{deletingId === group._id ? (
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
												<ImageIconMultiple size={48} className="mb-4 text-muted-foreground" />
												<p className="font-bold">لا توجد مجموعات صور حالياً</p>
												<p className="text-xs">اضغط على زر الإضافة لرفع مجموعة جديدة تعبر عن صف كامل</p>
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
				<CustomPackageImageModal
					setModalOpen={setModalOpen}
					editingGroup={editingGroup}
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

export default CustomPackageImageManagement
