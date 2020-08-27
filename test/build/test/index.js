"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var express = require("express");
var ngrok = require("ngrok");
var index_1 = require("../lib/index");
var keeper_1 = require("./keeper");
var TEST_INBOX_NAME = 'Front sdk test inbox';
var TEST_CHANNEL_NAME = 'Test Channel';
var TEST_CONVERSATION_EXTERNAL_ID = 'test_convo_external_id';
var fetchAll = function (front, fn) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
        var result, records, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4, fn.apply(void 0, args)];
                case 1:
                    result = _d.sent();
                    records = __spreadArrays(result._results);
                    if (!result._pagination.next) return [3, 3];
                    _b = (_a = records.push).apply;
                    _c = [records];
                    return [4, fetchAll(front, function () {
                            return front.httpCall({
                                method: 'GET',
                                url: result._pagination.next
                            }, null);
                        })];
                case 2:
                    _b.apply(_a, _c.concat([_d.sent()]));
                    _d.label = 3;
                case 3: return [2, records];
            }
        });
    });
};
before(function () {
    return __awaiter(this, void 0, void 0, function () {
        var keys, front, inboxes, inbox, app, server, webhookUrl, channels, channel, settings, _a;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    this.timeout(20000);
                    this.globals = {};
                    keys = keeper_1.getKeeper().keys;
                    front = this.globals.front = new index_1.Front(keys.apiKey);
                    return [4, fetchAll(front, front.inbox.list)];
                case 1:
                    inboxes = _b.sent();
                    inbox = inboxes.filter(function (existing) { return existing.name === TEST_INBOX_NAME; })[0];
                    if (!!inbox) return [3, 3];
                    return [4, front.inbox.create({
                            name: TEST_INBOX_NAME
                        })];
                case 2:
                    inbox = _b.sent();
                    _b.label = 3;
                case 3:
                    this.globals.inbox = inbox;
                    app = express();
                    app.use(bodyParser.urlencoded({ extended: true }));
                    app.use(bodyParser.json());
                    app.post('/', function (_req, res) {
                        res.json({
                            type: 'success',
                            external_id: '' + Date.now(),
                            external_conversation_id: TEST_CONVERSATION_EXTERNAL_ID
                        });
                    });
                    server = null;
                    webhookUrl = '';
                    return [4, new Promise(function (resolve) {
                            server = app.listen(0, function () { return __awaiter(_this, void 0, void 0, function () {
                                var port;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            port = server.address().port;
                                            return [4, ngrok.connect(port)];
                                        case 1:
                                            webhookUrl = _a.sent();
                                            resolve();
                                            return [2];
                                    }
                                });
                            }); });
                        })];
                case 4:
                    _b.sent();
                    this.server = server;
                    return [4, fetchAll(front, front.inbox.listChannels, { inbox_id: inbox.id })];
                case 5:
                    channels = _b.sent();
                    channel = channels.filter(function (existing) { return existing.name === TEST_CHANNEL_NAME; })[0];
                    settings = {
                        compose_mode: 'normal',
                        reply_mode: 'same_channel',
                        webhook_url: webhookUrl
                    };
                    if (!channel) return [3, 7];
                    return [4, front.channel.update({
                            channel_id: channel.id,
                            settings: settings
                        })];
                case 6:
                    _b.sent();
                    return [3, 9];
                case 7: return [4, front.inbox.createChannel({
                        inbox_id: inbox.id,
                        name: TEST_CHANNEL_NAME,
                        settings: settings,
                        type: 'custom'
                    })];
                case 8:
                    channel = _b.sent();
                    _b.label = 9;
                case 9:
                    this.globals.channel = channel;
                    _a = this.globals;
                    return [4, fetchAll(front, front.inbox.listTeammates, { inbox_id: this.globals.inbox.id })];
                case 10:
                    _a.author = (_b.sent())[0];
                    return [2];
            }
        });
    });
});
require('./apilogin');
require('./message');
require('./inbox');
require('./comment');
require('./contact');
require('./conversation');
require('./teammate');
require('./topic');
require('./event');
after(function () {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, ngrok.kill()];
                case 1:
                    _a.sent();
                    if (this.server) {
                        this.server.close();
                    }
                    return [2];
            }
        });
    });
});
