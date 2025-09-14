import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
	id: string;
	name: string;
	email: string;
	createdAt: string;
};

interface UserState {
	currentUser: User | null;
	setCurrentUser: (user: User) => void;
	clearUser: () => void;
}

export const useUserStore = create<UserState>()(
	persist(
		(set) => ({
			currentUser: null,
			setCurrentUser: (user) => set({ currentUser: user }),
			clearUser: () => set({ currentUser: null }),
		}),
		{
			name: "havana-user-session", // localStorage key
		}
	)
);
