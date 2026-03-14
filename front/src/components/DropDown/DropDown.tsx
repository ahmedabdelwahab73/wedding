import React from 'react'

const DropDown = ({ title, IconBtn, children }: { title: string, IconBtn: React.ReactNode, children: React.ReactNode }) => {
	return (
		<div className="relative group h-full flex items-center bg-red-100 cursor-pointer">
			<button className=" cursor-pointer h-full uppercase text-[14px] font-medium flex items-center gap-1 text-background duration-200 transition-colors group-hover:text-background/80">
				{title}
				{IconBtn}
			</button>
			<div className="absolute top-[65px] left-1/2 -translate-x-1/2 pt-4 opacity-0 
			pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto 
			transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
				<div className="absolute -top-4 left-0 w-full h-4 bg-transparent" />
				<div className="bg-background min-w-[220px] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)]
				 border border-border/40 overflow-hidden flex flex-col py-0">
					{children}
				</div>
			</div>
		</div>
	)
}

export default DropDown