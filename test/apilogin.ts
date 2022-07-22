import * as chai from 'chai';
import ChaiAsPromised from 'chai-as-promised';
import 'mocha';
import { Front, FrontError, Inboxes } from '../lib/index';

chai.use(ChaiAsPromised);
chai.should();

describe('Login', function () {
	it('should fail a request with a bad key', function () {
		const inst = new Front('badkey');

		return inst.inbox
			.list()
			.then(function (_response: Inboxes) {
				throw new Error('Should not have made request correctly!');
			})
			.catch(FrontError, (err: FrontError) => {
				err.name.should.eq('FrontError');
				err.status?.should.eq(401);
				err.title?.should.eq('Unauthenticated');
			});
	});
});
