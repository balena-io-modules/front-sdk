"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var ChaiAsPromised = require("chai-as-promised");
require("mocha");
var lib_1 = require("../lib");
var keeper_1 = require("./keeper");
chai.use(ChaiAsPromised);
chai.should();
describe('Teammates', function () {
    var vaultKeeper = keeper_1.getKeeper();
    var keys = vaultKeeper.keys;
    var frontInst;
    var teammateId;
    var priorName;
    before(function () {
        frontInst = new lib_1.Front(keys.apiKey);
    });
    it('should list teammates', function () {
        return frontInst.teammate.list().then(function (teammates) {
            teammates._results.should.exist;
            teammates._results.length.should.be.gt(0);
            teammateId = teammates._results[0].id;
            priorName = teammates._results[0].first_name;
        });
    });
    it('should get the first teammate from above', function () {
        return frontInst.teammate.get({
            teammate_id: teammateId
        }).then(function (teammate) {
            teammate.id.should.eq(teammateId);
            teammate.first_name.should.eq(priorName);
        });
    });
    it('should update the first teammate from above', function () {
        return frontInst.teammate.update({
            first_name: 'test',
            teammate_id: teammateId,
        }).then(function () {
            return frontInst.teammate.get({
                teammate_id: teammateId,
            });
        }).then(function (teammate) {
            teammate.first_name.should.eq('test');
        }).then(function () {
            return frontInst.teammate.update({
                first_name: priorName,
                teammate_id: teammateId
            });
        })
            .then(function () {
            return frontInst.teammate.get({
                teammate_id: teammateId
            });
        })
            .then(function (teammate) {
            teammate.first_name.should.eq(priorName);
        });
    });
});
