"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var ChaiAsPromised = require("chai-as-promised");
require("mocha");
var index_1 = require("../lib/index");
chai.use(ChaiAsPromised);
chai.should();
describe('Contacts', function () {
    var contactId;
    it('should create a contact', function () {
        return this.globals.front.contact.create({
            handles: [
                {
                    handle: "test-" + Date.now() + "@example.com",
                    source: 'email'
                }
            ]
        }).then(function (contact) {
            contactId = contact.id;
            contact.should.exist;
            contact.handles.length.should.be.gt(0);
        });
    });
    it('should update the contact above', function () {
        return this.globals.front.contact.update({
            contact_id: contactId,
            name: 'test example'
        });
    });
    it('should get the contact above', function () {
        return this.globals.front.contact.get({
            contact_id: contactId,
        }).then(function (contact) {
            contact.should.exist;
            contact.handles.length.should.be.gt(0);
            contact.name.should.eq('test example');
        });
    });
    it('should delete the contact above', function () {
        return this.globals.front.contact.delete({
            contact_id: contactId,
        });
    });
    it('should fail to find the contact deleted above', function () {
        return this.globals.front.contact.get({
            contact_id: contactId,
        }).catch(index_1.FrontError, function (error) {
            error.name.should.eq('FrontError');
            error.status.should.eq(404);
        });
    });
});
