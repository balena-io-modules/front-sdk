// Needed due to chai's should.exist
/* tslint:disable: no-unused-expression */
import * as chai from 'chai';
import * as ChaiAsPromised from 'chai-as-promised';
import 'mocha';
import { Teammate, Teammates } from '../lib';

chai.use(ChaiAsPromised);
chai.should();

describe('Teammates', function () {
	let teammateId: string;
	let priorName: string;

	it('should list teammates', function() {
		return this.globals.front.teammate.list(
		).then(function (teammates: Teammates) {
			teammates._results.should.exist;
			teammates._results.length.should.be.gt(0);
			teammateId = teammates._results[0].id;
			priorName = teammates._results[0].first_name;
		});
	});

	it('should get the first teammate from above', function() {
		return this.globals.front.teammate.get({
			teammate_id: teammateId
		}).then(function (teammate: Teammate) {
			teammate.id.should.eq(teammateId);
			teammate.first_name.should.eq(priorName);
		});
	});

	it('should update the first teammate from above', function () {
		return this.globals.front.teammate.update({
			first_name: 'test',
			teammate_id: teammateId,
		}).then(() => {
			return this.globals.front.teammate.get({
				teammate_id: teammateId,
			});
		}).then(function (teammate: Teammate) {
			teammate.first_name.should.eq('test');
		}).then(() => {
			return this.globals.front.teammate.update({
				first_name: priorName,
				teammate_id: teammateId
			});
		})
		.then(() => {
			return this.globals.front.teammate.get({
				teammate_id: teammateId
			});
		})
		.then(function (teammate: Teammate) {
			teammate.first_name.should.eq(priorName);
		});
	});
});
