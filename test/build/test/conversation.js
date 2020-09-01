"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var ChaiAsPromised = require("chai-as-promised");
var _ = require("lodash");
require("mocha");
chai.use(ChaiAsPromised);
chai.should();
describe('Conversations', function () {
    it('should list all conversations', function () {
        return this.globals.front.conversation.list().then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.have.keys('prev', 'next');
            response._links.should.exist;
            response._links.should.have.key('self');
            response._results.should.exist;
            response._results.length.should.be.gt(0);
        });
    });
    it('should list all unassigned conversations with a 1 entry per page limit', function () {
        return this.globals.front.conversation.list({
            limit: 1,
            q: 'q[statuses]=unassigned',
        }).then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.have.keys('prev', 'next');
            response._links.should.exist;
            response._links.should.have.key('self');
            response._results.should.exist;
            response._results.length.should.be.eq(1);
        });
    });
    it('should list a decent quantity of recent conversations', function () {
        return this.globals.front.conversation.listRecent().then(function (response) {
            response._results.should.exist;
            response._results.length.should.be.gt(9);
        });
    });
    it('should get the conversation previously created in the Messages tests', function () {
        var _this = this;
        if (!this.globals.testConversationId) {
            throw new Error('Cannot find conversation ID');
        }
        return this.globals.front.conversation.get({ conversation_id: this.globals.testConversationId })
            .then(function (response) {
            response._links.should.exist;
            response._links.should.have.keys('self', 'related');
            response.id.should.eq(_this.globals.testConversationId);
            response.subject.should.contain(_this.globals.testMessageSubject);
            response.status.should.exist;
            response.recipient.should.exist;
            response.last_message.should.exist;
            response.last_message.id.should.exist;
            response.last_message.body.should.eq(_this.globals.testMessageResponse);
            response.created_at.should.exist;
        });
    });
    it('should list all the comments in the conversation', function () {
        var _this = this;
        if (!this.globals.testConversationId) {
            throw new Error('Cannot find conversation ID');
        }
        return this.globals.front.conversation.listComments({ conversation_id: this.globals.testConversationId })
            .then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.have.keys('prev', 'next');
            response._links.should.exist;
            response._links.should.have.key('self');
            response._results.should.exist;
            response._results.length.should.be.gt(0);
            response._results.should.satisfy(function (results) {
                return _.find(results, ['id', _this.globals.testCommentId]);
            });
        });
    });
    it('should list the inboxes in which the conversation appears', function () {
        var _this = this;
        if (!this.globals.testConversationId) {
            throw new Error('Cannot find conversation ID');
        }
        return this.globals.front.conversation.listInboxes({ conversation_id: this.globals.testConversationId })
            .then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.have.keys('prev', 'next');
            response._links.should.exist;
            response._links.should.have.key('self');
            response._results.should.exist;
            response._results.length.should.eq(1);
            response._results[0].id.should.eq(_this.globals.inbox.id);
            response._results[0].name.should.eq(_this.globals.inbox.name);
        });
    });
    it('should list all the followers of a conversation', function () {
        var _this = this;
        if (!this.globals.testConversationId) {
            throw new Error('Cannot find conversation ID');
        }
        return this.globals.front.conversation.listFollowers({ conversation_id: this.globals.testConversationId })
            .then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.have.keys('prev', 'next');
            response._links.should.exist;
            response._links.should.have.key('self');
            response._results.should.exist;
            response._results.length.should.be.gte(1);
            response._results.should.satisfy(function (results) {
                return _.find(results, ['username', _this.globals.author.username]);
            });
        });
    });
    it('should list all the messages in a conversation', function () {
        var _this = this;
        if (!this.globals.testConversationId) {
            throw new Error('Cannot find conversation ID');
        }
        return this.globals.front.conversation.listMessages({ conversation_id: this.globals.testConversationId })
            .then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.have.keys('prev', 'next');
            response._links.should.exist;
            response._links.should.have.key('self');
            response._results.should.exist;
            response._results.length.should.be.gt(1);
            response._results.should.satisfy(function (results) {
                return _.find(results, ['body', _this.globals.testMessageResponse]);
            });
        });
    });
});
