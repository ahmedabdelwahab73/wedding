import React from 'react'
import BookingForm from './BookingForm'

interface Props {
	params: Promise<{ id: string }>
}

const Booking = async ({ params }: Props) => {
	const { id } = await params;

	return (
		<div className="min-h-screen pt-20 w-[50%] max-mmd:w-[70%] max-mxmd:w-[100%] mx-auto">
			<BookingForm packageId={id} />
		</div>
	)
}

export default Booking