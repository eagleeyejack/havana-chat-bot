CREATE TABLE `audit_llm` (
	`id` text PRIMARY KEY NOT NULL,
	`chatId` text NOT NULL,
	`messageId` text,
	`model` text,
	`prompt` text,
	`context` text,
	`response` text,
	`usage` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`chatId`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`chatId` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`timeISO` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`chatId`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chats` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`title` text,
	`tags` text,
	`adminTakenOver` integer DEFAULT false NOT NULL,
	`createdAt` integer NOT NULL,
	`lastMessageAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`chatId` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`createdAt` integer NOT NULL,
	`meta` text,
	FOREIGN KEY (`chatId`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE cascade
);
