// Needed due to chai's should.exist
/* tslint:disable: no-unused-expression no-unused-expression-chai */
import * as chai from 'chai';
import ChaiAsPromised from 'chai-as-promised';
import * as _ from 'lodash';
import 'mocha';
import {
	Author,
	Comment,
	Conversation,
	ConversationComments,
	ConversationFollowers,
	ConversationInboxes,
	ConversationMessages,
	Conversations,
	Message,
} from '../lib/index';

chai.use(ChaiAsPromised);
chai.should();

describe('Conversations', function () {
	it('should list all conversations', function () {
		return this.globals.front.conversation
			.list()
			.then(function (response: Conversations) {
				response._pagination.should.exist;
				response._pagination.should.have.keys('prev', 'next');
				response._links.should.exist;
				response._links.should.have.key('self');
				response._results.should.exist;
				response._results.length.should.be.gt(0);
			});
	});

	it('should list all unassigned conversations with a 1 entry per page limit', function () {
		return this.globals.front.conversation
			.list({
				limit: 1,
				q: 'q[statuses]=unassigned',
			})
			.then(function (response: Conversations) {
				response._pagination.should.exist;
				response._pagination.should.have.keys('prev', 'next');
				response._links.should.exist;
				response._links.should.have.key('self');
				response._results.should.exist;
				response._results.length.should.be.eq(1);
			});
	});

	// API docs, at the moment, list a default pagination of 50, but this test doesn't assume that is stringent.
	it('should list a decent quantity of recent conversations', function () {
		return this.globals.front.conversation
			.listRecent()
			.then(function (response: Conversations) {
				response._results.should.exist;
				response._results.length.should.be.gt(9);
			});
	});

	it('should get the conversation previously created in the Messages tests', function () {
		if (!this.globals.testConversationId) {
			throw new Error('Cannot find conversation ID');
		}
		return this.globals.front.conversation
			.get({ conversation_id: this.globals.testConversationId })
			.then((response: Conversation) => {
				response._links.should.exist;
				response._links.should.have.keys('self', 'related');
				response.id.should.eq(this.globals.testConversationId);
				response.subject.should.contain(this.globals.testMessageSubject);
				response.status.should.exist;
				response.recipient.should.exist;
				response.last_message.should.exist;
				response.last_message.id.should.exist;
				response.last_message.body.should.eq(this.globals.testMessageResponse);
				response.created_at.should.exist;
			});
	});

	it('should list all the comments in the conversation', function () {
		if (!this.globals.testConversationId) {
			throw new Error('Cannot find conversation ID');
		}
		return this.globals.front.conversation
			.listComments({ conversation_id: this.globals.testConversationId })
			.then((response: ConversationComments) => {
				response._pagination.should.exist;
				response._pagination.should.have.keys('prev', 'next');
				response._links.should.exist;
				response._links.should.have.key('self');
				response._results.should.exist;
				response._results.length.should.be.gt(0);
				response._results.should.satisfy((results: Comment[]) => {
					return _.find(results, ['id', this.globals.testCommentId]);
				});
			});
	});

	it('should list the inboxes in which the conversation appears', function () {
		if (!this.globals.testConversationId) {
			throw new Error('Cannot find conversation ID');
		}
		return this.globals.front.conversation
			.listInboxes({ conversation_id: this.globals.testConversationId })
			.then((response: ConversationInboxes) => {
				response._pagination.should.exist;
				response._pagination.should.have.keys('prev', 'next');
				response._links.should.exist;
				response._links.should.have.key('self');
				response._results.should.exist;
				response._results.length.should.eq(1);
				response._results[0].id.should.eq(this.globals.inbox.id);
				response._results[0].name.should.eq(this.globals.inbox.name);
			});
	});

	it('should list all the followers of a conversation', function () {
		if (!this.globals.testConversationId) {
			throw new Error('Cannot find conversation ID');
		}
		return this.globals.front.conversation
			.listFollowers({ conversation_id: this.globals.testConversationId })
			.then((response: ConversationFollowers) => {
				response._pagination.should.exist;
				response._pagination.should.have.keys('prev', 'next');
				response._links.should.exist;
				response._links.should.have.key('self');
				response._results.should.exist;
				response._results.length.should.be.gte(1);
				response._results.should.satisfy((results: Author[]) => {
					return _.find(results, ['username', this.globals.author.username]);
				});
			});
	});

	it('should list all the messages in a conversation', function () {
		if (!this.globals.testConversationId) {
			throw new Error('Cannot find conversation ID');
		}
		return this.globals.front.conversation
			.listMessages({ conversation_id: this.globals.testConversationId })
			.then((response: ConversationMessages) => {
				response._pagination.should.exist;
				response._pagination.should.have.keys('prev', 'next');
				response._links.should.exist;
				response._links.should.have.key('self');
				response._results.should.exist;
				response._results.length.should.be.gt(1);
				response._results.should.satisfy((results: Message[]) => {
					return _.find(results, ['body', this.globals.testMessageResponse]);
				});
			});
	});
});
