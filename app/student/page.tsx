"use client";

import { UserSwitcher } from "./components/user-switcher";
import { MessageUI } from "@/components/messages/message-ui";

const StudentPage = () => {
	return (
		<div className="min-h-screen bg-gray-50">
			<UserSwitcher />

			<div className="py-8">
				<div className="container mx-auto px-4">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Havana College Admissions
						</h1>
						<p className="text-gray-600">
							Multi-user chat demo - Switch users to see different chat
							histories
						</p>
					</div>

					<div className="bg-white rounded-lg shadow-lg h-[600px] overflow-hidden">
						<MessageUI />
					</div>
				</div>
			</div>
		</div>
	);
};

export default StudentPage;
