// Needed due to chai's should.exist
/* tslint:disable: no-unused-expression */
import * as GithubApi from '@octokit/rest';
import * as Promise from 'bluebird';
import * as chai from 'chai';
import * as ChaiAsPromised from 'chai-as-promised';
import 'mocha';
import { Conversation, FrontError, TopicConversations } from '../lib/index';
import { getKeeper } from './keeper';

chai.use(ChaiAsPromised);
chai.should();

describe('Topics', function () {
	const vaultKeeper = getKeeper();
	const keys = vaultKeeper.keys;
	let githubInst: GithubApi.Octokit;

	before(function () {
		githubInst = new GithubApi.Octokit({
			Promise: <any>Promise,
			headers: {
				Accept: 'application/vnd.github.loki-preview+json'
			},
			host: 'api.github.com',
			protocol: 'https',
			request: {
				timeout: 5000
			}
		});
	});

	it('should return an empty results list for an invalid topic', function () {
		return this.globals.front.topic.listConversations({ topic_id: 'top_xxxxx' }).then(() => {
			throw new Error('Received a result for an invalid topic');
		}).catch(FrontError, (error: FrontError) => {
			error.name.should.eq('FrontError');
			error.status.should.eq(404);
		});
	});

	it.skip('should list all of conversations associated with a topic', function () {
		return githubInst.issues.get({
			issue_number: keys.testTopicIssue.issue,
			owner: keys.testTopicIssue.owner,
			repo: keys.testTopicIssue.repo,
		}).then((issue) => {
			issue.data.body.should.exist;
			const bodyText = issue.data.body;
			const frontTopic = bodyText.match(/\[.*]\((.*)\)/m)![1];
			const topicId = frontTopic.slice(frontTopic.lastIndexOf('/') + 1);

			return this.globals.front.topic.listConversations({ topic_id: topicId });
		}).then((response: TopicConversations) => {
			response._pagination.should.exist;
			response._pagination.should.have.keys('prev', 'next');
			response._links.should.exist;
			response._links.should.have.key('self');
			response._results.should.exist;
			response._results.length.should.eq(1);

			const conversation: Conversation = response._results[0];
			conversation._links.should.exist;
			conversation._links.should.have.keys('self', 'related');
			conversation.id.should.eq(keys.testConversationId);
			conversation.subject.should.eq(keys.testMessageSubject);
			conversation.status.should.exist;
			conversation.recipient.should.exist;
			conversation.last_message.should.exist;
			conversation.last_message.id.should.exist;
			conversation.last_message.body.should.eq(keys.testMessageResponse);
			conversation.created_at.should.exist;
		});
	});
});
