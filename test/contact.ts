// Needed due to chai's should.exist
/* tslint:disable: no-unused-expression no-unused-expression-chai */
import * as chai from 'chai';
import ChaiAsPromised from 'chai-as-promised';
import 'mocha';
import { Contact, FrontError } from '../lib/index';

chai.use(ChaiAsPromised);
chai.should();

describe('Contacts', function () {
	let contactId: string;

	it('should create a contact', function () {
		return this.globals.front.contact
			.create({
				handles: [
					{
						handle: `test-${Date.now()}@example.com`,
						source: 'email',
					},
				],
			})
			.then(function (contact: Contact) {
				contactId = contact.id;
				contact.should.exist;
				contact.handles.length.should.be.gt(0);
			});
	});

	it('should update the contact above', function () {
		return this.globals.front.contact.update({
			contact_id: contactId,
			name: 'test example',
		});
	});

	it('should get the contact above', function () {
		return this.globals.front.contact
			.get({
				contact_id: contactId,
			})
			.then(function (contact: Contact) {
				contact.should.exist;
				contact.handles.length.should.be.gt(0);
				contact.name.should.eq('test example');
			});
	});

	it('should delete the contact above', function () {
		return this.globals.front.contact.delete({
			contact_id: contactId,
		});
	});

	it('should fail to find the contact deleted above', function () {
		return this.globals.front.contact
			.get({
				contact_id: contactId,
			})
			.catch(FrontError, (error: FrontError) => {
				error.name.should.eq('FrontError');
				error.status?.should.eq(404);
			});
	});
});
