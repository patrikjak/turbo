import Turbo from "./turbo";

class Validator {

    constructor() {

        this.turbo = new Turbo();

        this.rulesErrors = {
            required: 'Field {fieldName} is required',
            string: 'Field {fieldName} must be a string',
            integer: 'Field {fieldName} must be a number',
            max: 'Maximal length of field {fieldName} is {additionalValue}',
            min: 'Minimal length of field {fieldName} is {additionalValue}',
            maxNum: 'Maximum number is {additionalValue}',
            minNum: 'Minimum number is {additionalValue}',
            email: 'This e-mail is not valid',
            accepted: 'Your consent with {fieldName} is required',
            selected: 'At least one option must be selected',
        };

        this.rulesMethods = {
            required: this.notEmpty,
            string: this.isString,
            integer: this.isNumber,
            max: this.maxLength,
            min: this.minLength,
            maxNum: this.maxNumber,
            minNum: this.minNumber,
            email: this.email,
            accepted: this.accepted,
            selected: this.selected,
        };
    }

    // RULES

    notEmpty(testValue) {
        return !(testValue === '');
    }

    isString(testValue) {
        return typeof testValue === 'string';
    }

    isNumber(testValue) {
        return typeof testValue === 'number';
    }

    maxLength(testValue, max) {
        return testValue.length <= max;
    }

    minLength(testValue, min) {
        return testValue.length >= min;
    }

    maxNumber(testValue, max) {
        return testValue <= max;
    }

    minNumber(testValue, min) {
        return testValue >= min;
    }

    email(testValue) {
        return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])/.test(testValue);
    }

    accepted(testValue) {
        return !!testValue;
    }

    selected(testValue) {
        return !this.turbo.isEmpty(testValue);
    }

    // END OF RULES

    validate(form, validationRules, stopAfterFirst = false, showErrors = true) {
        const formData = this.turbo.collectFormData(form);

        const validationData = this.addValidationRules(formData, validationRules);
        const validator = this.validator(validationData, stopAfterFirst);

        this.hideFormErrors(form);

        if (!validator.valid) {
            if (showErrors) {
                this.showFormErrors(form, validator.errors);
            }

            return false;
        }

        return true;
    }

    addValidationRules(formData, rules) {
        let preparedToValidate = {};

        for (const inputName in formData) {
            const niceInputName = inputName.replace('[]', '');

            preparedToValidate[niceInputName] = {
                value: formData[inputName],
                rules: rules[niceInputName],
            };
        }
        
        return preparedToValidate;
    }

    validator(validationData, stopAfterFirst) {
        const data = {};
        let valid = true;

        if (!this.turbo.isEmpty(validationData)) {
            for (const inputName in validationData) {
                if (typeof validationData[inputName].rules !== 'undefined') {
                    const validation = this.validateData(inputName, validationData[inputName]);

                    if (!validation.valid) {
                        valid = false;
                        data[inputName] = validation.error;

                        if (stopAfterFirst) {
                            break;
                        }
                    }
                }
            }
        }

        return {
            valid: valid,
            errors: data,
        }
    }

    /**
     * Validate
     * @param inputName
     * @param validationData - data and rules
     */
    validateData(inputName, validationData) {
        const testValue = validationData['value'];
        const rules = validationData['rules'];
        const validation = {
            rules: rules,
            fieldName: '',
            error: '',
        };

        if (this.turbo.isObject(rules)) {
            validation.rules = validationData.rules.rules ? validationData.rules.rules : [];

            if (rules.hasOwnProperty('fieldName')) {
                validation.fieldName = validationData.rules.fieldName;
            }

            if (rules.hasOwnProperty('error') && !this.turbo.isEmpty(rules.error)) {
                validation.error = rules.error;
            }
        }

        validation.rules = validation.rules.split('|');
        
        if (validation.rules.length > 0) {
            for (const rule of validation.rules) {
                let valid, ruleName, additionalValue;
                [valid, ruleName, additionalValue] = [true, rule, ''];
                const colonIndex = rule.indexOf(':');

                if (colonIndex > -1) {
                    ruleName = rule.substr(0, colonIndex);
                    additionalValue = rule.substr(colonIndex);
                    valid = this.rulesMethods[ruleName].bind(this, testValue, additionalValue)();
                } else {
                    valid = this.rulesMethods[ruleName].bind(this, testValue)();
                }

                let ruleError = this.rulesErrors[ruleName];

                if (validation.error === '') {
                    if (!valid && ruleError.indexOf('{additionalValue}') > -1) {
                        ruleError = ruleError.replace('{additionalValue}', additionalValue);
                    }

                    if (!valid && ruleError.indexOf('{fieldName}') > -1 && validation.fieldName) {
                        ruleError = ruleError.replace('{fieldName}', `"${validation.fieldName}"`);
                    }
                } else {
                    ruleError = validation.error;
                }

                return {
                    valid: valid,
                    error: ruleError,
                };
            }
        }
    }

    showFormErrors(form, errors, turboStructure = true) {
        form = this.turbo.beNode(form);

        for (const inputName in errors) {
            let input = form.querySelector(`[name="${inputName}"]`);
            let multiselectInput = form.querySelector(`[name="${inputName}[]"]`);
            const error = this.getErrorWithFieldName(input, errors[inputName]);

            if (!input && multiselectInput) {
                input = multiselectInput;
            }

            let errorElement = this.turbo.createElement('p', error, {
                class: ['input-error'],
            });

            if (input) {
                if (turboStructure) {
                    this.turbo.showElement(errorElement, input.closest('.turbo-ui'));
                } else {
                    this.turbo.showElement(errorElement, input, 'insertAfter');
                }
            }
        }
    }

    getErrorWithFieldName(input, error) {
        if (error.indexOf('{fieldName}') > -1) {
            const label = input.parentElement.querySelector('label').textContent;

            error = error.replace('{fieldName}', `"${label}"`);
        }

        return error;
    }

    hideFormErrors(form) {
        form = this.turbo.beNode(form);
        const errors = form.querySelectorAll('.input-error');

        if (errors) {
            for (let i = 0; i < errors.length; i++) {
                errors[i].remove();
            }
        }
    }

}

export default Validator;