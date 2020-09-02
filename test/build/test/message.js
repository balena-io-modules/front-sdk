"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var chai = require("chai");
var ChaiAsPromised = require("chai-as-promised");
require("mocha");
chai.use(ChaiAsPromised);
chai.should();
var testMessageSubject = "Front SDK Subject Test " + Date().toString();
var testMessageResponse = "Test Response " + Date().toString();
describe('Messages', function () {
    var recipient = 'testbot';
    var testText = "Please ignore";
    before(function () {
        this.globals.testMessageSubject = testMessageSubject;
        this.globals.testMessageResponse = testMessageResponse;
    });
    it('should send a test message, checking for a conversation reference', function () {
        return this.globals.front.message.send({
            body: testText,
            channel_id: this.globals.channel.id,
            subject: this.globals.testMessageSubject,
            to: [this.globals.author.email],
            options: {
                archive: false,
            }
        }).then(function (response) {
            response.should.exist;
        });
    });
    it('should receive a message in the test inbox, creating a new conversation', function () {
        var _this = this;
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
        }).then(function (response) {
            response.conversation_reference.should.exist;
            if (response.status) {
                response.status.should.eq('accepted');
            }
            _this.testMessageConvRef = response.conversation_reference;
            return Promise.delay(5000);
        });
    });
    it('should get previous message via the conversation reference', function () {
        var _this = this;
        if (!this.testMessageConvRef) {
            throw new Error('Cannot find test message conversation reference');
        }
        return this.globals.front.conversation.get({ conversation_id: "alt:ref:" + this.testMessageConvRef })
            .then(function (response) {
            response._links.should.exist;
            response._links.should.have.keys('self', 'related');
            response._links.related.should.have.keys('events', 'followers', 'messages', 'comments', 'inboxes');
            response.id.should.exist;
            response.subject.should.eq(_this.globals.testMessageSubject);
            response.status.should.eq('unassigned');
            response.recipient._links.should.exist;
            response.recipient.handle.should.equal(recipient);
            response.last_message.should.exist;
            _this.globals.testConversationId = response.id;
            _this.globals.testMessageId = response.last_message.id;
            return _this.globals.front.message.get({ message_id: response.last_message.id });
        }).then(function (response) {
            response._links.should.exist;
            response._links.should.have.keys('self', 'related');
            response._links.related.should.have.key('conversation');
            response.id.should.equal(_this.globals.testMessageId);
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
        return this.globals.front.message.reply({
            body: this.globals.testMessageResponse,
            conversation_id: this.globals.testConversationId,
            options: {
                archive: false,
            }
        }).then(function (response) {
            response.should.exist;
        });
    });
});
