"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var ChaiAsPromised = require("chai-as-promised");
var ChaiString = require("chai-string");
var _ = require("lodash");
require("mocha");
chai.use(ChaiAsPromised);
chai.use(ChaiString);
chai.should();
describe('Inboxes', function () {
    var apiUrl = 'https://api2.frontapp.com';
    it('should list all of the current inboxes and find a named one', function () {
        return this.globals.front.inbox.list().then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.include.keys('next', 'prev');
            response._links.should.exist;
            response._links.self.should.startsWith(apiUrl + "/inboxes");
            var inbox = response._results[0];
            inbox.should.include.keys('_links', 'id', 'address', 'send_as', 'name', 'type');
        });
    });
    it('should get known test inbox', function () {
        var _this = this;
        return this.globals.front.inbox.get({
            inbox_id: this.globals.inbox.id
        }).then(function (response) {
            response._links.should.exist;
            response._links.should.include.keys('self', 'related');
            response._links.self.should.startsWith(apiUrl + "/inboxes/" + _this.globals.inbox.id);
            response._links.related.should.include.keys('channels', 'conversations', 'teammates');
            response.id.should.equal(_this.globals.inbox.id);
            response.name.should.equal(_this.globals.inbox.name);
            response.address.should.exist;
            response.send_as.should.exist;
        });
    });
    it('should list all channels for an inbox, and find integration test channel', function () {
        var _this = this;
        return this.globals.front.inbox.listChannels({ inbox_id: this.globals.inbox.id }).then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.include.keys('next', 'prev');
            response._links.should.exist;
            response._links.self.should.startsWith(apiUrl + "/inboxes/" + _this.globals.inbox.id + "/channels");
            response._results.should.exist;
            response._results[0].id.should.be.equal(_this.globals.channel.id);
        });
    });
    it('should list all conversations in the test inbox, finding previously known ones', function () {
        var _this = this;
        return this.globals.front.inbox.listConversations({ inbox_id: this.globals.inbox.id })
            .then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.include.keys('next', 'prev');
            response._links.should.exist;
            response._links.self.should.startsWith(apiUrl + "/inboxes/" + _this.globals.inbox.id + "/conversations");
            response._results.should.exist;
            response._results.length.should.be.gte(1);
        });
    });
    it('should list all conversations in the test inbox using query string, finding previously known ones', function () {
        var _this = this;
        return this.globals.front.inbox.listConversations({
            inbox_id: this.globals.inbox.id,
            q: 'q[statuses][]=unassigned&q[statuses][]=assigned'
        }).then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.include.keys('next', 'prev');
            response._links.should.exist;
            response._links.self.should.startWith(apiUrl + "/inboxes/" + _this.globals.inbox.id + "/conversations");
            response._links.self.should.include('q[statuses][]=unassigned&q[statuses][]=assigned');
            response._results.should.exist;
            response._results.length.should.be.gt(1);
        });
    });
    it('should list all teammates for the test inbox', function () {
        var _this = this;
        return this.globals.front.inbox.listTeammates({ inbox_id: this.globals.inbox.id }).then(function (response) {
            response._pagination.should.exist;
            response._pagination.should.include.keys('next', 'prev');
            response._links.should.exist;
            response._links.self.should.startWith(apiUrl + "/inboxes/" + _this.globals.inbox.id + "/teammates");
            response._results.should.exist;
            response._results.length.should.be.gte(1);
            var testAuthor = _.find(response._results, ['username', _this.globals.author.username]);
            if (!testAuthor) {
                throw new Error('Author for test inbox could not be found');
            }
        });
    });
});
