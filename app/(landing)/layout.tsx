import { Navbar } from "./_components/navbar";

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="h-full dark:bg-[#1F1F1F] bg-[#f5f5f4]">
			<Navbar />
			<main className="h-full pt-40">{children}</main>
		</div>
	);
};

export default MarketingLayout;
