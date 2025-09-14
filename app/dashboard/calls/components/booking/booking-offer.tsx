import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const BookingOffer = ({
	setShowBookingInterface,
	setBookingOffered,
}: {
	setShowBookingInterface: (show: boolean) => void;
	setBookingOffered: () => void;
}) => {
	return (
		<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
			<div className="flex items-start gap-3">
				<Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
				<div className="flex-1">
					<p className="text-sm font-medium text-blue-900 mb-1">
						Need additional support?
					</p>
					<p className="text-sm text-blue-700 mb-3">
						Our admissions advisor can schedule a personal call to help with
						your specific questions and guide you through your application.
					</p>
					<div className="flex gap-2">
						<Button
							size="sm"
							onClick={() => setShowBookingInterface(true)}
							className="bg-blue-600 hover:bg-blue-700"
						>
							<Calendar className="w-4 h-4 mr-2" />
							Book a Call
						</Button>
						<Button size="sm" variant="outline" onClick={setBookingOffered}>
							Maybe later
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BookingOffer;
