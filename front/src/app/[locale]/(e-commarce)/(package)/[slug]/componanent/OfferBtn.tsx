import React from 'react'

const OfferBtn = ({ Text, Offer }: { Text: string, Offer: number }) => {
	const isHighOffer = Offer >= 1000;
	return (
		<div className={`absolute z-10 top-2 right-2 ${isHighOffer ? 'bg-red-500' : 'bg-gradient-primary'} text-white
				px-4.5 py-[3px] rounded-full shadow-lg flex flex-col items-center leading-tight`}>
			<span className='text-[10px] font-[800]'>{Text}</span>
			<span className='text-[10px] font-[800]'>{Offer}</span>
		</div>
	)
}

export default OfferBtn