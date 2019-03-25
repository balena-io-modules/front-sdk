"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var chai = require("chai");
var ChaiAsPromised = require("chai-as-promised");
var GithubApi = require("github");
require("mocha");
var index_1 = require("../lib/index");
var keeper_1 = require("./keeper");
chai.use(ChaiAsPromised);
chai.should();
describe('Topics', function () {
    var vaultKeeper = keeper_1.getKeeper();
    var keys = vaultKeeper.keys;
    var frontInst;
    var githubInst;
    before(function () {
        frontInst = new index_1.Front(keys.apiKey);
        githubInst = new GithubApi({
            Promise: Promise,
            headers: {
                Accept: 'application/vnd.github.loki-preview+json'
            },
            host: 'api.github.com',
            protocol: 'https',
            timeout: 5000
        });
    });
    it('should return an empty results list for an invalid topic', function () {
        return frontInst.topic.listConversations({ topic_id: 'top_xxxxx' }).then(function () {
            throw new Error('Received a result for an invalid topic');
        }).catch(index_1.FrontError, function (error) {
            error.name.should.eq('FrontError');
            error.status.should.eq(404);
        });
    });
    it('should list all of conversations associated with a topic', function () {
        return githubInst.issues.get({
            number: keys.testTopicIssue.issue,
            owner: keys.testTopicIssue.owner,
            repo: keys.testTopicIssue.repo,
        }).then(function (issue) {
            issue.data.body.should.exist;
            var bodyText = issue.data.body;
            var frontTopic = bodyText.match(/\[.*]\((.*)\)/m)[1];
            var topicId = frontTopic.slice(frontTopic.lastIndexOf('/') + 1);
            return frontInst.topic.listConversations({ topic_id: topicId });
        }).then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.have.keys('prev', 'next');
            response._links.should.exist;
            response._links.should.have.key('self');
            response._results.should.exist;
            response._results.length.should.eq(1);
            var conversation = response._results[0];
            conversation._links.should.exist;
            conversation._links.should.have.keys('self', 'related');
            conversation.id.should.eq(keys.testConversationId);
            conversation.subject.should.eq(keys.testMessageSubject);
            conversation.status.should.exist;
            conversation.recipient.should.exist;
            conversation.last_message.should.exist;
            conversation.last_message.id.should.exist;
            conversation.last_message.body.should.eq(keys.testMessageResponse);
            conversation.created_at.should.exist;
        });
    });
});

//# sourceMappingURL=topic.js.map
