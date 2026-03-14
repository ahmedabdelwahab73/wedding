import Image from "next/image";

type IProps = {
	slideImage: string;
	priority?: boolean;
	apiUrl: string;
}
const LandingFrame = ({ slideImage, priority = false, apiUrl }: IProps) => {
	// Robust check for falsy, empty, literal quote strings, or invalid paths
	if (!slideImage || slideImage === '""' || slideImage.trim() === '' || slideImage === '/') return null;
	const imageUrl = slideImage.startsWith('http') ? slideImage : `${apiUrl}${slideImage}`;

	return (
		<div className="tst-cover-frame relative h-full">
			<Image
				src={imageUrl}
				alt="slider image"
				fill
				priority={priority}
				{...(priority ? { fetchPriority: "high" } : {})}
				quality={100}
				sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
				className="object-cover object-center"
			/>
		</div>
	)
}

export default LandingFrame