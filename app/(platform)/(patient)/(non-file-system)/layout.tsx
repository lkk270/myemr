import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
// import { MainNavbar } from "@/components/headers/main-navbar";
import { Navbar } from "../_components/navbar";
import { Sidebar } from "../_components/sidebar";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
	const user = await currentUser();

	if (!user || user.unsafeMetadata.userType !== "patient") {
		return redirect("/");
	}

	return (
		<div className="h-full flex ">
			<Navbar />
			{/* <div className="fixed inset-y-0 flex-col hidden w-20 mt-16 sm:flex">
				<Sidebar />
			</div> */}
			<main className="pt-16 flex-1 h-full overflow-y-auto">
				{/* <SearchCommand /> */}
				{children}
			</main>
		</div>
	);
};

export default MainLayout;
