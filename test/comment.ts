// Needed due to chai's should.exist
/* tslint:disable: no-unused-expression */
import * as chai from 'chai';
import * as ChaiAsPromised from 'chai-as-promised';
import * as _ from 'lodash';
import 'mocha';
import { Comment, CommentMentions } from '../lib/index';

chai.use(ChaiAsPromised);
chai.should();

describe('Comments', function () {
	before(function () {
		this.testComment = `Test comment ${Date().toString()} for @${this.globals.author.username}`;
	})

	it('should create a new comment in the conversation', function () {
		if (!this.globals.testConversationId) {
			throw new Error('Cannot find conversation ID');
		}
		return this.globals.front.comment.create({
			author_id: this.globals.author.id,
			body: this.testComment,
			conversation_id: this.globals.testConversationId,
		}).then((response: Comment) => {
			response._links.should.exist;
			response._links.should.have.keys('self', 'related');
			response.id.should.exist;
			response.posted_at.should.exist;
			response.body.should.eq(this.testComment);
			response.author.should.exist;
			response.author._links.should.exist;
			response.author._links.should.have.keys('self', 'related');
			response.author.username.should.eq(this.globals.author.username);

			this.globals.testCommentId = response.id;
		});
	});

	it('should get the specific comment from the conversation', function () {
		if (!this.globals.testCommentId) {
			throw new Error('Cannot find comment ID');
		}
		return this.globals.front.comment.get({ comment_id: this.globals.testCommentId }).then((response: Comment) => {
			response._links.should.exist;
			response._links.should.have.keys('self', 'related');
			response.id.should.exist;
			response.id.should.eq(this.globals.testCommentId);
			response.body.should.eq(this.testComment);
			response.posted_at.should.exist;
			response.author.should.exist;
			response.author.username.should.eq(this.globals.author.username);
		});
	});

	it('should list the teammates mentioned in a comment', function () {
		if (!this.globals.testCommentId) {
			throw new Error('Cannot find comment ID');
		}
		return this.globals.front.comment.listMentions({ comment_id: this.globals.testCommentId })
		.then((response: CommentMentions) => {
			response._pagination.should.exist;
			response._pagination.should.have.keys('prev', 'next');
			response._links.should.exist;
			response._links.should.have.keys('self');
			response._results.should.exist;
			response._results.length.should.be.gt(0);
			response._results.should.satisfy((results: Comment[]) => {
				return _.find(results, ['id', this.globals.author.id]);
			});
		});
	});
});
