"use client";

import React from "react";
import { SettingsPanel } from "@/app/dashboard/components/settings-panel";
import { ChatTable } from "@/app/dashboard/components/chat-table";
import Container from "@/components/custom-ui/container";

/**
 * Admin dashboard page showing all active chats that need attention
 */
const ChatsPage = () => {
	return (
		<Container>
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">
					Active Chats Dashboard
				</h1>
				<p className="text-gray-600">
					Monitor and manage ongoing student conversations
				</p>
			</div>

			<div className="mb-6">
				<SettingsPanel />
			</div>

			<ChatTable />
		</Container>
	);
};

export default ChatsPage;
