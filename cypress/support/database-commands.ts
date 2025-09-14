/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />

declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Reset database to clean state for testing
			 */
			resetDatabase(): Chainable<void>;
			/**
			 * Seed database with test data
			 */
			seedTestData(): Chainable<void>;
		}
	}
}

Cypress.Commands.add("resetDatabase", () => {
	// Reset database by calling the reset script
	cy.exec("yarn db:reset", { failOnNonZeroExit: false });
});

Cypress.Commands.add("seedTestData", () => {
	// Seed database with test data
	cy.exec("yarn db:seed", { failOnNonZeroExit: false });
});

export {};
