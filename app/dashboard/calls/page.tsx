"use client";

import React from "react";

import { BookingsTable } from "@/app/dashboard/components/bookings-table";
import Container from "@/components/custom-ui/container";

/**
 * Admin calls dashboard page showing all booked calls
 */
const CallsPage = () => {
	return (
		<Container>
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">
					Scheduled Calls Dashboard
				</h1>
				<p className="text-gray-600">
					View and manage all scheduled student consultation calls. Each time
					slot can only be booked by one student.
				</p>
			</div>

			<BookingsTable />
		</Container>
	);
};

export default CallsPage;
