export type ItemspackageType = {
	id: any;
	title: string;
	description: string;
	points: string[];
	price: number;
	offer: number;
	image: string;
	subnameEn: string;
	number?: string | number;
	mostseller?: number;
	rate?: number;
}

export type packageCardType = {
	item: ItemspackageType;
	index: number;
	getGridClass?: (index: number) => string;
	ViewDetails: string;
	priority?: boolean;
	locale: string;
}

export type PackageDetailsType = {
	id: string;
	title: string;
	subnameEn: string;
	description: string;
	points: string[];
	price: number;
	offer: number;
	Defaultimage: string | null;
	images: string[];
	number?: string | number;
	mostseller?: number;
	rate?: number;
}