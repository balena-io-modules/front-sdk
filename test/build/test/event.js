"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var ChaiAsPromised = require("chai-as-promised");
var express = require("express");
require("mocha");
var index_1 = require("../lib/index");
var keeper_1 = require("./keeper");
chai.use(ChaiAsPromised);
chai.should();
describe('Events', function () {
    var vaultKeeper = keeper_1.getKeeper();
    var keys = vaultKeeper.keys;
    var frontInst;
    before(function () {
        frontInst = new index_1.Front(keys.apiKey, 'madeupkey');
    });
    it('should fail as no secret key is set', function (done) {
        var brokenInst = new index_1.Front(keys.apiKey);
        try {
            brokenInst.registerEvents({ port: 1234 }, function () {
                done('Should not have received an event');
            });
        }
        catch (err) {
            err.message.should.eq('No secret key registered');
            done();
        }
    });
    it('should fail as neither the port or server instance are set', function (done) {
        try {
            frontInst.registerEvents({}, function () {
                done('Should not have received an event');
            });
        }
        catch (err) {
            err.message.should.eq('Pass either an Express instance or a port to listen on');
            done();
        }
    });
    it('should fail as both the port or server instance are set', function (done) {
        try {
            frontInst.registerEvents({ server: express(), port: 1234 }, function () {
                done('Should not have received an event');
            });
        }
        catch (err) {
            err.message.should.eq('Pass either an Express instance or a port to listen on');
            done();
        }
    });
    it('should start a new server on port 1234 then exit', function (done) {
        var expressInst = frontInst.registerEvents({ port: 1234 }, function () {
            done('Should not have received an event');
        });
        if (expressInst) {
            setTimeout(function () {
                expressInst.close();
                done();
            }, 2000);
        }
        else {
            done('Should have been returned an Express instance');
        }
    });
    it('should listen on existing server then exit', function (done) {
        var expressInst = express();
        var httpServer = expressInst.listen(1234);
        frontInst.registerEvents({ server: expressInst }, function () {
            done('Should not have received an event');
        });
        setTimeout(function () {
            httpServer.close();
            done();
        }, 2000);
    });
});
