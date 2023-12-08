import { Button } from "@/components/ui/button";

import { Logo } from "@/components/logo";

export const Footer = () => {
	return (
		<div className="flex items-center w-full p-2 sm:p-6 z-50">
			<Logo />
			<div className="ml-auto w-full justify-end flex items-center gap-x-1 text-muted-foreground">
				<Button variant="ghost" size="sm">
					Privacy
				</Button>
				<Button variant="ghost" size="sm">
					Terms
				</Button>
			</div>
		</div>
	);
};
