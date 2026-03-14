import {MoveLeft, MoveRight } from 'lucide-react';

const LandingNavigation = () => {
	return (
		<>
			<div className="swiper-button-next !top-0 !right-0 !m-0 after:!hidden w-auto! !h-full p-2">
				<div>
					<MoveRight size={38} className='text-[#ffff]' />
				</div>
			</div>
			<div className="swiper-button-prev !top-0 !left-0 !m-0 after:!hidden w-auto! !h-full p-2">
				<div>
					<MoveLeft size={38} className='text-[#ffff]' />
				</div>
			</div>
		</>
	)
}

export default LandingNavigation