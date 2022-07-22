// Needed due to chai's should.exist
/* tslint:disable: no-unused-expression */
import * as chai from 'chai';
import ChaiAsPromised from 'chai-as-promised';
import ChaiString = require('chai-string');
import * as _ from 'lodash';
import 'mocha';
import { Author, Inbox, InboxChannels,
	InboxConversations, Inboxes, InboxTeammates } from '../lib/index';

chai.use(ChaiAsPromised);
chai.use(ChaiString);
chai.should();

describe('Inboxes', function () {
	const apiUrl = 'https://api2.frontapp.com';

	it('should list all of the current inboxes and find a named one', function () {
		return this.globals.front.inbox.list().then(function (response: Inboxes) {
			response._pagination.should.exist;
			response._pagination.should.include.keys('next', 'prev');
			response._links.should.exist;
			response._links.self.should.startsWith(`${apiUrl}/inboxes`);

			// Take first result, ensure it includes everything we know about
			const inbox: Inbox = response._results[0];
			inbox.should.include.keys('_links', 'id', 'address', 'send_as', 'name', 'type');
		});
	});

	it('should get known test inbox', function () {
		return this.globals.front.inbox.get({
			inbox_id: this.globals.inbox.id
		}).then((response: Inbox) => {
			response._links.should.exist;
			response._links.should.include.keys('self', 'related');
			response._links.self.should.startsWith(`${apiUrl}/inboxes/${this.globals.inbox.id}`);
			response._links.related.should.include.keys('channels', 'conversations', 'teammates');
			response.id.should.equal(this.globals.inbox.id);
			response.name.should.equal(this.globals.inbox.name);
			response.address.should.exist;
			response.send_as.should.exist;
		});
	});

	it('should list all channels for an inbox, and find integration test channel', function () {
		return this.globals.front.inbox.listChannels({ inbox_id: this.globals.inbox.id }).then((response: InboxChannels) => {
			response._pagination.should.exist;
			response._pagination.should.include.keys('next', 'prev');
			response._links.should.exist;
			response._links.self.should.startsWith(`${apiUrl}/inboxes/${this.globals.inbox.id}/channels`);
			response._results.should.exist;
			response._results[0].id.should.be.equal(this.globals.channel.id);
		});
	});

	it('should list all conversations in the test inbox, finding previously known ones', function () {
		return this.globals.front.inbox.listConversations({ inbox_id: this.globals.inbox.id })
		.then((response: InboxConversations) => {
			response._pagination.should.exist;
			response._pagination.should.include.keys('next', 'prev');
			response._links.should.exist;
			response._links.self.should.startsWith(`${apiUrl}/inboxes/${this.globals.inbox.id}/conversations`);
			response._results.should.exist;
			response._results.length.should.be.gte(1);
		});
	});

	it('should list all conversations in the test inbox using query string, finding previously known ones', function () {
		return this.globals.front.inbox.listConversations({
			inbox_id: this.globals.inbox.id,
			q: 'q[statuses][]=unassigned&q[statuses][]=assigned'
		}).then((response: InboxConversations) => {
			response._pagination.should.exist;
			response._pagination.should.include.keys('next', 'prev');
			response._links.should.exist;
			response._links.self.should.startWith(`${apiUrl}/inboxes/${this.globals.inbox.id}/conversations`);
			response._links.self.should.include('q[statuses][]=unassigned&q[statuses][]=assigned');
			response._results.should.exist;
			response._results.length.should.be.gt(1);
		});
	});

	it('should list all teammates for the test inbox', function () {
		return this.globals.front.inbox.listTeammates({ inbox_id: this.globals.inbox.id }).then((response: InboxTeammates) => {
			response._pagination.should.exist;
			response._pagination.should.include.keys('next', 'prev');
			response._links.should.exist;
			response._links.self.should.startWith(`${apiUrl}/inboxes/${this.globals.inbox.id}/teammates`);
			response._results.should.exist;
			response._results.length.should.be.gte(1);

			const testAuthor: Author | undefined = _.find(response._results, [ 'username', this.globals.author.username ]);
			if (!testAuthor) {
				throw new Error('Author for test inbox could not be found');
			}
		});
	});
});
