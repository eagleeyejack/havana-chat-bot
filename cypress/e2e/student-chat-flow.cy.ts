/// <reference types="cypress" />

describe("Student Chat Flow E2E Tests", () => {
	beforeEach(() => {
		// Visit the student page
		cy.visit("/student");

		// Wait for the page to load and select a user
		cy.get('[data-testid="user-switcher-trigger"]').should("be.visible");

		// Select first available user for testing
		cy.selectUser("Carol Brown");

		// Create a new chat to ensure clean state
		cy.get('[data-testid="new-chat-button"]').click();

		// Wait for chat interface to be ready
		cy.get('[data-testid="message-input"]').should("be.visible");
	});

	describe("Scenario 1: AI answers about university prices", () => {
		it("should get AI response about university tuition fees", () => {
			// Send message asking about university prices
			const message =
				"What are the tuition fees for undergraduate programs at Havana College?";
			cy.sendMessage(message);

			// Verify student message appears
			cy.get('[data-testid="message-bubble"][data-role="student"]')
				.should("be.visible")
				.should("contain", message);

			// Wait for and verify AI response
			cy.waitForAIResponse();

			// Check that AI response contains relevant information about fees/prices
			cy.get('[data-testid="message-bubble"][data-role="bot"]')
				.should("be.visible")
				.invoke("text")
				.should("match", /(tuition|fee|cost|price|£|\$)/i);
		});

		it("should handle follow-up questions about scholarships", () => {
			// First question about fees
			cy.sendMessage("How much does it cost to study at Havana College?");
			cy.waitForAIResponse();

			// Count existing bot messages before scholarship question
			cy.get('[data-testid="message-bubble"][data-role="bot"]').then(
				($messages) => {
					const initialBotMessageCount = $messages.length;

					// Follow-up about scholarships
					cy.sendMessage("Are there any scholarships available?");
					cy.waitForAIResponse();

					// Verify we have a new AI response (more bot messages than before)
					cy.get('[data-testid="message-bubble"][data-role="bot"]').should(
						"have.length.greaterThan",
						initialBotMessageCount
					);

					// Get the newest bot message (the scholarship response)
					cy.get('[data-testid="message-bubble"][data-role="bot"]')
						.eq(initialBotMessageCount) // Get the message at the index that would be the new one
						.should("be.visible")
						.invoke("text")
						.should(
							"match",
							/(scholarship|financial aid|funding|grant|bursary|support)/i
						);
				}
			);
		});
	});

	describe("Scenario 2: Escalation to human and booking prompt", () => {
		it("should escalate when requesting human help and show booking offer", () => {
			// Send message that typically triggers escalation
			const escalationMessage =
				"I need to speak to someone about my specific situation. Can I talk to a human advisor?";
			cy.sendMessage(escalationMessage);

			// Wait for AI response
			cy.waitForAIResponse();

			// Send follow-up that should trigger escalation
			cy.sendMessage(
				"This is urgent, I need personal help with my application"
			);
			cy.waitForAIResponse();

			// Check if chat gets escalated (booking offer should appear)
			cy.checkChatEscalated();

			// Verify booking offer is displayed with correct content
			cy.get('[data-testid="booking-offer"]')
				.should("be.visible")
				.should("contain", "escalated")
				.should("contain", "schedule")
				.should("contain", "admissions advisor");

			// Verify booking offer has the required buttons
			cy.get('[data-testid="book-call-button"]')
				.should("be.visible")
				.should("contain", "Book a Call");

			cy.get('[data-testid="booking-dismiss-button"]')
				.should("be.visible")
				.should("contain", "Maybe later");
		});

		it("should handle different escalation triggers", () => {
			const escalationTriggers = [
				"I want to speak to a human",
				"Can I talk to an advisor?",
				"I need personal help",
				"This is complex, I need human assistance",
			];

			// Test one escalation trigger
			cy.sendMessage(escalationTriggers[0]);
			cy.waitForAIResponse();

			// Should eventually show booking offer (may need multiple messages)
			cy.sendMessage("I really need personal guidance on my application");
			cy.waitForAIResponse();

			// Check for escalation
			cy.get('[data-testid="booking-offer"]', { timeout: 15000 }).should(
				"be.visible"
			);
		});
	});

	describe("Scenario 3: Complete booking flow", () => {
		beforeEach(() => {
			// Trigger escalation first
			cy.sendMessage("I need to speak to a human advisor about my application");
			cy.waitForAIResponse();
			cy.sendMessage("This is urgent and complex, I need personal help");
			cy.waitForAIResponse();

			// Wait for booking offer to appear
			cy.get('[data-testid="booking-offer"]', { timeout: 15000 }).should(
				"be.visible"
			);
		});

		it("should complete the full booking process", () => {
			// Step 1: Click "Book a Call" button
			cy.get('[data-testid="book-call-button"]').click();

			// Step 2: Verify booking interface shows intro
			cy.get('[data-testid="booking-interface-container"]').should(
				"be.visible"
			);
			cy.get('[data-testid="booking-intro"]').should("be.visible");

			// Step 3: Proceed to form
			cy.get('[data-testid="book-call-yes"]').click();

			// Step 4: Fill out the form
			cy.get('[data-testid="booking-form"]').should("be.visible");

			cy.get('[data-testid="booking-name-input"]').type("John Test Student");

			cy.get('[data-testid="booking-email-input"]').type(
				"john.test@example.com"
			);

			// Step 5: Proceed to date selection
			cy.get('[data-testid="proceed-to-date-selection"]').click();

			// Step 6: Select a date
			cy.get('[data-testid="date-selection"]').should("be.visible");
			cy.get('[data-testid="date-option-0"]').click();

			// Step 7: Select a time slot
			cy.get('[data-testid="time-selection"]').should("be.visible");

			// Wait for time slots to load and select first available
			cy.get('[data-testid="available-time-slots"]', { timeout: 10000 }).should(
				"be.visible"
			);

			cy.get('[data-testid="time-slot-0"]', { timeout: 5000 })
				.should("be.visible")
				.click();

			// Step 8: Confirm booking
			cy.get('[data-testid="booking-confirmation"]').should("be.visible");

			// Verify booking details are shown
			cy.get('[data-testid="booking-confirmation"]')
				.should("contain", "John Test Student")
				.should("contain", "john.test@example.com");

			// Final confirmation
			cy.get('[data-testid="confirm-booking-final"]').click();

			// Step 9: Wait for booking to complete and status to update
			cy.waitForBookingComplete();

			// Verify we're still on the student page
			cy.url().should("include", "/student");
		});

		it("should allow user to dismiss booking offer", () => {
			// Click "Maybe later" button
			cy.get('[data-testid="booking-dismiss-button"]').click();

			// Verify booking offer is no longer visible
			cy.get('[data-testid="booking-offer"]').should("not.exist");

			// Verify chat interface is still functional
			cy.get('[data-testid="message-input"]').should("be.visible");
		});

		it("should allow navigation back through booking steps", () => {
			// Start booking process
			cy.get('[data-testid="book-call-button"]').click();
			cy.get('[data-testid="book-call-yes"]').click();

			// Fill form and proceed
			cy.get('[data-testid="booking-name-input"]').type("Test User");
			cy.get('[data-testid="booking-email-input"]').type("test@example.com");
			cy.get('[data-testid="proceed-to-date-selection"]').click();

			// Go back to form
			cy.get('[data-testid="back-to-intro"]').should("not.exist"); // Back to intro not available from date selection

			// Select date and go to time selection
			cy.get('[data-testid="date-option-0"]').click();

			// Go back to date selection
			cy.get("button").contains("Choose Different Date").click();
			cy.get('[data-testid="date-selection"]').should("be.visible");
		});
	});

	describe("Error handling and edge cases", () => {
		it("should handle empty messages gracefully", () => {
			// Try to send empty message
			cy.get('[data-testid="send-button"]').should("be.disabled");

			// Type spaces only
			cy.get('[data-testid="message-input"]').type("   ");
			cy.get('[data-testid="send-button"]').should("be.disabled");
		});

		it("should show proper loading states", () => {
			const message = "Tell me about your programs";

			// Verify button is initially enabled
			cy.get('[data-testid="send-button"]').should("be.disabled"); // Should be disabled with empty input

			// Type message - button should become enabled
			cy.get('[data-testid="message-input"]').type(message);
			cy.get('[data-testid="send-button"]').should("not.be.disabled");

			// Send message and immediately check if button becomes disabled during sending
			cy.get('[data-testid="send-button"]').click();

			// Wait for AI response to complete
			cy.waitForAIResponse();

			// After AI responds, button should be enabled again (with empty input it should be disabled)
			cy.get('[data-testid="message-input"]').should("have.value", ""); // Input should be cleared
			cy.get('[data-testid="send-button"]').should("be.disabled"); // Disabled because input is empty
		});

		it("should handle booking form validation", () => {
			// Trigger booking offer
			cy.sendMessage("I need human help");
			cy.waitForAIResponse();
			cy.sendMessage("Please escalate this");
			cy.waitForAIResponse();

			cy.get('[data-testid="booking-offer"]', { timeout: 15000 }).should(
				"be.visible"
			);
			cy.get('[data-testid="book-call-button"]').click();
			cy.get('[data-testid="book-call-yes"]').click();

			// Try to proceed without filling form
			cy.get('[data-testid="proceed-to-date-selection"]').should("be.disabled");

			// Fill only name
			cy.get('[data-testid="booking-name-input"]').type("Test Name");
			cy.get('[data-testid="proceed-to-date-selection"]').should("be.disabled");

			// Fill email as well
			cy.get('[data-testid="booking-email-input"]').type("test@example.com");
			cy.get('[data-testid="proceed-to-date-selection"]').should(
				"not.be.disabled"
			);
		});
	});
});
