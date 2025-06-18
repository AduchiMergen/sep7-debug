const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}', // Default pattern
    // baseUrl: 'http://localhost:8080' // Default base URL for cy.visit()
  },
});
