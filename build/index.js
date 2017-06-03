"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var crypto = require("crypto");
var express = require("express");
var _ = require("lodash");
var querystring = require("querystring");
var request = require("request-promise");
var TypedError = require("typed-error");
var URL = 'https://api2.frontapp.com';
var Front = (function () {
    function Front(apiKey, apiSecret) {
        var _this = this;
        this.comment = {
            create: function (params, callback) {
                return _this.httpCall({ method: 'POST', path: 'conversations/<conversation_id>/comments' }, params, callback);
            },
            get: function (params, callback) {
                return _this.httpCall({ method: 'GET', path: 'comments/<comment_id>' }, params, callback);
            },
            listMentions: function (params, callback) { return _this.httpCall({ method: 'GET', path: 'comments/<comment_id>/mentions' }, params, callback); },
        };
        this.conversation = {
            get: function (params, callback) {
                return _this.httpCall({ method: 'GET', path: 'conversations/<conversation_id>' }, params, callback);
            },
            list: function (params, callback) {
                return _this.httpCall({ method: 'GET', path: 'conversations[q:page:limit]' }, params, callback);
            },
            listComments: function (params, callback) { return _this.httpCall({ method: 'GET',
                path: 'conversations/<conversation_id>/comments' }, params, callback); },
            listFollowers: function (params, callback) {
                return _this.httpCall({ method: 'GET', path: 'conversations/<conversation_id>/followers' }, params, callback);
            },
            listInboxes: function (params, callback) {
                return _this.httpCall({ method: 'GET', path: 'conversations/<conversation_id>/inboxes' }, params, callback);
            },
            listMessages: function (params, callback) {
                return _this.httpCall({ method: 'GET', path: 'conversations/<conversation_id>/messages[page:limit]' }, params, callback);
            },
            update: function (params, callback) {
                return _this.httpCall({ method: 'PATCH', path: 'conversations/<conversation_id}' }, params, callback);
            },
        };
        this.inbox = {
            create: function (params, callback) {
                return _this.httpCall({ method: 'POST', path: 'inboxes' }, params, callback);
            },
            get: function (params, callback) {
                return _this.httpCall({ method: 'GET', path: 'inboxes/<inbox_id>' }, params, callback);
            },
            list: function (callback) {
                return _this.httpCall({ method: 'GET', path: 'inboxes' }, null, callback);
            },
            listChannels: function (params, callback) { return _this.httpCall({ method: 'GET', path: 'inboxes/<inbox_id>/channels' }, params, callback); },
            listConversations: function (params, callback) { return _this.httpCall({ method: 'GET',
                path: 'inboxes/<inbox_id>/conversations[q:page:limit]' }, params, callback); },
            listTeammates: function (params, callback) { return _this.httpCall({ method: 'GET', path: 'inboxes/<inbox_id>/teammates' }, params, callback); },
        };
        this.message = {
            get: function (params, callback) {
                return _this.httpCall({ method: 'GET', path: 'messages/<message_id>' }, params, callback);
            },
            receiveCustom: function (params, callback) {
                return _this.httpCall({ method: 'POST', path: 'channels/<channel_id>/incoming_messages' }, params, callback);
            },
            reply: function (params, callback) {
                return _this.httpCall({ method: 'POST', path: 'conversations/<conversation_id>/messages' }, params, callback);
            },
            send: function (params, callback) { return _this.httpCall({ method: 'POST',
                path: 'channels/<channel_id>/messages' }, params, callback); },
        };
        this.topic = {
            listConversations: function (params, callback) { return _this.httpCall({ method: 'GET',
                path: 'topics/<topic_id>/conversations[q:page:limit]' }, params, callback); },
        };
        this.apiKey = apiKey;
        if (apiSecret) {
            this.apiSecret = apiSecret;
        }
    }
    Front.prototype.registerEvents = function (opts, callback) {
        var _this = this;
        var httpServer;
        var listener;
        var eventQueue = [];
        var requestEvent = function () {
            var eventId = eventQueue[0];
            _this.httpCall({ path: 'events/<event_id>', method: 'GET' }, {
                event_id: eventId
            }).asCallback(callback)
                .finally(function () {
                eventQueue.shift();
                if (eventQueue.length > 0) {
                    requestEvent();
                }
            });
        };
        var addToEventQueue = function (id) {
            eventQueue.push(id);
            if (eventQueue.length === 1) {
                requestEvent();
            }
        };
        if (!this.apiSecret) {
            throw new Error('No secret key registered');
        }
        if (!opts || (opts.server && opts.port) || (!opts.server && !opts.port)) {
            throw new Error('Pass either an Express instance or a port to listen on');
        }
        if (opts.port && typeof opts.port !== 'number') {
            throw new Error('`port` must be a number');
        }
        var hookPath = opts.hookPath || '/fronthook';
        if (opts.server) {
            listener = opts.server;
        }
        else {
            listener = express();
            listener.use(bodyParser.urlencoded({ extended: true }));
            listener.use(bodyParser.json());
            httpServer = listener.listen(opts.port);
        }
        listener.post(hookPath, function (req, res) {
            var eventPreview = req.body;
            if (!_this.validateEventSignature(eventPreview, req.get('X-Front-Signature'))) {
                res.sendStatus(401);
                throw new Error('Event Signature does not match registered secret');
            }
            res.sendStatus(200);
            addToEventQueue(eventPreview.id);
        });
        return httpServer;
    };
    Front.prototype.httpCall = function (details, params, callback) {
        var requestOpts = {
            body: params || {},
            headers: {
                Authorization: "Bearer " + this.apiKey
            },
            json: true,
            method: details.method,
            url: URL + "/" + this.formatPath(details.path, params)
        };
        return request(requestOpts).promise().catch(function (error) {
            throw new FrontError(error);
        }).asCallback(callback);
    };
    Front.prototype.formatPath = function (path, data) {
        if (data === void 0) { data = {}; }
        var newPath = path;
        var reSearch = function (re, operation) {
            var matches = path.match(re);
            if (matches) {
                operation(matches);
            }
        };
        reSearch(/<(.*?)>/g, function (mandatoryTags) {
            _.map(mandatoryTags, function (tag) {
                var tagName = tag.substring(1, tag.length - 1);
                if (!data[tagName]) {
                    throw new Error("Tag " + tag + " not found in parameter data");
                }
                newPath = newPath.replace(tag, data[tagName]);
            });
        });
        reSearch(/\[(.*?)\]/g, function (optionalTags) {
            if (optionalTags.length > 1) {
                throw new Error("Front endpoint " + path + " is incorrectly defined");
            }
            var trimmedTags = optionalTags[0];
            var tags = trimmedTags.substring(1, trimmedTags.length - 1).split(':');
            var queryTags = {};
            newPath = newPath.replace(trimmedTags, '');
            _.each(tags, function (tag) {
                if ((tag !== 'q') && data[tag]) {
                    queryTags[tag] = data[tag];
                }
            });
            newPath = newPath + "?" + querystring.stringify(queryTags);
            if (_.includes(tags, 'q')) {
                newPath += "&" + data.q;
            }
        });
        return newPath;
    };
    Front.prototype.validateEventSignature = function (data, signature) {
        var hash = '';
        try {
            hash = crypto.createHmac('sha1', this.apiSecret)
                .update(JSON.stringify(data))
                .digest('base64');
        }
        catch (err) {
            return false;
        }
        return hash === signature;
    };
    return Front;
}());
exports.Front = Front;
var FrontError = (function (_super) {
    __extends(FrontError, _super);
    function FrontError(error) {
        var _this = _super.call(this, error) || this;
        var frontError = error.error._error;
        if (frontError) {
            _.each(['status', 'title', 'message', 'details'], function (key) {
                if (frontError[key]) {
                    _this[key] = frontError[key];
                }
            });
        }
        return _this;
    }
    return FrontError;
}(TypedError));
exports.FrontError = FrontError;

//# sourceMappingURL=index.js.map
