/**
 * @copyright Copyright (c) 2019 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { randHash } from '../utils/'
const randUser = randHash()

describe('Open image.png in viewer', function() {
	before(function() {
		// Init user
		cy.nextcloudCreateUser(randUser, 'password')
		cy.login(randUser, 'password')

		// Upload test files
		cy.uploadFile('image.png', 'image/png')
		cy.visit('/apps/files')

		// wait a bit for things to be settled
		cy.wait(2000)
	})
	after(function() {
		cy.logout()
	})

	it('See image.png in the list', function() {
		cy.get('#fileList tr[data-file="image.png"]', { timeout: 10000 })
			.should('contain', 'image.png')
	})

	it('Open the viewer on file click', function() {
		cy.openFile('image.png')
		cy.get('#viewer-content').should('be.visible')
	})

	it('Does not see a loading animation', function() {
		cy.get('#viewer-content', { timeout: 4000 })
			.should('be.visible')
			.and('have.class', 'modal-mask')
			.and('not.have.class', 'icon-loading')
	})

	it('Is not in mobile fullscreen mode', function() {
		cy.get('#viewer-content .modal-wrapper').should('not.have.class', 'modal-wrapper--full')
	})

	it('See the share and menu icons and title on the viewer header', function() {
		cy.get('#viewer-content .modal-title').should('contain', 'image.png')
		cy.get('#viewer-content .modal-header a.icon-share-white-forced').should('be.visible')
		cy.get('#viewer-content .modal-header a.icon-close').should('be.visible')
	})

	it('Does not see navigation arrows', function() {
		cy.get('#viewer-content a.prev').should('not.be.visible')
		cy.get('#viewer-content a.next').should('not.be.visible')
	})

	it('Have the proper height and width values', function() {
		// not using should('have.css'), we want the inline styling
		cy.get('#viewer-content .modal-container img.active')
			.should('have.attr', 'style')
			// 70% max width with a FHD display (see cypress config)
			.should('match', new RegExp(`width: ${Math.round(1920 * 0.7)}px`, 'i'))
			// capped by the width, keeping ratio
			.should('match', new RegExp(`height: ${Math.round(1920 * 0.7 / 3000 * 2000)}px`, 'i'))
	})

	it('Does not have any visual regression', function() {
		cy.matchImageSnapshot()
	})
})
