import Turbo from "./src/turbo";
import Select from "./src/select";
import Validator from "./src/validator";

const turboInstance = new Turbo();
const selectInstance = new Select();
const validatorInstance = new Validator();

export {
    turboInstance as turbo,
    selectInstance as select,
    validatorInstance as validator,
};