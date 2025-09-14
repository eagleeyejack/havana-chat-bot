"use client";

import { useRouter } from "next/navigation";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, MessageSquare } from "lucide-react";
import { useAdminChats } from "@/lib/hooks/use-admin-chats";
import ErrorCard from "@/components/custom-ui/error-card";
import { formatDate } from "@/lib/utils/formatDate";
import { truncateMessage } from "@/lib/utils/truncate";
import { getStatusBadge } from "@/lib/utils/getStatusBadge";

export function ChatTable() {
	const router = useRouter();
	const { data, isLoading: loading, error } = useAdminChats();

	const handleChatSelect = (chatId: string) => {
		router.push(`/dashboard/chats/${chatId}`);
	};

	// Handle error state
	if (error) {
		return (
			<ErrorCard
				title="Chats"
				error={
					error instanceof Error ? error.message : "Unknown error occurred"
				}
				onClick={() => window.location.reload()}
			/>
		);
	}

	if (loading || !data) {
		return (
			<div className="w-full">
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-12"></TableHead>
								<TableHead>Student</TableHead>
								<TableHead>Chat Title</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Messages</TableHead>
								<TableHead>Last Message</TableHead>
								<TableHead>Last Updated</TableHead>
								<TableHead className="w-20">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 10 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full space-y-4">
			{/* Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12"></TableHead>
							<TableHead>Student</TableHead>
							<TableHead>Chat Title</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-center">Messages</TableHead>
							<TableHead>Last Message</TableHead>
							<TableHead>Last Updated</TableHead>
							<TableHead className="w-20 text-center">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.chats.map((chat) => (
							<TableRow
								key={chat.id}
								className="hover:bg-gray-50 cursor-pointer"
								onClick={() => handleChatSelect(chat.id)}
							>
								<TableCell>
									<div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-medium text-sm">
										{chat.userAvatar}
									</div>
								</TableCell>
								<TableCell>
									<div className="font-medium">{chat.userName}</div>
								</TableCell>
								<TableCell>
									<div className="font-medium">{chat.title}</div>
								</TableCell>
								<TableCell>{getStatusBadge(chat.status)}</TableCell>
								<TableCell className="text-center">
									<div className="flex items-center justify-center gap-1">
										<MessageSquare className="h-3 w-3 text-gray-400" />
										<span className="text-sm font-medium">
											{chat.messageCount}
										</span>
									</div>
								</TableCell>
								<TableCell>
									<div className="max-w-xs">
										<div className="text-sm text-gray-900">
											{truncateMessage(chat.lastMessage)}
										</div>
									</div>
								</TableCell>
								<TableCell>
									<div className="text-sm text-gray-900">
										{formatDate(chat.lastMessageAt || chat.createdAt)}
									</div>
								</TableCell>
								<TableCell>
									<Button
										variant="ghost"
										size="sm"
										onClick={(e) => {
											e.stopPropagation();
											handleChatSelect(chat.id);
										}}
									>
										<Eye className="h-4 w-4" />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
