"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/app/shared/stores/user-store";

import { ChevronDown, Users } from "lucide-react";

import { User } from "@/lib/db/schema";
import { fetchUsers } from "@/lib/api/api.users";

export function UserSwitcher() {
	const { currentUser, setCurrentUser } = useUserStore();

	const { data: users = [], isLoading } = useQuery<User[]>({
		queryKey: ["users"],
		queryFn: () => fetchUsers(3),
	});

	if (isLoading) {
		return <div className="text-sm text-gray-500">Loading users...</div>;
	}

	return (
		<div className="flex items-center space-x-2 p-4 bg-gray-50 border-b">
			<Users className="h-4 w-4 text-gray-600" />
			<span className="text-sm font-medium text-gray-700">Current User:</span>

			<DropdownMenu>
				<DropdownMenuTrigger data-testid="user-switcher-trigger" asChild>
					<Button variant="outline" className="flex items-center space-x-2">
						{currentUser ? (
							<>
								<span>{currentUser.name}</span>
							</>
						) : (
							<span>Select User</span>
						)}
						<ChevronDown className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					data-testid="user-switcher-content"
					align="start"
					className="w-56"
				>
					{users.map((user) => (
						<DropdownMenuItem
							key={user.id}
							data-testid={`user-option-${user.name
								.toLowerCase()
								.replace(/\s+/g, "-")}`}
							onClick={() =>
								setCurrentUser({
									...user,
									createdAt: user.createdAt.toString(),
								})
							}
							className="flex items-center space-x-2 cursor-pointer"
						>
							<div>
								<div className="font-medium">{user.name}</div>
								<div className="text-sm text-gray-500">{user.email}</div>
							</div>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>

			{currentUser && (
				<div className="text-xs text-gray-500">
					({users.length} demo users available)
				</div>
			)}
		</div>
	);
}
