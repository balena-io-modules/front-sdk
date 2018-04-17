// Needed due to chai's should.exist
/* tslint:disable: no-unused-expression */
import * as chai from 'chai';
import * as ChaiAsPromised from 'chai-as-promised';
import 'mocha';
import { Contact, Front, FrontError } from '../lib/index';
import { getKeeper } from './keeper';

chai.use(ChaiAsPromised);
chai.should();

describe('Contacts', function () {
	const vaultKeeper = getKeeper();
	const keys = vaultKeeper.keys;
	let frontInst: Front;
	let contactId: string;

	before(function () {
		frontInst = new Front(keys.apiKey);
	});

	it('should create a contact', function() {
		return frontInst.contact.create({
			handles: [
				{
					handle: 'test@example.com',
					source: 'email'
				}
			]
		}).then(function (contact: Contact) {
			contactId = contact.id;
			contact.should.exist;
			contact.handles.length.should.be.gt(0);
		});
	});

	it('should update the contact above', function() {
		return frontInst.contact.update({
			contact_id: contactId,
			name: 'test example'
		});
	});

	it('should get the contact above', function() {
		return frontInst.contact.get({
			contact_id: contactId,
		}).then(function (contact: Contact) {
			contact.should.exist;
			contact.handles.length.should.be.gt(0);
			contact.name.should.eq('test example');
		});
	});

	it('should delete the contact above', function() {
		return frontInst.contact.delete({
			contact_id: contactId,
		});
	});

	it('should fail to find the contact deleted above', function() {
		return frontInst.contact.get({
			contact_id: contactId,
		}).catch(FrontError, (error: FrontError) => {
			error.name.should.eq('FrontError');
			error.status.should.eq(404);
		});
	});
});
