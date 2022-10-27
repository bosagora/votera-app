(function () {
    // Shim crypto.getRandomValues
    // @TOOD: Investigate: https://github.com/brix/crypto-js/issues/7
    if (!global.crypto) { global.crypto = { }; }
    if (!global.crypto.getRandomValues) {
        var expo_random = require('expo-random');
        if (typeof expo_random.getRandomBytes === 'function') {
            console.log('replace crypto.getRandomValues with expo_random');
            global.crypto.getRandomValues = function(buffer) {
                var values = expo_random.getRandomBytes(buffer.length);
                for (var i = 0; i < buffer.length; i++) {
                    buffer[i] = values[i];
                }
            }
        }
    }

    require('@ethersproject/shims');
})();
