import React from 'react'

const FocusFrame = () => {
	return (
		<div className="absolute inset-4 sm:inset-6 pointer-events-none z-20 mix-blend-overlay">
    {/* Top Right */}
    <div className="absolute top-0 right-0 w-8 h-8 border-t-[1.5px] border-r-[1.5px] border-white/80" />
    {/* Bottom Left */}
    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[1.5px] border-l-[1.5px] border-white/80" />
    {/* Bottom Right */}
    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[1.5px] border-r-[1.5px] border-white/80" />
    
    {/* Center subtle crosshair */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 opacity-40">
       <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white -translate-y-1/2" />
       <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white -translate-x-1/2" />
    </div>
  </div>
	)
}

export default FocusFrame