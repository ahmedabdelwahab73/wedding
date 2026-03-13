import Link from 'next/link';

interface IProps {
	LinksData: { id: number, title: string, url: string }[];
	isScrolled: boolean;
	isBookingPage?: boolean;
	onCommentClick?: () => void;
}

const HeaderNav = ({ LinksData, isScrolled, isBookingPage, onCommentClick }: IProps) => {
	return (
		<nav className="w-[calc(50%-100px)] flex items-center justify-between max-mxmdd:hidden h-full">
			<ul className="flex items-center gap-10 h-full">
				{LinksData?.map((link) => (
					link.url ? (
						<li key={link?.id + link?.url} className="h-full">
							<Link
								className={`h-full uppercase text-[14px] flex items-center 
								duration-200 transition-colors 
								${(isBookingPage || isScrolled) ? "dark:text-black dark:hover:text-black/65 text-white hover:text-white/65" : "text-white hover:text-white/65"}`}
								href={link?.url} >{link?.title}
							</Link>
						</li>
					) : (
						<li key={link?.id + "button"} className="h-full">
							<button
								className={`h-full uppercase text-[14px] flex items-center 
								duration-200 transition-colors outline-none cursor-pointer
								${(isBookingPage || isScrolled) ? "dark:text-black dark:hover:text-black/65 text-white hover:text-white/65" : "text-white hover:text-white/65"}`}
								onClick={onCommentClick}
							>
								{link?.title}
							</button>
						</li>
					)
				))}
			</ul>
		</nav>
	)
}

export default HeaderNav