"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VaultKeeper = (function () {
    function VaultKeeper(varName) {
        this.testKeys = JSON.parse(Buffer.from(varName, 'base64').toString());
    }
    Object.defineProperty(VaultKeeper.prototype, "keys", {
        get: function () {
            return this.testKeys;
        },
        enumerable: true,
        configurable: true
    });
    return VaultKeeper;
}());
exports.VaultKeeper = VaultKeeper;
var frontTestKeys = process.env.FRONT_TEST_KEYS;
if (!frontTestKeys) {
    throw new Error('Critical environment variable `FRONT_TEST_KEYS` is missing');
}
var keeper = new VaultKeeper(frontTestKeys);
function getKeeper() {
    return keeper;
}
exports.getKeeper = getKeeper;

//# sourceMappingURL=keeper.js.map
