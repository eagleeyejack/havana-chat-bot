"use client";

import { useState } from "react";
import {
	ChevronDown,
	Calendar,
	Clock,
	User,
	Mail,
	Phone,
	AlertTriangle,
	CheckCircle,
	Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Chat } from "@/lib/db/schema";
import { useChatBooking } from "@/lib/db/hooks/useBookings";

interface StudentStatusOverviewProps {
	chatId: string;
	chatStatus: Chat["status"];
}

export default function StudentStatusOverview({
	chatId,
	chatStatus,
}: StudentStatusOverviewProps) {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	// Use React Query to fetch booking data
	const { data: bookingData, isLoading } = useChatBooking(
		chatId,
		isDropdownOpen
	);

	// Determine the primary status to show
	const getPrimaryStatus = () => {
		if (chatStatus === "call_booked")
			return { label: "Call Booked", color: "blue", priority: 1 };
		if (chatStatus === "escalated")
			return { label: "Escalated", color: "orange", priority: 2 };
		if (chatStatus === "closed")
			return { label: "Closed", color: "gray", priority: 3 };
		return null;
	};

	const primaryStatus = getPrimaryStatus();

	// Get active booking details from React Query data
	const getActiveBooking = () => {
		if (!bookingData?.success || !bookingData.booking) return null;

		const now = new Date();
		const isActiveBooking = new Date(bookingData.booking.scheduledTime) > now;
		return isActiveBooking ? bookingData.booking : null;
	};

	const bookingDetails = getActiveBooking();

	// Format booking date/time
	const formatBookingInfo = () => {
		if (!bookingDetails) return null;

		const scheduledDate = new Date(bookingDetails.scheduledTime);
		const isToday = scheduledDate.toDateString() === new Date().toDateString();
		const isTomorrow =
			scheduledDate.toDateString() ===
			new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();

		const formatDate = () => {
			if (isToday) return "Today";
			if (isTomorrow) return "Tomorrow";
			return scheduledDate.toLocaleDateString("en-GB", {
				weekday: "long",
				month: "long",
				day: "numeric",
				year:
					scheduledDate.getFullYear() !== new Date().getFullYear()
						? "numeric"
						: undefined,
			});
		};

		const formatTime = () => {
			return scheduledDate.toLocaleTimeString("en-GB", {
				hour: "2-digit",
				minute: "2-digit",
			});
		};

		const timeUntilCall = () => {
			const now = new Date();
			const diffMs = scheduledDate.getTime() - now.getTime();
			const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

			if (diffDays === 0) return "Today";
			if (diffDays === 1) return "Tomorrow";
			if (diffDays <= 7) return `In ${diffDays} days`;
			return `In ${Math.ceil(diffDays / 7)} week${diffDays > 14 ? "s" : ""}`;
		};

		return { formatDate, formatTime, timeUntilCall };
	};

	const bookingInfo = formatBookingInfo();

	if (!primaryStatus) return null;

	const getStatusColors = () => {
		switch (primaryStatus.color) {
			case "blue":
				return {
					bg: "bg-blue-100",
					text: "text-blue-800",
					hover: "hover:bg-blue-200",
					dot: "bg-blue-500",
				};
			case "orange":
				return {
					bg: "bg-orange-100",
					text: "text-orange-800",
					hover: "hover:bg-orange-200",
					dot: "bg-orange-500",
				};
			case "gray":
				return {
					bg: "bg-gray-100",
					text: "text-gray-800",
					hover: "hover:bg-gray-200",
					dot: "bg-gray-500",
				};
			default:
				return {
					bg: "bg-gray-100",
					text: "text-gray-800",
					hover: "hover:bg-gray-200",
					dot: "bg-gray-500",
				};
		}
	};

	const colors = getStatusColors();

	return (
		<DropdownMenu
			onOpenChange={(open) => setIsDropdownOpen(open)}
			data-testid="status-dropdown"
		>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					data-testid="status-dropdown-trigger"
					className={`${colors.bg} ${colors.text} ${colors.hover} transition-colors border-0 px-3 py-1 h-auto rounded-full text-xs font-medium`}
				>
					<div className={`w-2 h-2 ${colors.dot} rounded-full mr-2`}></div>
					{primaryStatus.label}
					<ChevronDown className="w-3 h-3 ml-2" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>
				<div className="p-4">
					{/* Header */}
					<div className="flex items-center gap-2 mb-4">
						<div className={`w-3 h-3 ${colors.dot} rounded-full`}></div>
						<span className="font-semibold text-sm">Chat Status</span>
					</div>

					{/* Active Booking Details */}
					{bookingDetails && bookingInfo && (
						<div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
							<div className="flex items-center gap-2 mb-3">
								<Phone className="w-4 h-4 text-blue-600" />
								<span className="font-medium text-sm text-blue-900">
									Scheduled Call
								</span>
							</div>

							<div className="space-y-2">
								<div className="flex items-center gap-2 text-xs">
									<Calendar className="w-3 h-3 text-blue-600" />
									<span className="font-medium text-blue-800">
										{bookingInfo.formatDate()}
									</span>
									<span className="text-blue-700">
										at {bookingInfo.formatTime()} GMT
									</span>
								</div>

								<div className="flex items-center gap-2 text-xs">
									<Clock className="w-3 h-3 text-blue-600" />
									<span className="text-blue-700">
										{bookingInfo.timeUntilCall()}
									</span>
								</div>

								<div className="flex items-center gap-2 text-xs">
									<User className="w-3 h-3 text-blue-600" />
									<span className="text-blue-700">{bookingDetails.name}</span>
								</div>

								<div className="flex items-center gap-2 text-xs">
									<Mail className="w-3 h-3 text-blue-600" />
									<span className="text-blue-700">{bookingDetails.email}</span>
								</div>
							</div>

							<div className="mt-3 pt-2 border-t border-blue-200">
								<p className="text-xs text-blue-600">
									15-minute call with admissions advisor
								</p>
							</div>
						</div>
					)}

					{/* Loading State */}
					{isLoading && (
						<div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
							<div className="flex items-center gap-2 justify-center">
								<Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
							</div>
						</div>
					)}

					{/* Escalation Status */}
					{chatStatus === "escalated" && (
						<div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
							<div className="flex items-center gap-2 mb-2">
								<AlertTriangle className="w-4 h-4 text-orange-600" />
								<span className="font-medium text-sm text-orange-900">
									Escalated
								</span>
							</div>
							<p className="text-xs text-orange-700">
								This chat has been escalated to a human advisor for personalized
								assistance.
							</p>
						</div>
					)}

					{/* Closed Status */}
					{chatStatus === "closed" && (
						<div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
							<div className="flex items-center gap-2 mb-2">
								<CheckCircle className="w-4 h-4 text-gray-600" />
								<span className="font-medium text-sm text-gray-900">
									Closed
								</span>
							</div>
							<p className="text-xs text-gray-600">
								This chat has been marked as resolved and closed.
							</p>
						</div>
					)}

					{/* Footer */}
					<div className="text-xs text-gray-500 pt-3 border-t border-gray-100">
						Chat ID: {chatId.substring(0, 8)}...
					</div>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
