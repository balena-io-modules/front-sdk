// Needed due to chai's should.exist
/* tslint:disable: no-unused-expression */
import * as Promise from 'bluebird';
import * as chai from 'chai';
import * as ChaiAsPromised from 'chai-as-promised';
import 'mocha';
import { Conversation, ConversationReference, Front, Message,
	Status } from '../lib/index';
import { getKeeper } from './keeper';

chai.use(ChaiAsPromised);
chai.should();

describe('Messages', function () {
	const vaultKeeper = getKeeper();
	const keys = vaultKeeper.keys;
	const recipient = 'testbot';
	const testText = `Please ignore`;
	let frontInst: Front;

	before(function () {
		frontInst = new Front(keys.apiKey);
		keys.testMessageSubject = `Front SDK Subject Test ${Date().toString()}`;
		keys.testMessageResponse = `Test Response ${Date().toString()}`;
	});

	it('should send a test message, checking for a conversation reference', function () {
		if (!keys.testAuthorId) {
			throw new Error('Cannot send a message as author ID is missing');
		}
		return frontInst.message.send({
			body: testText,
			channel_id: keys.testChannel,
			subject: keys.testMessageSubject,
			to: [ keys.testAuthorId ],
		}).then(function (response: ConversationReference) {
			response.conversation_reference.should.exist;
			if (response.status) {
				response.status.should.eq('accepted');
			}
		});
	});

	it('should receive a message in the test inbox, creating a new conversation', function () {
		// We use the test channel to post a new message creating a new conversation,
		// posting to ourselves.
		return frontInst.message.receiveCustom({
			body: testText,
			channel_id: keys.testChannel,
			sender: {
				handle: recipient
			},
			subject: keys.testMessageSubject,
		}).then(function (response: ConversationReference) {
			// Store the conversation reference, we'll use it later.
			response.conversation_reference.should.exist;
			if (response.status) {
				response.status.should.eq('accepted');
			}

			keys.testMessageConvRef = response.conversation_reference;

			return Promise.delay(5000);
		});
	});

	it('should get previous message via the conversation reference', function () {
		if (!keys.testMessageConvRef) {
			throw new Error('Cannot find test message conversation reference');
		}

		return frontInst.conversation.get({ conversation_id: `alt:ref:${keys.testMessageConvRef}` })
		.then(function (response: Conversation) {
			// Find the last message (should be the one we sent).
			response._links.should.exist;
			response._links.should.have.keys('self', 'related');
			response._links.related.should.have.keys('events', 'followers', 'messages', 'comments', 'inboxes');
			response.id.should.exist;
			response.subject.should.eq(keys.testMessageSubject);
			response.status.should.eq('unassigned');
			response.recipient._links.should.exist;
			response.recipient.handle.should.equal(recipient);
			response.last_message.should.exist;
			keys.testConversationId = response.id;
			keys.testMessageId = response.last_message.id;

			// Retrieve the ID.
			return frontInst.message.get({ message_id: response.last_message.id });
		}).then(function (response: Message) {
			response._links.should.exist;
			response._links.should.have.keys('self', 'related');
			response._links.related.should.have.key('conversation');
			response.id.should.equal(keys.testMessageId);
			response.type.should.equal('custom');
			response.is_inbound.should.eq(true);
			response.created_at.should.exist;
			response.blurb.should.exist;
			response.body.should.exist;
			response.text.should.eq(testText);
			response.metadata.should.exist;
		});
	});

	it('should send a reply to the previous message via the conversation', function () {
		if (!keys.testConversationId) {
			throw new Error('Cannot find conversation ID');
		}
		if (!keys.testMessageResponse) {
			throw new Error('Cannot find conversation ID');
		}

		// Shouldn't receive an error.
		return frontInst.message.reply({
			body: keys.testMessageResponse,
			conversation_id: keys.testConversationId,
		}).then((response: Status) => {
			response.status.should.eq('accepted');
		});
	});
});
