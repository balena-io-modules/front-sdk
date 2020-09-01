"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var ChaiAsPromised = require("chai-as-promised");
var _ = require("lodash");
require("mocha");
chai.use(ChaiAsPromised);
chai.should();
describe('Comments', function () {
    before(function () {
        this.testComment = "Test comment " + Date().toString() + " for @" + this.globals.author.username;
    });
    it('should create a new comment in the conversation', function () {
        var _this = this;
        if (!this.globals.testConversationId) {
            throw new Error('Cannot find conversation ID');
        }
        return this.globals.front.comment.create({
            author_id: this.globals.author.id,
            body: this.testComment,
            conversation_id: this.globals.testConversationId,
        }).then(function (response) {
            response._links.should.exist;
            response._links.should.have.keys('self', 'related');
            response.id.should.exist;
            response.posted_at.should.exist;
            response.body.should.eq(_this.testComment);
            response.author.should.exist;
            response.author._links.should.exist;
            response.author._links.should.have.keys('self', 'related');
            response.author.username.should.eq(_this.globals.author.username);
            _this.globals.testCommentId = response.id;
        });
    });
    it('should get the specific comment from the conversation', function () {
        var _this = this;
        if (!this.globals.testCommentId) {
            throw new Error('Cannot find comment ID');
        }
        return this.globals.front.comment.get({ comment_id: this.globals.testCommentId }).then(function (response) {
            response._links.should.exist;
            response._links.should.have.keys('self', 'related');
            response.id.should.exist;
            response.id.should.eq(_this.globals.testCommentId);
            response.body.should.eq(_this.testComment);
            response.posted_at.should.exist;
            response.author.should.exist;
            response.author.username.should.eq(_this.globals.author.username);
        });
    });
    it('should list the teammates mentioned in a comment', function () {
        var _this = this;
        if (!this.globals.testCommentId) {
            throw new Error('Cannot find comment ID');
        }
        return this.globals.front.comment.listMentions({ comment_id: this.globals.testCommentId })
            .then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.have.keys('prev', 'next');
            response._links.should.exist;
            response._links.should.have.keys('self');
            response._results.should.exist;
            response._results.length.should.be.gt(0);
            response._results.should.satisfy(function (results) {
                return _.find(results, ['id', _this.globals.author.id]);
            });
        });
    });
});
