import React from 'react'

type IProps = {
	SubName: string;
	locale: string;
	style?: string;
}
const Subname = ({ SubName, locale, style }: IProps) => {
	return (
		<>
			{locale !== 'ar' && SubName && (
				<span className={`${style ? style : "text-white text-xl font-bold"}`}>
					{SubName}
				</span>
			)}
		</>
	)
}

export default Subname