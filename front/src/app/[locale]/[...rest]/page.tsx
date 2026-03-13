import Link from "next/link";

export default function CatchAllPage() {
	return (
		<div className="text-center mt-20">
			<h1 className="text-4xl font-bold">url Not Found</h1>
			<p>Page not found</p>
			<Link href={'/'}>Home</Link>
		</div>
	);
}
