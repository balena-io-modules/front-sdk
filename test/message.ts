// Needed due to chai's should.exist
/* tslint:disable: no-unused-expression */
import * as Promise from 'bluebird';
import * as chai from 'chai';
import * as ChaiAsPromised from 'chai-as-promised';
import 'mocha';
import { Conversation, ConversationReference, Message, } from '../lib/index';

chai.use(ChaiAsPromised);
chai.should();

describe('Messages', function () {
	const recipient = 'testbot';
	const testText = `Please ignore`;
	const testMessageSubject = `Front SDK Subject Test ${Date().toString()}`;
	const testMessageResponse = `Test Response ${Date().toString()}`;
	
	before(function () {
		this.globals.testMessageSubject = testMessageSubject;
		this.globals.testMessageResponse = testMessageResponse;
	});

	it('should send a test message, checking for a conversation reference', function () {
		// Setting bigger timeout because it's a custom channel
		this.timeout(20000);

		return this.globals.front.message.send({
			body: testText,
			channel_id: this.globals.channel.id,
			subject: this.globals.testMessageSubject,
			to: [ this.globals.author.email ],
			options: {
				archive: false,
			}
		}).then(function (response: Message) {
			response.should.exist;
		});
	});

	it('should receive a message in the test inbox, creating a new conversation', function () {
		// Setting bigger timeout because it's a custom channel
		this.timeout(20000);
		
		// We use the test channel to post a new message creating a new conversation,
		// posting to ourselves.
		return this.globals.front.message.receiveCustom({
			body: testText,
			channel_id: this.globals.channel.id,
			sender: {
				handle: recipient
			},
			subject: this.globals.testMessageSubject,
			options: {
				archive: false,
			}
		}).then((response: ConversationReference) => {
			// Store the conversation reference, we'll use it later.
			response.conversation_reference.should.exist;
			if (response.status) {
				response.status.should.eq('accepted');
			}

			this.testMessageConvRef = response.conversation_reference;

			return Promise.delay(5000);
		});
	});

	it('should get previous message via the conversation reference', function () {
		if (!this.testMessageConvRef) {
			throw new Error('Cannot find test message conversation reference');
		}

		return this.globals.front.conversation.get({ conversation_id: `alt:ref:${this.testMessageConvRef}` })
		.then((response: Conversation) => {
			// Find the last message (should be the one we sent).
			response._links.should.exist;
			response._links.should.have.keys('self', 'related');
			response._links.related.should.have.keys('events', 'followers', 'messages', 'comments', 'inboxes');
			response.id.should.exist;
			response.subject.should.eq(this.globals.testMessageSubject);
			response.status.should.eq('unassigned');
			response.recipient._links.should.exist;
			response.recipient.handle.should.equal(recipient);
			response.last_message.should.exist;
			this.globals.testConversationId = response.id;
			this.globals.testMessageId = response.last_message.id;

			// Retrieve the ID.
			return this.globals.front.message.get({ message_id: response.last_message.id });
		}).then((response: Message) => {
			response._links.should.exist;
			response._links.should.have.keys('self', 'related');
			response._links.related.should.have.key('conversation');
			response.id.should.equal(this.globals.testMessageId);
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
		// Shouldn't receive an error.
		return this.globals.front.message.reply({
			body: this.globals.testMessageResponse,
			conversation_id: this.globals.testConversationId,
			options: {
				archive: false,
			}
		}).then((response: any) => {
			response.should.exist;
		});
	});
});
