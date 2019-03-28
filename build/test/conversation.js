"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var ChaiAsPromised = require("chai-as-promised");
var _ = require("lodash");
require("mocha");
var index_1 = require("../lib/index");
var keeper_1 = require("./keeper");
chai.use(ChaiAsPromised);
chai.should();
describe('Conversations', function () {
    var vaultKeeper = keeper_1.getKeeper();
    var keys = vaultKeeper.keys;
    var frontInst;
    before(function () {
        frontInst = new index_1.Front(keys.apiKey);
    });
    it('should list all conversations', function () {
        return frontInst.conversation.list().then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.have.keys('prev', 'next');
            response._links.should.exist;
            response._links.should.have.key('self');
            response._results.should.exist;
            response._results.length.should.be.gt(0);
        });
    });
    it('should list all unassigned conversations with a 1 entry per page limit', function () {
        return frontInst.conversation.list({
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
        return frontInst.conversation.listRecent().then(function (response) {
            response._results.should.exist;
            response._results.length.should.be.gt(9);
        });
    });
    it('should get the conversation previously created in the Messages tests', function () {
        if (!keys.testConversationId) {
            throw new Error('Cannot find conversation ID');
        }
        return frontInst.conversation.get({ conversation_id: keys.testConversationId })
            .then(function (response) {
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
            .then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.have.keys('prev', 'next');
            response._links.should.exist;
            response._links.should.have.key('self');
            response._results.should.exist;
            response._results.length.should.be.gt(0);
            response._results.should.satisfy(function (results) {
                return _.find(results, ['id', keys.testCommentId]);
            });
        });
    });
    it('should list the inboxes in which the conversation appears', function () {
        if (!keys.testConversationId) {
            throw new Error('Cannot find conversation ID');
        }
        return frontInst.conversation.listInboxes({ conversation_id: keys.testConversationId })
            .then(function (response) {
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
    it('should list all the followers of a conversation', function () {
        if (!keys.testConversationId) {
            throw new Error('Cannot find conversation ID');
        }
        return frontInst.conversation.listFollowers({ conversation_id: keys.testConversationId })
            .then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.have.keys('prev', 'next');
            response._links.should.exist;
            response._links.should.have.key('self');
            response._results.should.exist;
            response._results.length.should.be.gte(1);
            response._results.should.satisfy(function (results) {
                return _.find(results, ['username', keys.testAuthor]);
            });
        });
    });
    it('should list all the messages in a conversation', function () {
        if (!keys.testConversationId) {
            throw new Error('Cannot find conversation ID');
        }
        return frontInst.conversation.listMessages({ conversation_id: keys.testConversationId })
            .then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.have.keys('prev', 'next');
            response._links.should.exist;
            response._links.should.have.key('self');
            response._results.should.exist;
            response._results.length.should.be.gt(1);
            response._results.should.satisfy(function (results) {
                return _.find(results, ['body', keys.testMessageResponse]);
            });
        });
    });
});

//# sourceMappingURL=conversation.js.map
