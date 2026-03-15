import Link from 'next/link';
import ServicesDropDown from '../../e-commarce/mainHeader/Services';

interface IProps {
	LinksData: { id: number, title: string, url: string }[];
}

const HeaderNav = ({ LinksData }: IProps) => {
	return (
		<nav className="flex items-center justify-between h-full">
			<ul className="flex items-center gap-10 h-full">
				{LinksData?.map((link) => (
					<li key={link?.id + link?.url} className="h-full">
						<Link
							className={`h-full uppercase text-[14px] font-medium flex 
									items-center text-background
									duration-200 transition-colors 
									`}
							href={link?.url} >{link?.title}
						</Link>
					</li>
				))}
				<ServicesDropDown />
			</ul>
		</nav>
	)
}

export default HeaderNav