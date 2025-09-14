import { Badge } from "@/components/ui/badge";

export const getStatusBadge = (status: string) => {
	switch (status) {
		case "escalated":
			return (
				<Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
					Escalated
				</Badge>
			);
		case "call_booked":
			return (
				<Badge className="bg-green-100 text-green-800 hover:bg-green-200">
					Call Booked
				</Badge>
			);
		case "closed":
			return (
				<Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
					Closed
				</Badge>
			);
		default:
			return (
				<Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
					Open
				</Badge>
			);
	}
};
