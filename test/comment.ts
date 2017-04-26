// Needed due to chai's should.exist
/* tslint:disable: no-unused-expression */
import * as chai from 'chai';
import * as ChaiAsPromised from 'chai-as-promised';
import * as _ from 'lodash';
import 'mocha';
import { Comment, CommentMentions, Front } from '../lib/index';
import { getKeeper } from './keeper';

chai.use(ChaiAsPromised);
chai.should();

// To post into an inbox, you need to know the channels in for it.
// Channels are frontInstances of sources, such as SMTP, Facebook, Front Integration, etc.
// So to post a new conversation:
//  * Find the inbox you want (Sandbox)
//  * List the channels and find the right one (Integration channel)
//  * Post a message to that channel (get a conversation reference back)
//
// To post a comment to that conversation:
//  * Use the comment reference to post (get back a link to the conversation)
//
// Now do a lot of the listing of shit, some of it will need to be more structured
// to ensure we're getting the right things back.

describe('Comments', function () {
	const vaultKeeper = getKeeper();
	const keys = vaultKeeper.keys;
	const testComment = `Test comment ${Date().toString()} for @${keys.testAuthor}`;
	let frontInst: Front;

	before(function () {
		frontInst = new Front(keys.apiKey);
	});

	it('should create a new comment in the conversation', function () {
		if (!keys.testConversationId) {
			throw new Error('Cannot find conversation ID');
		}
		if (!keys.testAuthorId) {
			throw new Error('Cannot find author ID');
		}
		return frontInst.comment.create({
			author_id: keys.testAuthorId,
			body: testComment,
			conversation_id: keys.testConversationId,
		}).then(function (response: Comment) {
			response._links.should.exist;
			response._links.should.have.keys('self', 'related');
			response.id.should.exist;
			response.posted_at.should.exist;
			response.body.should.eq(testComment);
			response.author.should.exist;
			response.author._links.should.exist;
			response.author._links.should.have.keys('self', 'related');
			response.author.username.should.eq(keys.testAuthor);

			keys.testCommentId = response.id;
		});
	});

	it('should get the specific comment from the conversation', function () {
		if (!keys.testCommentId) {
			throw new Error('Cannot find comment ID');
		}
		return frontInst.comment.get({ comment_id: keys.testCommentId }).then(function (response: Comment) {
			response._links.should.exist;
			response._links.should.have.keys('self', 'related');
			response.id.should.exist;
			response.id.should.eq(keys.testCommentId);
			response.body.should.eq(testComment);
			response.posted_at.should.exist;
			response.author.should.exist;
			response.author.username.should.eq(keys.testAuthor);
		});
	});

	it('should list the teammates mentioned in a comment', function () {
		if (!keys.testCommentId) {
			throw new Error('Cannot find comment ID');
		}
		return frontInst.comment.listMentions({ comment_id: keys.testCommentId })
		.then(function (response: CommentMentions) {
			response._pagination.should.exist;
			response._pagination.should.have.keys('prev', 'next');
			response._links.should.exist;
			response._links.should.have.keys('self');
			response._results.should.exist;
			response._results.length.should.be.gt(0);
			response._results.should.satisfy(function (results: Comment[]) {
				return _.find(results, ['id', keys.testAuthorId]);
			});
		});
	});
});
