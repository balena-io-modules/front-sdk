export interface TestKeys {
	apiKey: string;
	testAuthor: string;
	testAuthorId: string;
	testChannel: string;
	testConversationId: string;
	testCommentId: string;
	testInbox: string;
	testInboxId?: string;
	testMessageId?: string;
	testMessageConvRef?: string;
	testMessageResponse?: string;
	testMessageSubject?: string;
	testTopicIssue: {
		owner: string;
		repo: string;
		issue: number;
	};
}

export class VaultKeeper {
	private testKeys: TestKeys;

	constructor(varName: string) {
		// Load the test keys
		this.testKeys = JSON.parse(Buffer.from(varName, 'base64').toString());
	}

	get keys(): TestKeys {
		return this.testKeys;
	}
}

const keeper = new VaultKeeper(process.env.FRONT_TEST_KEYS);

export function getKeeper() {
	return keeper;
}
