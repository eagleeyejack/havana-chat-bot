"use client";

import { useState } from "react";
import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingInterface from "@/app/dashboard/calls/components/booking/booking-interface";

interface BookingOfferStudentProps {
	chatId: string;
	onBookingComplete?: (booking: {
		id: string;
		name: string;
		email: string;
		scheduledTime: string;
	}) => void;
	onDismiss?: () => void;
}

/**
 * Booking offer component for students in escalated chats
 * Shows when a chat has been escalated and offers booking a call
 */
export default function BookingOfferStudent({
	chatId,
	onBookingComplete,
	onDismiss,
}: BookingOfferStudentProps) {
	const [showBookingInterface, setShowBookingInterface] = useState(false);
	const [isDismissed, setIsDismissed] = useState(false);

	const handleBookingComplete = (booking: {
		id: string;
		name: string;
		email: string;
		scheduledTime: string;
	}) => {
		setShowBookingInterface(false);
		onBookingComplete?.(booking);
	};

	const handleDismiss = () => {
		setIsDismissed(true);
		onDismiss?.();
	};

	if (isDismissed) {
		return null;
	}

	if (showBookingInterface) {
		return (
			<div className="my-4">
				<BookingInterface
					chatId={chatId}
					onBookingComplete={handleBookingComplete}
					onCancel={() => setShowBookingInterface(false)}
				/>
			</div>
		);
	}

	return (
		<div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 relative">
			<button
				onClick={handleDismiss}
				className="absolute top-2 right-2 text-blue-400 hover:text-blue-600"
			>
				<X className="w-4 h-4" />
			</button>

			<div className="flex items-start gap-3 mr-8">
				<Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
				<div className="flex-1">
					<p className="text-sm font-medium text-blue-900 mb-1">
						💬 We&apos;ve escalated your query
					</p>
					<p className="text-sm text-blue-700 mb-3">
						It looks like you might benefit from speaking directly with one of
						our admissions advisors. Would you like to schedule a 15-minute
						call?
					</p>
					<div className="bg-blue-100 p-3 rounded-md mb-3">
						<p className="text-sm text-blue-800">
							📞 <strong>What you&apos;ll get:</strong>
							<br />
							• Personal guidance tailored to your situation
							<br />
							• Direct answers to your specific questions
							<br />
							• Next steps clearly outlined
							<br />• Available Monday-Friday, 9:00-17:00 GMT
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							size="sm"
							onClick={() => setShowBookingInterface(true)}
							className="bg-blue-600 hover:bg-blue-700 text-white"
						>
							<Calendar className="w-4 h-4 mr-2" />
							Book a Call
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={handleDismiss}
							className="border-blue-300 text-blue-700 hover:bg-blue-100"
						>
							Maybe later
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
