"use client";

import { Fragment } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronRight } from "lucide-react";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "../ui/breadcrumb";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

// Map of route segments to their display names
const routeLabels: Record<string, string> = {
	dashboard: "Dashboard",
	students: "Students",
	chats: "Chats",
	calls: "Calls",
	bookings: "Bookings",
};

function getBreadcrumbs(pathname: string) {
	const segments = pathname.split("/").filter(Boolean);
	const breadcrumbs = [];
	let path = "";

	for (let i = 0; i < segments.length; i++) {
		path += `/${segments[i]}`;
		const label = routeLabels[segments[i]] || segments[i];
		const isLast = i === segments.length - 1;

		breadcrumbs.push({
			href: path,
			label,
			isLast,
		});
	}

	return breadcrumbs;
}

const AutoBreadcrumb = () => {
	const pathname = usePathname();
	const breadcrumbs = getBreadcrumbs(pathname);

	return (
		<>
			{/* Desktop breadcrumbs */}
			<div className="hidden md:block">
				<Breadcrumb>
					<BreadcrumbList>
						{breadcrumbs.map((crumb, index) => (
							<Fragment key={crumb.href}>
								<BreadcrumbItem>
									{crumb.isLast ? (
										<BreadcrumbPage>{crumb.label}</BreadcrumbPage>
									) : (
										<BreadcrumbLink href={crumb.href} asChild>
											<Link href={crumb.href}>{crumb.label}</Link>
										</BreadcrumbLink>
									)}
								</BreadcrumbItem>
								{index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
							</Fragment>
						))}
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			{/* Mobile dropdown */}
			<div className="md:hidden">
				<DropdownMenu>
					<DropdownMenuTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
						<ChevronRight className="h-4 w-4" />
						<span>{breadcrumbs[breadcrumbs.length - 1]?.label}</span>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						{breadcrumbs.map((crumb) => (
							<DropdownMenuItem key={crumb.href} asChild>
								<Link href={crumb.href}>{crumb.label}</Link>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</>
	);
};

export default AutoBreadcrumb;
