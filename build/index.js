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
var _ = require("lodash");
var querystring = require("querystring");
var request = require("request-promise");
var TypedError = require("typed-error");
var URL = 'https://api2.frontapp.com';
var Front = (function () {
    function Front(apiKey) {
        var _this = this;
        this.comment = {
            create: function (params, callback) {
                return _this.httpCall({ path: 'conversations/<conversation_id>/comments', reqType: 'POST' }, params, callback);
            },
            get: function (params, callback) {
                return _this.httpCall({ path: 'comments/<comment_id>', reqType: 'GET' }, params, callback);
            },
            listMentions: function (params, callback) { return _this.httpCall({ path: 'comments/<comment_id>/mentions', reqType: 'GET' }, params, callback); },
        };
        this.conversation = {
            get: function (params, callback) {
                return _this.httpCall({ path: 'conversations/<conversation_id>', reqType: 'GET' }, params, callback);
            },
            list: function (params, callback) {
                return _this.httpCall({ path: 'conversations[q:page:limit]', reqType: 'GET' }, params, callback);
            },
            listComments: function (params, callback) { return _this.httpCall({ path: 'conversations/<conversation_id>/comments',
                reqType: 'GET' }, params, callback); },
            listFollowers: function (params, callback) {
                return _this.httpCall({ path: 'conversations/<conversation_id>/followers', reqType: 'GET' }, params, callback);
            },
            listInboxes: function (params, callback) {
                return _this.httpCall({ path: 'conversations/<conversation_id>/inboxes', reqType: 'GET' }, params, callback);
            },
            listMessages: function (params, callback) {
                return _this.httpCall({ path: 'conversations/<conversation_id>/messages[page:limit]', reqType: 'GET' }, params, callback);
            },
            update: function (params, callback) {
                return _this.httpCall({ path: 'conversations/<conversation_id}', reqType: 'PATCH' }, params, callback);
            },
        };
        this.inbox = {
            create: function (params, callback) {
                return _this.httpCall({ path: 'inboxes', reqType: 'POST' }, params, callback);
            },
            get: function (params, callback) {
                return _this.httpCall({ path: 'inboxes/<inbox_id>', reqType: 'GET' }, params, callback);
            },
            list: function (callback) {
                return _this.httpCall({ path: 'inboxes', reqType: 'GET' }, null, callback);
            },
            listChannels: function (params, callback) { return _this.httpCall({ path: 'inboxes/<inbox_id>/channels', reqType: 'GET' }, params, callback); },
            listConversations: function (params, callback) { return _this.httpCall({ path: 'inboxes/<inbox_id>/conversations[q:page:limit]',
                reqType: 'GET' }, params, callback); },
            listTeammates: function (params, callback) { return _this.httpCall({ path: 'inboxes/<inbox_id>/teammates', reqType: 'GET' }, params, callback); },
        };
        this.message = {
            get: function (params, callback) {
                return _this.httpCall({ path: 'messages/<message_id>', reqType: 'GET' }, params, callback);
            },
            receiveCustom: function (params, callback) {
                return _this.httpCall({ path: 'channels/<channel_id>/incoming_messages', reqType: 'POST' }, params, callback);
            },
            reply: function (params, callback) {
                return _this.httpCall({ path: 'conversations/<conversation_id>/messages', reqType: 'POST' }, params, callback);
            },
            send: function (params, callback) { return _this.httpCall({ path: 'channels/<channel_id>/messages',
                reqType: 'POST' }, params, callback); },
        };
        this.topic = {
            listConversations: function (params, callback) { return _this.httpCall({ path: 'topics/<topic_id>/conversations[q:page:limit]',
                reqType: 'GET' }, params, callback); },
        };
        this.apiKey = apiKey;
    }
    Front.prototype.httpCall = function (details, params, callback) {
        var requestOpts = {
            body: params || {},
            headers: {
                Authorization: "Bearer " + this.apiKey
            },
            json: true,
            method: details.reqType,
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
                if (data[tag]) {
                    queryTags[tag] = data[tag];
                }
            });
            newPath = newPath + "?" + querystring.stringify(queryTags);
        });
        return newPath;
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
