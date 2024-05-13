import dayjs from "dayjs"
import UTILS from "./utils.cy"
describe('TESTS ABOUT WEATHER ALERTS', () => {
    const loginHiker = UTILS.loginHiker
    const loginPM = UTILS.loginPM
    

    

    it('T1: No Alerts',() => {
        loginHiker()
        cy.get("#start-SentieroperilROCCIAMELONE").click()
        cy.get("#confirmStart").click()
        cy.visit("http://localhost:3000/hiker/").reload()
        cy.get("#modalAlerts").should("not.exist")
    })

    it("T2: Failure on alert without position", () => {
        loginPM()
        cy.visit("http://localhost:3000/platformmanager/weatheralert")
        cy.get("#latitudeInput").clear({force: true})
        cy.get("#longitudeInput").clear({force: true})
        cy.get('#conditionInput').select(1)
        cy.get("#updateAlerts").click()
        cy.get("#error") 
    })

    it("T3: Failure on alert without radius", () => {
        loginPM()
        cy.visit("http://localhost:3000/platformmanager/weatheralert")
        cy.get("#latitudeInput").clear({force: true}).type('46.88604',{force: true})
        cy.get("#longitudeInput").clear({force: true}).type('8.847677',{force: true})
        cy.get('#conditionInput').select(1)
        cy.get("#updateAlerts").click()
        cy.get("#error") 
    })

    it("T4: Create alert", () => {
        
        loginPM()
        cy.visit("http://localhost:3000/platformmanager/weatheralert")
        cy.get("#latitudeInput").clear({force: true}).type('46.88604',{force: true})
        cy.get("#longitudeInput").clear({force: true}).type('8.847677',{force: true})
        cy.get("#radiusInput").clear({force: true}).type(500,{force: true})
        cy.get('#conditionInput').select(1)
        cy.get("#updateAlerts").click()
        cy.get("#success") 
    },
    )
    

    it("T5: An Alerts", () => {
        loginHiker()
        cy.get("#modalAlerts").should("exist")
    })

    it('[NOT A TEST] End hike', () => {

        loginHiker()
        cy.visit("http://localhost:3000/hiker/ongoinghike")
        cy.get("#closeAlerts").click()
        cy.get("#endHike").click()
        cy.get("#datetimePicker input").first().clear().type(dayjs().add(1,'h').format("MM/DD/YYYY hh:mm A"))
        cy.get("#confirmEnd").click()

    })

})