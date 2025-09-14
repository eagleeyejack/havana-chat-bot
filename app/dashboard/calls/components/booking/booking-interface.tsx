"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CalendarIcon, ClockIcon, UserIcon, MailIcon } from "lucide-react";
import { type BookingSlot } from "@/lib/api/api.bookings";
import { getAvailableWeekdays } from "@/lib/utils/dateGeneration";
import {
	useCreateBooking,
	useAvailableSlots,
} from "@/lib/db/hooks/useBookings";

interface BookingInterfaceProps {
	chatId: string;
	onBookingComplete: (booking: {
		id: string;
		name: string;
		email: string;
		scheduledTime: string;
	}) => void;
	onCancel: () => void;
}

export default function BookingInterface({
	chatId,
	onBookingComplete,
	onCancel,
}: BookingInterfaceProps) {
	const [step, setStep] = useState<
		"intro" | "form" | "slots" | "confirm" | "loading"
	>("intro");
	const [formData, setFormData] = useState({
		name: "",
		email: "",
	});
	const [selectedDate, setSelectedDate] = useState<string>("");
	const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
	const [error, setError] = useState<string | null>(null);

	const createBookingMutation = useCreateBooking();
	const availableDates = getAvailableWeekdays(5);

	const {
		data: slotsData,
		isLoading: slotsLoading,
		error: slotsError,
	} = useAvailableSlots(chatId, selectedDate, !!selectedDate);

	const handleDateSelect = (date: string) => {
		setSelectedDate(date);
		setSelectedSlot(null);
		setError(null);
		setStep("slots");
	};

	const handleSlotSelect = (slot: BookingSlot) => {
		setSelectedSlot(slot);
		setStep("confirm");
	};

	const handleConfirmBooking = () => {
		if (!selectedSlot || !formData.name || !formData.email) return;

		setStep("loading");
		setError(null);

		createBookingMutation.mutate(
			{
				chatId,
				name: formData.name.trim(),
				email: formData.email.trim(),
				timeISO: selectedSlot.timeISO,
			},
			{
				onSuccess: (result) => {
					onBookingComplete(result.booking);
				},
				onError: (err) => {
					setError(
						err instanceof Error ? err.message : "Failed to create booking"
					);
					setStep("confirm");
				},
			}
		);
	};

	if (step === "intro") {
		return (
			<Card
				data-testid="booking-intro"
				className="w-full mx-auto border-blue-200"
			>
				<CardHeader className="text-center">
					<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
						<CalendarIcon className="w-6 h-6 text-blue-600" />
					</div>
					<CardTitle className="text-blue-900">Book a Follow-up Call</CardTitle>
					<CardDescription>
						Would you like to schedule a 15-minute call with one of our
						admissions advisors?
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="bg-blue-50 p-3 rounded-md">
						<p className="text-sm text-blue-800">
							📞 <strong>What to expect:</strong>
							<br />
							• Personal guidance on your application
							<br />
							• Answers to specific questions
							<br />
							• Next steps in your journey
							<br />• Available Monday-Friday, 9:00-17:00 GMT
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							data-testid="book-call-yes"
							onClick={() => setStep("form")}
							className="flex-1"
						>
							Yes, book a call
						</Button>
						<Button
							data-testid="book-call-cancel"
							variant="outline"
							onClick={onCancel}
							className="flex-1"
						>
							Not now
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (step === "form") {
		return (
			<Card data-testid="booking-form" className="w-full  mx-auto">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UserIcon className="w-5 h-5" />
						Your Details
					</CardTitle>
					<CardDescription>
						We&apos;ll need these details to confirm your call
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<label htmlFor="name" className="block text-sm font-medium mb-1">
							Full Name
						</label>
						<Input
							id="name"
							data-testid="booking-name-input"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							placeholder="Enter your full name"
						/>
					</div>
					<div>
						<label htmlFor="email" className="block text-sm font-medium mb-1">
							Email Address
						</label>
						<Input
							id="email"
							data-testid="booking-email-input"
							type="email"
							value={formData.email}
							onChange={(e) =>
								setFormData({ ...formData, email: e.target.value })
							}
							placeholder="your.email@example.com"
						/>
					</div>
					<div className="flex gap-2 pt-2">
						<Button
							data-testid="proceed-to-date-selection"
							onClick={() => setStep("slots")}
							disabled={!formData.name.trim() || !formData.email.trim()}
							className="flex-1"
						>
							Choose Date & Time
						</Button>
						<Button
							data-testid="back-to-intro"
							variant="outline"
							onClick={() => setStep("intro")}
						>
							Back
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (step === "slots") {
		if (!selectedDate) {
			// Date selection
			return (
				<Card data-testid="date-selection" className="w-full  mx-auto">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CalendarIcon className="w-5 h-5" />
							Choose a Date
						</CardTitle>
						<CardDescription>Select a day for your call</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{availableDates.map((date, index) => (
							<Button
								key={index}
								data-testid={`date-option-${index}`}
								variant="outline"
								onClick={() =>
									handleDateSelect(date.toISOString().split("T")[0])
								}
								className="w-full justify-between"
							>
								<span>
									{date.toLocaleDateString("en-GB", {
										weekday: "long",
										month: "long",
										day: "numeric",
									})}
								</span>
							</Button>
						))}
						<Button
							variant="outline"
							onClick={() => setStep("form")}
							className="w-full"
						>
							← Back to Details
						</Button>
					</CardContent>
				</Card>
			);
		}

		// Time slot selection
		return (
			<Card data-testid="time-selection" className="w-full  mx-auto">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ClockIcon className="w-5 h-5" />
						Available Times
					</CardTitle>
					<CardDescription>
						{new Date(selectedDate).toLocaleDateString("en-GB", {
							weekday: "long",
							month: "long",
							day: "numeric",
						})}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{slotsLoading && (
						<div className="text-center py-4">Loading available times...</div>
					)}

					{slotsError && (
						<div className="text-center py-4 text-red-600">
							Failed to load available times. Please try another date.
						</div>
					)}

					{!slotsLoading &&
						!slotsError &&
						slotsData?.availableSlots.length === 0 && (
							<div className="text-center py-4 text-gray-600">
								No available slots for this date. Please choose another day.
							</div>
						)}

					{!slotsLoading &&
						!slotsError &&
						slotsData &&
						slotsData.availableSlots.length > 0 && (
							<div
								data-testid="available-time-slots"
								className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto"
							>
								{slotsData.availableSlots.map((slot, index) => (
									<Button
										key={index}
										data-testid={`time-slot-${index}`}
										variant="outline"
										onClick={() => handleSlotSelect(slot)}
										className="justify-center"
									>
										{slot.displayTime}
									</Button>
								))}
							</div>
						)}

					<Button
						variant="outline"
						onClick={() => {
							setSelectedDate("");
							setSelectedSlot(null);
						}}
						className="w-full"
					>
						← Choose Different Date
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (step === "confirm") {
		return (
			<Card data-testid="booking-confirmation" className="w-full  mx-auto">
				<CardHeader>
					<CardTitle>Confirm Your Booking</CardTitle>
					<CardDescription>Please review your call details</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{error && (
						<div className="bg-red-50 border border-red-200 rounded-md p-3">
							<p className="text-red-800 text-sm">{error}</p>
						</div>
					)}

					<div className="bg-gray-50 p-4 rounded-md space-y-2">
						<div className="flex items-center gap-2">
							<UserIcon className="w-4 h-4 text-gray-600" />
							<span className="font-medium">{formData.name}</span>
						</div>
						<div className="flex items-center gap-2">
							<MailIcon className="w-4 h-4 text-gray-600" />
							<span>{formData.email}</span>
						</div>
						<div className="flex items-center gap-2">
							<CalendarIcon className="w-4 h-4 text-gray-600" />
							<span>
								{selectedSlot?.displayDate} at {selectedSlot?.displayTime} GMT
							</span>
						</div>
						<div className="flex items-center gap-2">
							<ClockIcon className="w-4 h-4 text-gray-600" />
							<span>15 minutes</span>
						</div>
					</div>

					<div className="flex gap-2">
						<Button
							data-testid="confirm-booking-final"
							onClick={handleConfirmBooking}
							className="flex-1"
						>
							Confirm Booking
						</Button>
						<Button
							data-testid="back-to-time-selection"
							variant="outline"
							onClick={() => setStep("slots")}
						>
							Back
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (step === "loading") {
		return (
			<Card className="w-full  mx-auto">
				<CardContent className="text-center py-8">
					<div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
					<p className="text-gray-600">Creating your booking...</p>
				</CardContent>
			</Card>
		);
	}

	return null;
}
