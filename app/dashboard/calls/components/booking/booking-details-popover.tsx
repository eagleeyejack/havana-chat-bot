"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, Mail, Phone } from "lucide-react";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";

interface BookingDetail {
	id: string;
	name: string;
	email: string;
	scheduledTime: string;
	createdAt: string;
}

interface BookingDetailsPopoverProps {
	children: React.ReactNode;
	chatId: string;
}

export default function BookingDetailsPopover({
	children,
	chatId,
}: BookingDetailsPopoverProps) {
	const [bookingDetails, setBookingDetails] = useState<BookingDetail | null>(
		null
	);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchBookingDetails = async () => {
			try {
				const response = await fetch(`/api/chats/${chatId}/booking`);
				if (response.ok) {
					const data = await response.json();
					const now = new Date();
					const activeBooking = data.bookings?.find(
						(booking: BookingDetail) => new Date(booking.scheduledTime) > now
					);
					setBookingDetails(activeBooking || null);
				}
			} catch (error) {
				console.error("Error fetching booking details:", error);
				setBookingDetails(null);
			} finally {
				setLoading(false);
			}
		};

		if (chatId) {
			fetchBookingDetails();
		}
	}, [chatId]);

	if (loading) {
		return <>{children}</>;
	}

	if (!bookingDetails) {
		return <>{children}</>;
	}

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

	return (
		<Tooltip>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent
				side="bottom"
				className="bg-white border border-gray-200 shadow-lg text-gray-900 p-0 max-w-sm"
				sideOffset={8}
			>
				<div className="p-4">
					<div className="flex items-center gap-2 mb-3">
						<Phone className="w-4 h-4 text-blue-600" />
						<span className="font-semibold text-sm">Scheduled Call</span>
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-2 text-xs">
							<Calendar className="w-3 h-3 text-gray-500" />
							<span className="font-medium">{formatDate()}</span>
							<span className="text-gray-600">at {formatTime()} GMT</span>
						</div>

						<div className="flex items-center gap-2 text-xs">
							<Clock className="w-3 h-3 text-gray-500" />
							<span className="text-gray-600">{timeUntilCall()}</span>
						</div>

						<div className="flex items-center gap-2 text-xs">
							<User className="w-3 h-3 text-gray-500" />
							<span className="text-gray-600">{bookingDetails.name}</span>
						</div>

						<div className="flex items-center gap-2 text-xs">
							<Mail className="w-3 h-3 text-gray-500" />
							<span className="text-gray-600">{bookingDetails.email}</span>
						</div>
					</div>

					<div className="mt-3 pt-2 border-t border-gray-100">
						<p className="text-xs text-gray-500">
							15-minute call with admissions advisor
						</p>
					</div>
				</div>
			</TooltipContent>
		</Tooltip>
	);
}
