import Link from 'next/link';
import React from 'react'

const MainPage = () => {
	return (
		<div className=''>
			<Link href={'/photographer'} >photographer</Link>
			<div className='h-[40vh] block'>Home Page</div>
		</div>
	)
}

export default MainPage;