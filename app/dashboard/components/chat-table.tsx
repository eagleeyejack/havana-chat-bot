"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminChats } from "@/lib/db/hooks/useAdminChats";
import ErrorCard from "@/components/custom-ui/error-card";
import { formatDate } from "@/lib/utils/formatDate";
import { truncateMessage } from "@/lib/utils/truncate";
import { getStatusBadge } from "@/lib/utils/getStatusBadge";
import { usePollingIntervals } from "@/app/shared/stores/settings-store";

const ITEMS_PER_PAGE = 15;

export function ChatTable() {
	const { chatListPollingInterval } = usePollingIntervals();
	const router = useRouter();
	const [currentPage, setCurrentPage] = useState(1);

	const {
		data,
		isLoading: loading,
		error,
	} = useAdminChats({
		refetchInterval: chatListPollingInterval,
		status: undefined, // Fetch all chats regardless of status
		count: 100, // Increase count to see more chats
	});

	const handleChatSelect = (chatId: string) => {
		router.push(`/dashboard/chats/${chatId}`);
	};

	// Pagination calculations
	const paginatedData = useMemo(() => {
		if (!data?.chats) return { chats: [], totalPages: 0, totalItems: 0 };

		const totalItems = data.chats.length;
		const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		const chats = data.chats.slice(startIndex, endIndex);

		return { chats, totalPages, totalItems };
	}, [data?.chats, currentPage]);

	const handlePreviousPage = () => {
		setCurrentPage((prev) => Math.max(1, prev - 1));
	};

	const handleNextPage = () => {
		setCurrentPage((prev) => Math.min(paginatedData.totalPages, prev + 1));
	};

	// Reset to page 1 when data changes or if current page exceeds total pages
	useEffect(() => {
		if (
			paginatedData.totalPages > 0 &&
			currentPage > paginatedData.totalPages
		) {
			setCurrentPage(1);
		}
	}, [paginatedData.totalPages, currentPage]);

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
						{paginatedData.chats.map((chat) => (
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

			{/* Pagination Controls */}
			{paginatedData.totalPages > 1 && (
				<div className="flex items-center justify-between px-2 pb-4">
					<div className="flex items-center gap-2">
						<p className="text-sm text-gray-700">
							Showing{" "}
							<span className="font-medium">
								{Math.min(
									(currentPage - 1) * ITEMS_PER_PAGE + 1,
									paginatedData.totalItems
								)}
							</span>{" "}
							to{" "}
							<span className="font-medium">
								{Math.min(
									currentPage * ITEMS_PER_PAGE,
									paginatedData.totalItems
								)}
							</span>{" "}
							of <span className="font-medium">{paginatedData.totalItems}</span>{" "}
							chats
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handlePreviousPage}
							disabled={currentPage === 1}
						>
							<ChevronLeft className="h-4 w-4 mr-1" />
							Previous
						</Button>
						<span className="text-sm text-gray-700">
							Page {currentPage} of {paginatedData.totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={handleNextPage}
							disabled={currentPage === paginatedData.totalPages}
						>
							Next
							<ChevronRight className="h-4 w-4 ml-1" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
