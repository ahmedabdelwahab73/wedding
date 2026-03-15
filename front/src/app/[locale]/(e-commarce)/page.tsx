import Container from '@/components/Container';
import React from 'react'
import Banner from '../../../components/e-commarce/banner/Banner';

const MainPage = () => {
	return (
		<>
			<Container>
				<div className="w-full">
					{/* <div className=''>
						<Link href={'/photographer'} >photographer</Link>
						<div className='h-[40vh] block'>Home Page</div>
					</div> */}
					<Banner />
				</div>
			</Container>
		</>
	)
}

export default MainPage;