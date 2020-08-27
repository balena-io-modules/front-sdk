import * as Bluebird from 'bluebird';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { Server } from 'http';
import * as ngrok from 'ngrok';
import { Channel, Front, InboxCreation, List } from '../lib/index';
import { getKeeper } from './keeper';
import { AddressInfo } from 'net';

const TEST_INBOX_NAME = 'Front sdk test inbox';
const TEST_CHANNEL_NAME = 'Test Channel';
const TEST_CONVERSATION_EXTERNAL_ID = 'test_convo_external_id';

const fetchAll = async <T>(front: Front, fn: (...args: any) => Bluebird<List<T>>, ...args: any) => {
	const result = await fn(...args);
	const records: T[] = [...result._results];

	if (result._pagination.next) {
		records.push(...await fetchAll<T>(front, () => {
			return front.httpCall({
				method: 'GET',
				url: result._pagination.next!
			}, null);
		}));
	}

	return records;
};

before(async function () {
	this.timeout(20000);
	this.globals = {};

	const keys = getKeeper().keys;
	const front = this.globals.front = new Front(keys.apiKey);

	// Create a test inbox if it does not exist
	const inboxes = await fetchAll(front, front.inbox.list);
	let inbox: InboxCreation = inboxes.filter((existing) => existing.name === TEST_INBOX_NAME)[0];

	if (!inbox) {
		inbox = await front.inbox.create({
			name: TEST_INBOX_NAME
		});
	}

	this.globals.inbox = inbox;

	// Create a server to handle a custom channel
	const app = express();
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());

	app.post('/', (_req: any, res: any) => {
		res.json({
			type: 'success',
			external_id: '' + Date.now(),
			external_conversation_id: TEST_CONVERSATION_EXTERNAL_ID
		});
	});

	let server: Server | null = null;
	let webhookUrl: string = '';

	await new Promise((resolve) => {
		server = app.listen(0, async () => {
			const port = (server!.address() as AddressInfo).port;
			webhookUrl = await ngrok.connect(port);
			resolve();
		});
	});

	this.server = server;

	// Create or update a test channel of the inbox
	const channels = await fetchAll(front, front.inbox.listChannels, { inbox_id: inbox.id });
	let channel: Channel = channels.filter((existing) => existing.name === TEST_CHANNEL_NAME)[0];

	const settings = {
		compose_mode: 'normal',
        reply_mode: 'same_channel',
		webhook_url: webhookUrl
	};

	if (channel) {
		await front.channel.update({
			channel_id: channel.id,
			settings
		});
	} else {
		channel = await front.inbox.createChannel({
			inbox_id: inbox.id,
			name: TEST_CHANNEL_NAME,
			settings,
			type: 'custom'
		});
	}

	this.globals.channel = channel;

	// Fetch the test author (teammate on behalf of whom the message is sent)
	this.globals.author = (await fetchAll(front, front.inbox.listTeammates, { inbox_id: this.globals.inbox.id }))[0];
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

after(async function () {
	await ngrok.kill();

	if (this.server) {
		this.server.close();
	}
});
