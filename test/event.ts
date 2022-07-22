// Needed due to chai's should.exist
/* tslint:disable: no-unused-expression */
import * as chai from 'chai';
import ChaiAsPromised from 'chai-as-promised';
import express from 'express';
import 'mocha';
import { Front } from '../lib/index';
import { getKeeper } from './keeper';

chai.use(ChaiAsPromised);
chai.should();

describe('Events', function () {
	const vaultKeeper = getKeeper();
	const keys = vaultKeeper.keys;
	let frontInst: Front;

	before(function () {
		frontInst = new Front(keys.apiKey, 'madeupkey');
	});

	it('should fail as no secret key is set', function (done) {
		const brokenInst = new Front(keys.apiKey);
		try {
			brokenInst.registerEvents({ port: 1234 }, () => {
				done('Should not have received an event');
			});
		} catch (err: any) {
			err.message.should.eq('No secret key registered');
			done();
		}
	});

	it('should fail as neither the port or server instance are set', function (done) {
		try {
			frontInst.registerEvents({}, () => {
				done('Should not have received an event');
			});
		} catch (err: any) {
			err.message.should.eq(
				'Pass either an Express instance or a port to listen on',
			);
			done();
		}
	});

	it('should fail as both the port or server instance are set', function (done) {
		try {
			frontInst.registerEvents({ server: express(), port: 1234 }, () => {
				done('Should not have received an event');
			});
		} catch (err: any) {
			err.message.should.eq(
				'Pass either an Express instance or a port to listen on',
			);
			done();
		}
	});

	it('should start a new server on port 1234 then exit', function (done) {
		const expressInst = frontInst.registerEvents({ port: 1234 }, () => {
			done('Should not have received an event');
		});
		if (expressInst) {
			setTimeout(function () {
				expressInst.close();
				done();
			}, 2000);
		} else {
			done('Should have been returned an Express instance');
		}
	});

	it('should listen on existing server then exit', function (done) {
		const expressInst = express();
		const httpServer = expressInst.listen(1234);
		frontInst.registerEvents({ server: expressInst }, () => {
			done('Should not have received an event');
		});
		setTimeout(function () {
			httpServer.close();
			done();
		}, 2000);
	});
});
