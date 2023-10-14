"use client";

import { Pill, Contact, Stethoscope, ScrollText, FolderClosed, Home, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

export const Sidebar = () => {
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
			href: "/settings",
			label: "Settings",
		},
	];

	return (
		<>
			<div className={cn("h-full bg-secondary overflow-y-auto relative flex w-24 flex-col")}>
				<div className="flex justify-center flex-1 p-3">
					<div className="space-y-2 pt-7">
						{routes.map((route, index) => (
							<div key={route.href}>
								<div
									onClick={() => onNavigate(route.href)}
									className={cn(
										"text-muted-foreground text-xs group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
										pathname === route.href && "bg-primary/10 text-primary",
									)}
								>
									<div className="flex flex-col items-center flex-1 gap-y-2">
										<route.icon className="w-5 h-5" />
										{route.label}
									</div>
								</div>
							</div>
						))}
						<div className="px-2 text-xs text-center text-primary/40">emridoc © 2023</div>
					</div>
				</div>
			</div>
		</>
	);
};
