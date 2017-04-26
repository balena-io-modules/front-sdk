"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const querystring = require("querystring");
const request = require("request-promise");
const TypedError = require("typed-error");
const URL = 'https://api2.frontapp.com';
class Front {
    constructor(apiKey) {
        this.comment = {
            create: (params, callback) => this.httpCall({ path: 'conversations/<conversation_id>/comments', reqType: 'POST' }, params, callback),
            get: (params, callback) => this.httpCall({ path: 'comments/<comment_id>', reqType: 'GET' }, params, callback),
            listMentions: (params, callback) => this.httpCall({ path: 'comments/<comment_id>/mentions', reqType: 'GET' }, params, callback),
        };
        this.conversation = {
            get: (params, callback) => this.httpCall({ path: 'conversations/<conversation_id>', reqType: 'GET' }, params, callback),
            list: (params, callback) => this.httpCall({ path: 'conversations[q:page:limit]', reqType: 'GET' }, params, callback),
            listComments: (params, callback) => this.httpCall({ path: 'conversations/<conversation_id>/comments',
                reqType: 'GET' }, params, callback),
            listFollowers: (params, callback) => this.httpCall({ path: 'conversations/<conversation_id>/followers', reqType: 'GET' }, params, callback),
            listInboxes: (params, callback) => this.httpCall({ path: 'conversations/<conversation_id>/inboxes', reqType: 'GET' }, params, callback),
            listMessages: (params, callback) => this.httpCall({ path: 'conversations/<conversation_id>/messages[page:limit]', reqType: 'GET' }, params, callback),
            update: (params, callback) => this.httpCall({ path: 'conversations/<conversation_id}', reqType: 'PATCH' }, params, callback),
        };
        this.inbox = {
            create: (params, callback) => this.httpCall({ path: 'inboxes', reqType: 'POST' }, params, callback),
            get: (params, callback) => this.httpCall({ path: 'inboxes/<inbox_id>', reqType: 'GET' }, params, callback),
            list: (callback) => this.httpCall({ path: 'inboxes', reqType: 'GET' }, null, callback),
            listChannels: (params, callback) => this.httpCall({ path: 'inboxes/<inbox_id>/channels', reqType: 'GET' }, params, callback),
            listConversations: (params, callback) => this.httpCall({ path: 'inboxes/<inbox_id>/conversations[q:page:limit]',
                reqType: 'GET' }, params, callback),
            listTeammates: (params, callback) => this.httpCall({ path: 'inboxes/<inbox_id>/teammates', reqType: 'GET' }, params, callback),
        };
        this.message = {
            get: (params, callback) => this.httpCall({ path: 'messages/<message_id>', reqType: 'GET' }, params, callback),
            receiveCustom: (params, callback) => this.httpCall({ path: 'channels/<channel_id>/incoming_messages', reqType: 'POST' }, params, callback),
            reply: (params, callback) => this.httpCall({ path: 'conversations/<conversation_id>/messages', reqType: 'POST' }, params, callback),
            send: (params, callback) => this.httpCall({ path: 'channels/<channel_id>/messages',
                reqType: 'POST' }, params, callback),
        };
        this.apiKey = apiKey;
    }
    httpCall(details, params, callback) {
        const requestOpts = {
            body: params || {},
            headers: {
                Authorization: `Bearer ${this.apiKey}`
            },
            json: true,
            method: details.reqType,
            url: `${URL}/${this.formatPath(details.path, params)}`
        };
        return request(requestOpts).promise().catch((error) => {
            throw new FrontError(error);
        }).asCallback(callback);
    }
    formatPath(path, data = {}) {
        let newPath = path;
        const reSearch = (re, operation) => {
            let matches = path.match(re);
            if (matches) {
                operation(matches);
            }
        };
        reSearch(/<(.*?)>/g, (mandatoryTags) => {
            _.map(mandatoryTags, (tag) => {
                const tagName = tag.substring(1, tag.length - 1);
                if (!data[tagName]) {
                    throw new Error(`Tag ${tag} not found in parameter data`);
                }
                newPath = newPath.replace(tag, data[tagName]);
            });
        });
        reSearch(/\[(.*?)\]/g, (optionalTags) => {
            if (optionalTags.length > 1) {
                throw new Error(`Front endpoint ${path} is incorrectly defined`);
            }
            const trimmedTags = optionalTags[0];
            const tags = trimmedTags.substring(1, trimmedTags.length - 1).split(':');
            const queryTags = {};
            newPath = newPath.replace(trimmedTags, '');
            _.each(tags, (tag) => {
                if (data[tag]) {
                    queryTags[tag] = data[tag];
                }
            });
            newPath = `${newPath}?${querystring.stringify(queryTags)}`;
        });
        return newPath;
    }
}
exports.Front = Front;
class FrontError extends TypedError {
    constructor(error) {
        super(error);
        const frontError = error.error._error;
        if (frontError) {
            _.each(['status', 'title', 'message', 'details'], (key) => {
                if (frontError[key]) {
                    this[key] = frontError[key];
                }
            });
        }
    }
}
exports.FrontError = FrontError;

//# sourceMappingURL=index.js.map
