// Import commands.ts using ES2015 syntax:
import "./commands";
import "./database-commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests in Cypress command log for cleaner output
Cypress.on("window:before:load", (win) => {
	cy.stub(win.console, "log").as("consoleLog");
	cy.stub(win.console, "error").as("consoleError");
});

// Set up database before each test suite
beforeEach(() => {
	// Reset and seed database for consistent test state
	cy.resetDatabase();
	cy.seedTestData();
});
