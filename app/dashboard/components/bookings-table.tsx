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
import { Eye, Calendar, Clock, User } from "lucide-react";
import { useBookings } from "@/lib/db/hooks/useBookings";
import ErrorCard from "@/components/custom-ui/error-card";
import { formatDate } from "@/lib/utils/formatDate";

export function BookingsTable() {
	const router = useRouter();
	const {
		data: bookings = [],
		isLoading: loading,
		error,
	} = useBookings({ count: 100 });

	const handleChatSelect = (chatId: string) => {
		router.push(`/dashboard/chats/${chatId}`);
	};

	const formatScheduledTime = (timeISO: string) => {
		const date = new Date(timeISO);
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(today.getDate() + 1);

		const isToday = date.toDateString() === today.toDateString();
		const isTomorrow = date.toDateString() === tomorrow.toDateString();

		let dateStr = "";
		if (isToday) {
			dateStr = "Today";
		} else if (isTomorrow) {
			dateStr = "Tomorrow";
		} else {
			dateStr = date.toLocaleDateString("en-GB", {
				weekday: "short",
				month: "short",
				day: "numeric",
			});
		}

		const timeStr = date.toLocaleTimeString("en-GB", {
			hour: "2-digit",
			minute: "2-digit",
		});

		return `${dateStr} at ${timeStr}`;
	};

	const getTimeStatus = (timeISO: string) => {
		const scheduledTime = new Date(timeISO);
		const now = new Date();

		if (scheduledTime < now) {
			return { status: "completed", color: "text-gray-500" };
		} else {
			const hoursUntil =
				(scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60);
			if (hoursUntil <= 24) {
				return { status: "upcoming", color: "text-blue-600 font-medium" };
			} else {
				return { status: "scheduled", color: "text-green-600" };
			}
		}
	};

	// Handle error state
	if (error) {
		return (
			<ErrorCard
				title="Bookings"
				error={
					error instanceof Error ? error.message : "Unknown error occurred"
				}
				onClick={() => window.location.reload()}
			/>
		);
	}

	if (loading) {
		return (
			<div className="w-full">
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-12"></TableHead>
								<TableHead>Student Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Scheduled Time</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Booked On</TableHead>
								<TableHead className="w-20">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
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

	if (bookings.length === 0) {
		return (
			<div className="w-full">
				<div className="rounded-md border p-8">
					<div className="text-center">
						<Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							No bookings yet
						</h3>
						<p className="text-gray-500">
							Booked calls will appear here once students schedule them.
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Sort bookings by scheduled time (upcoming first)
	const sortedBookings = [...bookings].sort((a, b) => {
		return (
			new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
		);
	});

	return (
		<div className="w-full space-y-4">
			{/* Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12"></TableHead>
							<TableHead>Student Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Scheduled Time</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Booked On</TableHead>
							<TableHead className="w-20 text-center">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sortedBookings.map((booking) => {
							const timeStatus = getTimeStatus(booking.scheduledTime);
							return (
								<TableRow
									key={booking.id}
									className="hover:bg-gray-50 cursor-pointer"
									onClick={() => handleChatSelect(booking.chatId)}
								>
									<TableCell>
										<div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-medium text-sm">
											<User className="h-4 w-4" />
										</div>
									</TableCell>
									<TableCell>
										<div className="font-medium">{booking.name}</div>
									</TableCell>
									<TableCell>
										<div className="text-gray-600">{booking.email}</div>
									</TableCell>
									<TableCell>
										<div
											className={`flex items-center gap-2 ${timeStatus.color}`}
										>
											<Clock className="h-4 w-4" />
											<span className="text-sm">
												{formatScheduledTime(booking.scheduledTime)}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												timeStatus.status === "completed"
													? "bg-gray-100 text-gray-800"
													: timeStatus.status === "upcoming"
													? "bg-blue-100 text-blue-800"
													: "bg-green-100 text-green-800"
											}`}
										>
											{timeStatus.status === "completed"
												? "Completed"
												: timeStatus.status === "upcoming"
												? "Upcoming"
												: "Scheduled"}
										</span>
									</TableCell>
									<TableCell>
										<div className="text-sm text-gray-500">
											{formatDate(booking.createdAt)}
										</div>
									</TableCell>
									<TableCell>
										<Button
											variant="ghost"
											size="sm"
											onClick={(e) => {
												e.stopPropagation();
												handleChatSelect(booking.chatId);
											}}
										>
											<Eye className="h-4 w-4" />
										</Button>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
