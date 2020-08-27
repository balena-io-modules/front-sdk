export interface TestKeys {
	apiKey: string;
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

const frontTestKeys = process.env.FRONT_TEST_KEYS;

if (!frontTestKeys) {
	throw new Error('Critical environment variable `FRONT_TEST_KEYS` is missing');
}

const keeper = new VaultKeeper(frontTestKeys);

export function getKeeper() {
	return keeper;
}
