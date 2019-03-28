"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var ChaiAsPromised = require("chai-as-promised");
require("mocha");
var index_1 = require("../lib/index");
var keeper_1 = require("./keeper");
chai.use(ChaiAsPromised);
chai.should();
describe('Contacts', function () {
    var vaultKeeper = keeper_1.getKeeper();
    var keys = vaultKeeper.keys;
    var frontInst;
    var contactId;
    before(function () {
        frontInst = new index_1.Front(keys.apiKey);
    });
    it('should create a contact', function () {
        return frontInst.contact.create({
            handles: [
                {
                    handle: 'test@example.com',
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
        return frontInst.contact.update({
            contact_id: contactId,
            name: 'test example'
        });
    });
    it('should get the contact above', function () {
        return frontInst.contact.get({
            contact_id: contactId,
        }).then(function (contact) {
            contact.should.exist;
            contact.handles.length.should.be.gt(0);
            contact.name.should.eq('test example');
        });
    });
    it('should delete the contact above', function () {
        return frontInst.contact.delete({
            contact_id: contactId,
        });
    });
    it('should fail to find the contact deleted above', function () {
        return frontInst.contact.get({
            contact_id: contactId,
        }).catch(index_1.FrontError, function (error) {
            error.name.should.eq('FrontError');
            error.status.should.eq(404);
        });
    });
});

//# sourceMappingURL=contact.js.map
