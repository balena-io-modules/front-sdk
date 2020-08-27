"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontError = exports.Front = void 0;
var Promise = require("bluebird");
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
        this.contact = {
            create: function (params, callback) {
                return _this.httpCall({ method: 'POST', path: 'contacts' }, params, callback);
            },
            delete: function (params, callback) {
                return _this.httpCall({ method: 'DELETE', path: 'contacts/<contact_id>' }, params, callback);
            },
            get: function (params, callback) {
                return _this.httpCall({ method: 'GET', path: 'contacts/<contact_id>' }, params, callback);
            },
            update: function (params, callback) {
                return _this.httpCall({ method: 'PATCH', path: 'contacts/<contact_id>' }, params, callback);
            },
        };
        this.conversation = {
            get: function (params, callback) {
                return _this.httpCall({ method: 'GET', path: 'conversations/<conversation_id>' }, params, callback);
            },
            list: function (params, callback) {
                return _this.httpCall({ method: 'GET', path: 'conversations[q:page_token:limit]' }, params, callback);
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
                return _this.httpCall({ method: 'GET', path: 'conversations/<conversation_id>/messages[page_token:limit]' }, params, callback);
            },
            listRecent: function (callback) {
                return _this.httpCall({ method: 'GET', path: 'conversations' }, null, callback);
            },
            update: function (params, callback) {
                return _this.httpCall({ method: 'PATCH', path: "conversations/" + params.conversation_id }, _.omit(params, ['conversation_id']), callback);
            },
        };
        this.inbox = {
            create: function (params, callback) {
                return _this.httpCall({ method: 'POST', path: 'inboxes' }, params, callback);
            },
            createChannel: function (params, callback) { return _this.httpCall({ method: 'POST', path: 'inboxes/<inbox_id>/channels' }, params, callback); },
            get: function (params, callback) {
                return _this.httpCall({ method: 'GET', path: 'inboxes/<inbox_id>' }, params, callback);
            },
            list: function (callback) {
                return _this.httpCall({ method: 'GET', path: 'inboxes' }, null, callback);
            },
            listChannels: function (params, callback) { return _this.httpCall({ method: 'GET', path: 'inboxes/<inbox_id>/channels' }, params, callback); },
            listConversations: function (params, callback) { return _this.httpCall({ method: 'GET',
                path: 'inboxes/<inbox_id>/conversations[q:page_token:limit]' }, params, callback); },
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
        this.teammate = {
            get: function (params, callback) {
                return _this.httpCall({ method: 'GET', path: 'teammates/<teammate_id>' }, params, callback);
            },
            list: function (callback) {
                return _this.httpCall({ method: 'GET', path: 'teammates' }, null, callback);
            },
            update: function (params, callback) {
                return _this.httpCall({ method: 'PATCH', path: 'teammates/<teammate_id>' }, params, callback);
            },
        };
        this.topic = {
            listConversations: function (params, callback) { return _this.httpCall({ method: 'GET',
                path: 'topics/<topic_id>/conversations[q:page_token:limit]' }, params, callback); },
        };
        this.channel = {
            update: function (params, callback) { return _this.httpCall({ method: 'PATCH',
                path: 'channels/<channel_id>' }, params, callback); },
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
            var eventPreview = (typeof (req.body) === 'string') ? JSON.parse(req.body) : req.body;
            var XFrontSignature = req.get('X-Front-Signature');
            if (!XFrontSignature || !_this.validateEventSignature(eventPreview, XFrontSignature)) {
                res.sendStatus(401);
                throw new Error('Event Signature does not match registered secret');
            }
            res.sendStatus(200);
            addToEventQueue(eventPreview.id);
        });
        return httpServer;
    };
    Front.prototype.getFromLink = function (url, callback) {
        var path = url.replace(URL, '').replace(/^\//, '');
        return this.httpCall({ method: 'GET', path: path }, null, callback);
    };
    Front.prototype.httpCall = function (details, params, callback, retries) {
        var _this = this;
        if (retries === void 0) { retries = 0; }
        var url = 'url' in details ? details.url : URL + "/" + this.formatPath(details.path, params);
        var body = params || {};
        var requestOpts = {
            body: body,
            headers: {
                Authorization: "Bearer " + this.apiKey
            },
            json: true,
            method: details.method,
            url: url
        };
        return request(requestOpts).promise().catch(function (error) {
            if (error.statusCode >= 500 && retries < 5) {
                return Promise.delay(300).then(function () {
                    return _this.httpCall(details, params, callback, retries + 1);
                });
            }
            var frontError = new FrontError(error);
            frontError.message += " at " + url + " with body " + JSON.stringify(body);
            throw frontError;
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
;

//# sourceMappingURL=index.js.map
