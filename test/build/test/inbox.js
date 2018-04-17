"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var ChaiAsPromised = require("chai-as-promised");
var ChaiString = require("chai-string");
var _ = require("lodash");
require("mocha");
var index_1 = require("../lib/index");
var keeper_1 = require("./keeper");
chai.use(ChaiAsPromised);
chai.use(ChaiString);
chai.should();
describe('Inboxes', function () {
    var apiUrl = 'https://api2.frontapp.com';
    var vaultKeeper = keeper_1.getKeeper();
    var keys = vaultKeeper.keys;
    var frontInst;
    before(function () {
        frontInst = new index_1.Front(keys.apiKey);
    });
    it('should list all of the current inboxes and find a named one', function () {
        return frontInst.inbox.list().then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.include.keys('next', 'prev');
            response._links.should.exist;
            response._links.self.should.startsWith(apiUrl + "/inboxes");
            response._results.length.should.be.gt(1);
            var inbox = response._results[0];
            inbox.should.include.keys('_links', 'id', 'address', 'send_as', 'name', 'type');
            var foundInbox = _.find(response._results, ['name', keys.testInbox]);
            if (!foundInbox) {
                throw new Error('Test inbox could not be found');
            }
            keys.testInboxId = foundInbox.id;
        });
    });
    it('should get known test inbox', function () {
        if (!keys.testInboxId) {
            throw new Error('Cannot find inbox ID');
        }
        return frontInst.inbox.get({ inbox_id: keys.testInboxId }).then(function (response) {
            response._links.should.exist;
            response._links.should.include.keys('self', 'related');
            response._links.self.should.startsWith(apiUrl + "/inboxes/" + keys.testInboxId);
            response._links.related.should.include.keys('channels', 'conversations', 'teammates');
            response.id.should.equal(keys.testInboxId);
            response.name.should.equal(keys.testInbox);
            response.type.should.equal('custom');
            response.address.should.exist;
            response.send_as.should.exist;
        });
    });
    it('should list all channels for an inbox, and find integration test channel', function () {
        if (!keys.testInboxId) {
            throw new Error('Cannot find inbox ID');
        }
        return frontInst.inbox.listChannels({ inbox_id: keys.testInboxId }).then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.include.keys('next', 'prev');
            response._links.should.exist;
            response._links.self.should.startsWith(apiUrl + "/inboxes/" + keys.testInboxId + "/channels");
            response._results.should.exist;
            response._results.length.should.be.gt(1);
            var testChannel = _.find(response._results, ['id', keys.testChannel]);
            if (!testChannel) {
                throw new Error('Channel for test inbox could not be found');
            }
        });
    });
    it('should list all conversations in the test inbox, finding previously known ones', function () {
        if (!keys.testInboxId) {
            throw new Error('Cannot find inbox ID');
        }
        return frontInst.inbox.listConversations({ inbox_id: keys.testInboxId })
            .then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.include.keys('next', 'prev');
            response._links.should.exist;
            response._links.self.should.startsWith(apiUrl + "/inboxes/" + keys.testInboxId + "/conversations");
            response._results.should.exist;
            response._results.length.should.be.gt(1);
        });
    });
    it('should list all conversations in the test inbox using query string, finding previously known ones', function () {
        if (!keys.testInboxId) {
            throw new Error('Cannot find inbox ID');
        }
        return frontInst.inbox.listConversations({
            inbox_id: keys.testInboxId,
            page: 1,
            q: 'q[statuses][]=unassigned&q[statuses][]=assigned'
        }).then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.include.keys('next', 'prev');
            response._links.should.exist;
            response._links.self.should.startWith(apiUrl + "/inboxes/" + keys.testInboxId + "/conversations");
            response._links.self.should.include('q[statuses][]=unassigned&q[statuses][]=assigned');
            response._results.should.exist;
            response._results.length.should.be.gt(1);
        });
    });
    it('should list all teammates for the test inbox', function () {
        if (!keys.testInboxId) {
            throw new Error('Cannot find inbox ID');
        }
        return frontInst.inbox.listTeammates({ inbox_id: keys.testInboxId }).then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.include.keys('next', 'prev');
            response._links.should.exist;
            response._links.self.should.startWith(apiUrl + "/inboxes/" + keys.testInboxId + "/teammates");
            response._results.should.exist;
            response._results.length.should.be.gte(1);
            var testAuthor = _.find(response._results, ['username', keys.testAuthor]);
            if (!testAuthor) {
                throw new Error('Author for test inbox could not be found');
            }
            keys.testAuthorId = testAuthor.id;
        });
    });
});
