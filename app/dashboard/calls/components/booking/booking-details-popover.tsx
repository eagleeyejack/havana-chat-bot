"use client";

import { Calendar, Clock, User, Mail, Phone } from "lucide-react";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { useChatBooking } from "@/lib/db/hooks/useBookings";
import {
	formatBookingDate,
	formatBookingTime,
	getTimeUntil,
} from "@/lib/utils/formatDate";

interface BookingDetailsPopoverProps {
	children: React.ReactNode;
	chatId: string;
}

export default function BookingDetailsPopover({
	children,
	chatId,
}: BookingDetailsPopoverProps) {
	const { data: bookingData, isLoading, isError } = useChatBooking(chatId);

	if (isLoading) {
		return <>{children}</>;
	}

	if (isError || !bookingData?.booking) {
		return <>{children}</>;
	}

	const booking = bookingData.booking;
	const now = new Date();

	// Only show if booking is in the future
	if (new Date(booking.scheduledTime) <= now) {
		return <>{children}</>;
	}

	const scheduledDate = new Date(booking.scheduledTime);

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
							<span className="font-medium">
								{formatBookingDate(scheduledDate)}
							</span>
							<span className="text-gray-600">
								at {formatBookingTime(scheduledDate)} GMT
							</span>
						</div>

						<div className="flex items-center gap-2 text-xs">
							<Clock className="w-3 h-3 text-gray-500" />
							<span className="text-gray-600">
								{getTimeUntil(scheduledDate)}
							</span>
						</div>

						<div className="flex items-center gap-2 text-xs">
							<User className="w-3 h-3 text-gray-500" />
							<span className="text-gray-600">{booking.name}</span>
						</div>

						<div className="flex items-center gap-2 text-xs">
							<Mail className="w-3 h-3 text-gray-500" />
							<span className="text-gray-600">{booking.email}</span>
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
