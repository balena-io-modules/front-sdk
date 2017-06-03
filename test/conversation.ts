// Needed due to chai's should.exist
/* tslint:disable: no-unused-expression */
import * as chai from 'chai';
import * as ChaiAsPromised from 'chai-as-promised';
import * as _ from 'lodash';
import 'mocha';
import { Author, Comment, Conversation, ConversationComments,
	ConversationFollowers, ConversationInboxes, ConversationMessages,
	Conversations, Front, Message } from '../lib/index';
import { getKeeper } from './keeper';

chai.use(ChaiAsPromised);
chai.should();

describe('Conversations', function () {
	const vaultKeeper = getKeeper();
	const keys = vaultKeeper.keys;
	let frontInst: Front;

	before(function () {
		frontInst = new Front(keys.apiKey);
	});

	it('should list all conversations', function () {
		return frontInst.conversation.list().then(function (response: Conversations) {
			response._pagination.should.exist;
			response._pagination.should.have.keys('prev', 'next', 'limit');
			response._links.should.exist;
			response._links.should.have.key('self');
			response._results.should.exist;
			response._results.length.should.be.gt(0);
		});
	});

	it('should list all unassigned conversations with a 1 entry per page limit', function () {
		return frontInst.conversation.list({
			limit: 1,
			page: 1,
			q: 'q[statuses]=unassigned',
		}).then(function (response: Conversations) {
			response._pagination.should.exist;
			response._pagination.should.have.keys('prev', 'next', 'limit');
			response._pagination.limit.should.eq(1);
			response._links.should.exist;
			response._links.should.have.key('self');
			response._results.should.exist;
			response._results.length.should.be.eq(1);
		});
	});

	it('should get the conversation previously created in the Messages tests', function () {
		if (!keys.testConversationId) {
			throw new Error('Cannot find conversation ID');
		}
		return frontInst.conversation.get({ conversation_id: keys.testConversationId })
		.then(function (response: Conversation) {
			response._links.should.exist;
			response._links.should.have.keys('self', 'related');
			response.id.should.eq(keys.testConversationId);
			response.subject.should.eq(keys.testMessageSubject);
			response.status.should.exist;
			response.recipient.should.exist;
			response.last_message.should.exist;
			response.last_message.id.should.exist;
			response.last_message.body.should.eq(keys.testMessageResponse);
			response.created_at.should.exist;
		});
	});

	it('should list all the comments in the conversation', function () {
		if (!keys.testConversationId) {
			throw new Error('Cannot find conversation ID');
		}
		return frontInst.conversation.listComments({ conversation_id: keys.testConversationId })
		.then(function (response: ConversationComments) {
			response._pagination.should.exist;
			response._pagination.should.have.keys('prev', 'next');
			response._links.should.exist;
			response._links.should.have.key('self');
			response._results.should.exist;
			response._results.length.should.be.gt(0);
			response._results.should.satisfy(function (results: Comment[]) {
				return _.find(results, ['id', keys.testCommentId]);
			});
		});
	});

	it('should list the inboxes in which the conversation appears', function () {
		if (!keys.testConversationId) {
			throw new Error('Cannot find conversation ID');
		}
		return frontInst.conversation.listInboxes({ conversation_id: keys.testConversationId })
		.then(function (response: ConversationInboxes) {
			response._pagination.should.exist;
			response._pagination.should.have.keys('prev', 'next');
			response._links.should.exist;
			response._links.should.have.key('self');
			response._results.should.exist;
			response._results.length.should.eq(1);
			response._results[0].id.should.eq(keys.testInboxId);
			response._results[0].name.should.eq(keys.testInbox);
		});
	});

	it('should list all the followers of a conversation', function() {
		if (!keys.testConversationId) {
			throw new Error('Cannot find conversation ID');
		}
		return frontInst.conversation.listFollowers({ conversation_id: keys.testConversationId })
		.then(function (response: ConversationFollowers) {
			response._pagination.should.exist;
			response._pagination.should.have.keys('prev', 'next');
			response._links.should.exist;
			response._links.should.have.key('self');
			response._results.should.exist;
			response._results.length.should.be.gte(1);
			response._results.should.satisfy(function (results: Author[]) {
				return _.find(results, ['username', keys.testAuthor]);
			});
		});
	});

	it('should list all the messages in a conversation', function () {
		if (!keys.testConversationId) {
			throw new Error('Cannot find conversation ID');
		}
		return frontInst.conversation.listMessages({ conversation_id: keys.testConversationId })
		.then(function (response: ConversationMessages) {
			response._pagination.should.exist;
			response._pagination.should.have.keys('prev', 'next', 'limit');
			response._links.should.exist;
			response._links.should.have.key('self');
			response._results.should.exist;
			response._results.length.should.be.gt(1);
			response._results.should.satisfy(function (results: Message[]) {
				return _.find(results, ['body', keys.testMessageResponse]);
			});
		});
	});
});
