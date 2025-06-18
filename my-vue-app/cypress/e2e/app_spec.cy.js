describe('App E2E', () => {
  it('should load the home page and find a header', () => {
    cy.visit('http://localhost:8080'); // Adjust port if necessary
    cy.get('header').should('be.visible'); // Example: check for a header tag
  });
});
