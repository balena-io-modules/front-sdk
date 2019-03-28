"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var ChaiAsPromised = require("chai-as-promised");
require("mocha");
var index_1 = require("../lib/index");
chai.use(ChaiAsPromised);
chai.should();
describe('Login', function () {
    it('should fail a request with a bad key', function () {
        var inst = new index_1.Front('badkey');
        return inst.inbox.list().then(function (_response) {
            throw new Error('Should not have made request correctly!');
        }).catch(index_1.FrontError, function (err) {
            err.name.should.eq('FrontError');
            err.status.should.eq(401);
            err.title.should.eq('Unauthenticated');
        });
    });
});

//# sourceMappingURL=apilogin.js.map
