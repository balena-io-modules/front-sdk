"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var ChaiAsPromised = require("chai-as-promised");
require("mocha");
chai.use(ChaiAsPromised);
chai.should();
describe('Teammates', function () {
    var teammateId;
    var priorName;
    it('should list teammates', function () {
        return this.globals.front.teammate.list().then(function (teammates) {
            teammates._results.should.exist;
            teammates._results.length.should.be.gt(0);
            teammateId = teammates._results[0].id;
            priorName = teammates._results[0].first_name;
        });
    });
    it('should get the first teammate from above', function () {
        return this.globals.front.teammate.get({
            teammate_id: teammateId
        }).then(function (teammate) {
            teammate.id.should.eq(teammateId);
            teammate.first_name.should.eq(priorName);
        });
    });
    it('should update the first teammate from above', function () {
        var _this = this;
        return this.globals.front.teammate.update({
            first_name: 'test',
            teammate_id: teammateId,
        }).then(function () {
            return _this.globals.front.teammate.get({
                teammate_id: teammateId,
            });
        }).then(function (teammate) {
            teammate.first_name.should.eq('test');
        }).then(function () {
            return _this.globals.front.teammate.update({
                first_name: priorName,
                teammate_id: teammateId
            });
        })
            .then(function () {
            return _this.globals.front.teammate.get({
                teammate_id: teammateId
            });
        })
            .then(function (teammate) {
            teammate.first_name.should.eq(priorName);
        });
    });
});
