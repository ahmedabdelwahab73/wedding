"use client"
import React, { useState, useEffect } from 'react'
import { Trash2, Eye, EyeOff, Star, Loader2, ImageIcon, MessageSquare } from 'lucide-react'
import { apiFetch } from '@/app/[locale]/lib/api'

interface Comment {
	_id: string;
	body: string;
	rate: number;
	publish: number;
	image?: string;
	createdAt: string;
}

const CommentsManagement = () => {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
	const [comments, setComments] = useState<Comment[]>([])
	const [loading, setLoading] = useState(true)
	const [deletingId, setDeletingId] = useState<string | null>(null)

	const fetchComments = async () => {
		try {
			setLoading(true)
			const res = await apiFetch('/dashboard/comments')
			if (!res.ok) throw new Error('Failed to fetch')
			const data = await res.json()
			setComments(data)
		} catch (error) {
			console.error('Error fetching comments:', error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchComments()
	}, [])

	const handleTogglePublish = async (id: string) => {
		try {
			const res = await apiFetch(`/dashboard/comments/${id}/publish`, {
				method: 'PATCH',
			})
			if (res.ok) fetchComments()
		} catch (error) {
			console.error('Error toggling status:', error)
		}
	}

	const handleDelete = async (id: string) => {
		if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return
		try {
			setDeletingId(id);
			const res = await apiFetch(`/dashboard/comments/${id}`, {
				method: 'DELETE',
			})
			if (res.ok) fetchComments()
		} catch (error) {
			console.error('Error deleting comment:', error)
		} finally {
			setDeletingId(null);
		}
	}

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-foreground">تعليقات المستخدمين</h1>
					<p className="text-muted-foreground text-sm">إدارة مراجعات العملاء والتحكم في ظهورها في الموقع</p>
				</div>
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
									<th className="px-6 py-5">الصورة</th>
									<th className="px-6 py-5">التعليق</th>
									<th className="px-6 py-5 text-center">التقييم</th>
									<th className="px-6 py-5 text-center">الحالة</th>
									<th className="px-6 py-5 text-center">الإجراءات</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/40">
								{comments.length > 0 ? comments.map((comment) => (
									<tr key={comment._id} className="hover:bg-primary/5 transition-colors">
										<td className="px-6 py-5">
											<div className="relative w-12 h-12 rounded-full overflow-hidden border border-border bg-muted/20 flex items-center justify-center">
												{comment.image ? (
													<img
														src={comment.image.startsWith('/uploads') ? `${apiUrl}${comment.image}` : comment.image}
														alt=""
														className="w-full h-full object-cover"
													/>
												) : (
													<ImageIcon size={20} className="text-muted-foreground/40" />
												)}
											</div>
										</td>
										<td className="px-6 py-5">
											<p className="text-sm font-medium text-foreground max-w-md line-clamp-2">{comment.body}</p>
											<span className="text-[10px] text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString('ar-EG')}</span>
										</td>
										<td className="px-6 py-5 text-center">
											<div className="flex items-center justify-center gap-1 text-amber-500">
												{Array.from({ length: 5 }).map((_, i) => (
													<Star
														key={i}
														size={12}
														fill={i < comment.rate ? "currentColor" : "none"}
														className={i < comment.rate ? "opacity-100" : "opacity-30"}
													/>
												))}
											</div>
										</td>
										<td className="px-6 py-5 text-center">
											<button
												onClick={() => handleTogglePublish(comment._id)}
												className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black transition-all border ${comment.publish === 1
													? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
													: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
													}`}>
												{comment.publish === 1 ? <Eye size={12} /> : <EyeOff size={12} />}
												{comment.publish === 1 ? 'منشور' : 'مسودة'}
											</button>
										</td>
										<td className="px-6 py-5 text-center">
											<button
												onClick={() => handleDelete(comment._id)}
												disabled={deletingId === comment._id}
												className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all shadow-sm mx-auto ${deletingId === comment._id
														? 'bg-muted text-muted-foreground cursor-not-allowed'
														: 'bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white'
													}`}
											>
												{deletingId === comment._id ? (
													<Loader2 size={16} className="animate-spin" />
												) : (
													<Trash2 size={16} />
												)}
											</button>
										</td>
									</tr>
								)) : (
									<tr>
										<td colSpan={5} className="py-20 text-center">
											<div className="flex flex-col items-center justify-center opacity-40">
												<MessageSquare size={48} className="mb-4 text-muted-foreground" />
												<p className="font-bold">لا توجد تعليقات حالياً</p>
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	)
}

export default CommentsManagement;
