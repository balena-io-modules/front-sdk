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
describe('Comments', function () {
    var vaultKeeper = keeper_1.getKeeper();
    var keys = vaultKeeper.keys;
    var testComment = "Test comment " + Date().toString() + " for @" + keys.testAuthor;
    var frontInst;
    before(function () {
        frontInst = new index_1.Front(keys.apiKey);
    });
    it('should create a new comment in the conversation', function () {
        if (!keys.testConversationId) {
            throw new Error('Cannot find conversation ID');
        }
        if (!keys.testAuthorId) {
            throw new Error('Cannot find author ID');
        }
        return frontInst.comment.create({
            author_id: keys.testAuthorId,
            body: testComment,
            conversation_id: keys.testConversationId,
        }).then(function (response) {
            response._links.should.exist;
            response._links.should.have.keys('self', 'related');
            response.id.should.exist;
            response.posted_at.should.exist;
            response.body.should.eq(testComment);
            response.author.should.exist;
            response.author._links.should.exist;
            response.author._links.should.have.keys('self', 'related');
            response.author.username.should.eq(keys.testAuthor);
            keys.testCommentId = response.id;
        });
    });
    it('should get the specific comment from the conversation', function () {
        if (!keys.testCommentId) {
            throw new Error('Cannot find comment ID');
        }
        return frontInst.comment.get({ comment_id: keys.testCommentId }).then(function (response) {
            response._links.should.exist;
            response._links.should.have.keys('self', 'related');
            response.id.should.exist;
            response.id.should.eq(keys.testCommentId);
            response.body.should.eq(testComment);
            response.posted_at.should.exist;
            response.author.should.exist;
            response.author.username.should.eq(keys.testAuthor);
        });
    });
    it('should list the teammates mentioned in a comment', function () {
        if (!keys.testCommentId) {
            throw new Error('Cannot find comment ID');
        }
        return frontInst.comment.listMentions({ comment_id: keys.testCommentId })
            .then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.have.keys('prev', 'next');
            response._links.should.exist;
            response._links.should.have.keys('self');
            response._results.should.exist;
            response._results.length.should.be.gt(0);
            response._results.should.satisfy(function (results) {
                return _.find(results, ['id', keys.testAuthorId]);
            });
        });
    });
});

//# sourceMappingURL=comment.js.map
