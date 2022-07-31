const turbo = require('./src/turbo');
const select = require('./src/select');

const turboInstance = new turbo();
const selectInstance = new select();

module.exports = {
    turbo: turboInstance,
    select: selectInstance,
}