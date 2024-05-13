function loginHiker() {
    cy.visit("http://localhost:3000/")
    cy.get("#login").click()
    cy.get("#username").clear().type("h@mail.com")
    cy.get("#password").clear().type("1234")
    cy.get("#loginSubmit").click()
    cy.url().should('include','/hiker')
}


function loginPM(){
    cy.visit("http://localhost:3000/")
    cy.get("#login").click()
    cy.get("#username").clear().type("pm@mail.com")
    cy.get("#password").clear().type("1234")
    cy.get("#loginSubmit").click()
    cy.url().should('include','/platformmanager')
}


const UTILS = {loginHiker, loginPM}
export default UTILS