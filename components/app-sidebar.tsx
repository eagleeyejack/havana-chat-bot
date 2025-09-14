"use client";

import * as React from "react";
import {
	GalleryVerticalEnd,
	MessageCircle,
	Phone,
	Settings,
	SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	teams: [
		{
			name: "Acme Inc",
			logo: GalleryVerticalEnd,
			plan: "Enterprise",
		},
	],
	navMain: [
		{
			title: "Admin",
			url: "#",
			icon: SquareTerminal,
			isActive: true,
			items: [
				{
					title: "Dashboard",
					url: "/dashboard",
				},
			],
		},
		{
			title: "Chats",
			url: "/dashboard/chats",
			icon: MessageCircle,
			isActive: true,
			items: [
				{
					title: "Chats",
					url: "/dashboard/chats",
				},
			],
		},
		{
			title: "Calls",
			url: "/dashboard/calls",
			icon: Phone,
			isActive: true,
			items: [
				{
					title: "Calls",
					url: "/dashboard/calls",
				},
			],
		},
		{
			title: "Student Chat View",
			url: "/student",
			icon: Settings,
			isActive: true,
			items: [
				{
					title: "Student Chat View",
					url: "/student",
				},
			],
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={data.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
