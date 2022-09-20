const Turbo = require('./src/turbo');
const Select = require('./src/select');
const Validator= require('./src/validator');

const turboInstance = new Turbo();
const selectInstance = new Select();
const validatorInstance = new Validator();

module.exports = {
    turbo: turboInstance,
    select: selectInstance,
    validator: validatorInstance,
}