/// <reference types="Cypress" />

context('Startpage', () => {
    beforeEach(() => {
        cy.visit('http://localhost:9000/#/')
    })

    describe('Validate links', () => {
        it('Social media links contain nevercodealone', () => {
            cy.get('[data-cy=social-link]')
                .find('a')
                .should($a => {
                    let hrefs = $a.map((i, el) => {
                        return Cypress.$(el).attr('href')
                    })

                    hrefs.each(($index, $href, $list) => {
                        expect($href).to.have.string('https')
                    })
                })
        })
    })
});
