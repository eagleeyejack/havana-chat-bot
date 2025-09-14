/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />

// Custom commands for the student chat E2E tests

declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Select a user for testing
			 */
			selectUser(userName: string): Chainable<void>;
			/**
			 * Send a message in the chat
			 */
			sendMessage(message: string): Chainable<void>;
			/**
			 * Wait for AI response
			 */
			waitForAIResponse(): Chainable<void>;
			/**
			 * Check if chat is escalated
			 */
			checkChatEscalated(): Chainable<void>;
			/**
			 * Wait for booking to complete and status to update
			 */
			waitForBookingComplete(): Chainable<void>;
		}
	}
}

Cypress.Commands.add("selectUser", (userName: string) => {
	cy.get('[data-testid="user-switcher-trigger"]').click();
	cy.get('[data-testid="user-switcher-content"]').within(() => {
		cy.contains(userName).click();
	});
});

Cypress.Commands.add("sendMessage", (message: string) => {
	cy.get('[data-testid="message-input"]').type(message);
	cy.get('[data-testid="send-button"]').click();
});

Cypress.Commands.add("waitForAIResponse", () => {
	// Wait for the loading state to disappear and new message to appear
	cy.get('[data-testid="message-bubble"][data-role="bot"]', {
		timeout: 15000,
	}).should("be.visible");
});

Cypress.Commands.add("checkChatEscalated", () => {
	cy.get('[data-testid="booking-offer"]', { timeout: 10000 }).should(
		"be.visible"
	);
});

Cypress.Commands.add("waitForBookingComplete", () => {
	// Wait for booking interface to disappear
	cy.get('[data-testid="booking-interface-container"]', {
		timeout: 15000,
	}).should("not.exist");

	// Wait for status to update to show call is booked in the status dropdown
	cy.get('[data-testid="status-dropdown-trigger"]', { timeout: 10000 })
		.should("be.visible")
		.should("contain", "Call Booked");
});

export {};
