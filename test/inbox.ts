// Needed due to chai's should.exist
/* tslint:disable: no-unused-expression */
import * as chai from 'chai';
import * as ChaiAsPromised from 'chai-as-promised';
import ChaiString = require('chai-string');
import * as _ from 'lodash';
import 'mocha';
import { Author, Channel, Front, Inbox, InboxChannels,
	InboxConversations, Inboxes, InboxTeammates } from '../lib/index';
import { getKeeper } from './keeper';

chai.use(ChaiAsPromised);
chai.use(ChaiString);
chai.should();

describe('Inboxes', function () {
	const apiUrl = 'https://api2.frontapp.com';
	const vaultKeeper = getKeeper();
	const keys = vaultKeeper.keys;
	let frontInst: Front;

	before(function () {
		frontInst = new Front(keys.apiKey);
	});

	it('should list all of the current inboxes and find a named one', function () {
		return frontInst.inbox.list().then(function (response: Inboxes) {
			response._pagination.should.exist;
			response._pagination.should.include.keys('next', 'prev');
			response._links.should.exist;
			response._links.self.should.startsWith(`${apiUrl}/inboxes`);
			response._results.length.should.be.gt(1);

			// Take first result, ensure it includes everything we know about
			const inbox: Inbox = response._results[0];
			inbox.should.include.keys('_links', 'id', 'address', 'send_as', 'name', 'type');

			// Find the right inbox for our test.Me too
			const foundInbox: Inbox | undefined = _.find(response._results, ['name', keys.testInbox]);
			if (!foundInbox) {
				throw new Error('Test inbox could not be found');
			}
			keys.testInboxId = foundInbox.id;
		});
	});

	it('should get known test inbox', function () {
		// Uses inbox ID from previous test.
		if (!keys.testInboxId) {
			throw new Error('Cannot find inbox ID');
		}
		return frontInst.inbox.get({ inbox_id: keys.testInboxId}).then(function (response: Inbox) {
			response._links.should.exist;
			response._links.should.include.keys('self', 'related');
			response._links.self.should.startsWith(`${apiUrl}/inboxes/${keys.testInboxId}`);
			response._links.related.should.include.keys('channels', 'conversations', 'teammates');
			response.id.should.equal(keys.testInboxId);
			response.name.should.equal(keys.testInbox);
			response.type.should.equal('custom');
			response.address.should.exist;
			response.send_as.should.exist;
		});
	});

	it('should list all channels for an inbox, and find integration test channel', function () {
		if (!keys.testInboxId) {
			throw new Error('Cannot find inbox ID');
		}
		return frontInst.inbox.listChannels({ inbox_id: keys.testInboxId }).then(function (response: InboxChannels) {
			response._pagination.should.exist;
			response._pagination.should.include.keys('next', 'prev');
			response._links.should.exist;
			response._links.self.should.startsWith(`${apiUrl}/inboxes/${keys.testInboxId}/channels`);
			response._results.should.exist;
			response._results.length.should.be.gt(1);
			const testChannel: Channel | undefined = _.find(response._results, ['id', keys.testChannel ]);
			if (!testChannel) {
				throw new Error('Channel for test inbox could not be found');
			}
			// TBD, ensure relevant keys exist on channel when Channel functionality added.
		});
	});

	it('should list all conversations in the test inbox, finding previously known ones', function () {
		if (!keys.testInboxId) {
			throw new Error('Cannot find inbox ID');
		}
		return frontInst.inbox.listConversations({ inbox_id: keys.testInboxId })
		.then(function (response: InboxConversations) {
			response._pagination.should.exist;
			response._pagination.should.include.keys('next', 'prev');
			response._links.should.exist;
			response._links.self.should.startsWith(`${apiUrl}/inboxes/${keys.testInboxId}/conversations`);
			response._results.should.exist;
			response._results.length.should.be.gt(1);
		});
	});

	it('should list all conversations in the test inbox using query string, finding previously known ones', function () {
		if (!keys.testInboxId) {
			throw new Error('Cannot find inbox ID');
		}
		return frontInst.inbox.listConversations({
			inbox_id: keys.testInboxId,
			q: 'q[statuses][]=unassigned&q[statuses][]=assigned'
		}).then(function (response: InboxConversations) {
			response._pagination.should.exist;
			response._pagination.should.include.keys('next', 'prev');
			response._links.should.exist;
			response._links.self.should.startWith(`${apiUrl}/inboxes/${keys.testInboxId}/conversations`);
			response._links.self.should.include('q[statuses][]=unassigned&q[statuses][]=assigned');
			response._results.should.exist;
			response._results.length.should.be.gt(1);
		});
	});

	it('should list all teammates for the test inbox', function () {
		if (!keys.testInboxId) {
			throw new Error('Cannot find inbox ID');
		}
		return frontInst.inbox.listTeammates({ inbox_id: keys.testInboxId}).then(function (response: InboxTeammates) {
			response._pagination.should.exist;
			response._pagination.should.include.keys('next', 'prev');
			response._links.should.exist;
			response._links.self.should.startWith(`${apiUrl}/inboxes/${keys.testInboxId}/teammates`);
			response._results.should.exist;
			response._results.length.should.be.gte(1);
			const testAuthor: Author | undefined = _.find(response._results, ['username', keys.testAuthor ]);
			if (!testAuthor) {
				throw new Error('Author for test inbox could not be found');
			}

			// Store the author key, we'll use it in other tests.
			keys.testAuthorId = testAuthor.id;
		});
	});
});
