"use client";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { MobileSidebar } from "./mobile-sidebar";
import {
	Pill,
	Contact,
	Stethoscope,
	ScrollText,
	FolderClosed,
	Home,
	Settings,
	ChevronsLeft,
	MenuIcon,
	LayoutGrid,
	Menu,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
// import { Notifications } from "@/components/notifications";

interface NavbarProps {}

export const Navbar = ({}: NavbarProps) => {
	const router = useRouter();
	const pathname = usePathname();

	const onNavigate = (url: string) => {
		return router.push(url);
	};

	const routes = [
		{
			icon: Home,
			href: "/patient-home",
			label: "Home",
		},
		{
			icon: FolderClosed,
			href: "/files",
			label: "Files",
		},
		{
			icon: Pill,
			href: "/medications",
			label: "Meds",
		},
		{
			icon: Contact,
			href: "/demographics",
			label: "About",
		},
		{
			icon: ScrollText,
			href: "/notes",
			label: "Notes",
		},
		{
			icon: Stethoscope,
			href: "/providers",
			label: "Providers",
		},
		{
			icon: Settings,
			href: "/patient-settings",
			label: "Settings",
		},
	];

	return (
		<div className="fixed z-50 flex items-center justify-between w-full h-16 px-4 py-2 border-b border-primary/10 bg-secondary">
			<div className="flex items-center">
				<MobileSidebar />
				<Logo />
			</div>
			<div className="items-center sm:flex hidden">
				<div className="flex items-center sm:flex gap-x-1 lg:gap-x-4">
					{routes.map((route, index) => (
						<div key={route.href}>
							<div
								onClick={() => onNavigate(route.href)}
								className={cn(
									"text-muted-foreground text-xs group flex p-2 lg:p-4 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
									pathname === route.href && "bg-primary/10 text-primary",
								)}
							>
								<div className="flex flex-col items-center flex-1 gap-x-1 lg:gap-x-2">
									<route.icon className="w-5 h-5" />
									{route.label}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
			<div className="flex items-center w-32">
				<div className="flex items-center sm:flex gap-x-4">
					{/* {typeof userValues.numOfUnreadNotifications === "number" && (
						<Notifications numOfUnreadNotificationsParam={userValues.numOfUnreadNotifications} />
					)} */}
					<ModeToggle />
					<UserButton afterSignOutUrl="/" />
				</div>
			</div>
		</div>
	);
};
