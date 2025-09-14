import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
	// Polling intervals in milliseconds
	chatListPollingInterval: number;
	messagesPollingInterval: number;

	// UI settings
	autoScrollToBottom: boolean;

	// Admin settings
	aiAutoResponse: boolean;

	// Actions
	setChatListPollingInterval: (interval: number) => void;
	setMessagesPollingInterval: (interval: number) => void;
	setAutoScrollToBottom: (enabled: boolean) => void;
	setAiAutoResponse: (enabled: boolean) => void;
	resetToDefaults: () => void;
}

const DEFAULT_SETTINGS = {
	chatListPollingInterval: 30000, // 30 seconds
	messagesPollingInterval: 30000, // 30 seconds
	autoScrollToBottom: true,
	aiAutoResponse: true,
};

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			...DEFAULT_SETTINGS,

			setChatListPollingInterval: (interval) =>
				set({ chatListPollingInterval: interval }),

			setMessagesPollingInterval: (interval) =>
				set({ messagesPollingInterval: interval }),

			setAutoScrollToBottom: (enabled) => set({ autoScrollToBottom: enabled }),

			setAiAutoResponse: (enabled) => set({ aiAutoResponse: enabled }),

			resetToDefaults: () => set(DEFAULT_SETTINGS),
		}),
		{
			name: "havana-settings", // localStorage key
		}
	)
);

// Convenience hook to get just the polling intervals
export const usePollingIntervals = () => {
	const chatListPollingInterval = useSettingsStore(
		(state) => state.chatListPollingInterval
	);
	const messagesPollingInterval = useSettingsStore(
		(state) => state.messagesPollingInterval
	);

	return {
		chatListPollingInterval,
		messagesPollingInterval,
	};
};

// Predefined interval options
export const POLLING_INTERVALS = {
	REALTIME: 5000, // 5 seconds - minimum reasonable interval
	FAST: 15000, // 15 seconds
	NORMAL: 30000, // 30 seconds
	SLOW: 60000, // 1 minute
	VERY_SLOW: 300000, // 5 minutes
	DISABLED: 0, // No polling
};
