"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	useSettingsStore,
	POLLING_INTERVALS,
} from "@/app/shared/stores/settings-store";

interface SettingsPanelProps {
	className?: string;
}

/**
 * Settings panel for adjusting polling intervals and other admin settings
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({
	className = "",
}) => {
	const {
		chatListPollingInterval,
		messagesPollingInterval,
		setChatListPollingInterval,
		setMessagesPollingInterval,
		resetToDefaults,
	} = useSettingsStore();

	const formatInterval = (ms: number) => {
		if (ms === 0) return "Disabled";
		if (ms < 60000) return `${ms / 1000}s`;
		return `${ms / 60000}m`;
	};

	const getIntervalName = (ms: number) => {
		switch (ms) {
			case POLLING_INTERVALS.REALTIME:
				return "Real-time";
			case POLLING_INTERVALS.FAST:
				return "Fast";
			case POLLING_INTERVALS.NORMAL:
				return "Normal";
			case POLLING_INTERVALS.SLOW:
				return "Slow";
			case POLLING_INTERVALS.VERY_SLOW:
				return "Very Slow";
			case POLLING_INTERVALS.DISABLED:
				return "Disabled";
			default:
				return "Custom";
		}
	};

	const intervalOptions = [
		{
			value: POLLING_INTERVALS.REALTIME,
			label: "Real-time (5s)",
			color: "destructive",
		},
		{ value: POLLING_INTERVALS.FAST, label: "Fast (15s)", color: "secondary" },
		{
			value: POLLING_INTERVALS.NORMAL,
			label: "Normal (30s)",
			color: "default",
		},
		{ value: POLLING_INTERVALS.SLOW, label: "Slow (1m)", color: "outline" },
		{
			value: POLLING_INTERVALS.VERY_SLOW,
			label: "Very Slow (5m)",
			color: "outline",
		},
		{ value: POLLING_INTERVALS.DISABLED, label: "Disabled", color: "outline" },
	];

	return (
		<div className={`bg-white rounded-lg border p-6 ${className}`}>
			<div className="mb-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-2">
					Admin Settings
				</h2>
				<p className="text-sm text-gray-600">
					Configure polling intervals and other admin preferences
				</p>
			</div>

			{/* Chat List Polling */}
			<div className="mb-6">
				<div className="flex items-center justify-between mb-3">
					<label className="text-sm font-medium text-gray-700">
						Chat List Refresh Rate
					</label>
					<Badge variant="secondary">
						{getIntervalName(chatListPollingInterval)} -{" "}
						{formatInterval(chatListPollingInterval)}
					</Badge>
				</div>
				<div className="flex flex-wrap gap-2">
					{intervalOptions.map(({ value, label }) => (
						<Button
							key={value}
							size="sm"
							variant={
								chatListPollingInterval === value ? "default" : "outline"
							}
							onClick={() => setChatListPollingInterval(value)}
						>
							{label}
						</Button>
					))}
				</div>
			</div>

			{/* Messages Polling */}
			<div className="mb-6">
				<div className="flex items-center justify-between mb-3">
					<label className="text-sm font-medium text-gray-700">
						Messages Refresh Rate
					</label>
					<Badge variant="secondary">
						{getIntervalName(messagesPollingInterval)} -{" "}
						{formatInterval(messagesPollingInterval)}
					</Badge>
				</div>
				<div className="flex flex-wrap gap-2">
					{intervalOptions.map(({ value, label }) => (
						<Button
							key={value}
							size="sm"
							variant={
								messagesPollingInterval === value ? "default" : "outline"
							}
							onClick={() => setMessagesPollingInterval(value)}
						>
							{label}
						</Button>
					))}
				</div>
			</div>

			{/* Reset Button */}
			<div className="pt-4 border-t border-gray-200">
				<Button variant="outline" size="sm" onClick={resetToDefaults}>
					Reset to Defaults
				</Button>
			</div>
		</div>
	);
};
