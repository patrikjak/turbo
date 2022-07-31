class Select {

    constructor() {
        const turboClass = require('./turbo');
        this.turbo = new turboClass();
    }

    /**
     * init custom selects
     * hide original select element and show custom
     * original select element must be in wrapper with classes .turbo-ui.select
     * if original select has .searchable class, custom select will be searchable
     * additional rendered select element should be initiated with reloadDefaults parameter set to true
     * @param selector
     * @param reloadDefaults
     */
    initSelects(selector = document, reloadDefaults = false) {
        const selects = selector.querySelectorAll('.turbo-ui.select');

        if (selects) {
            for (let i = 0; i < selects.length; i++) {
                const turboSelectWrapper = selects[i];
                const select = turboSelectWrapper.querySelector('select');

                if (select) {
                    const selectId = `turbo-select-${i + 1}`;
                    this.makeCustomSelect(turboSelectWrapper, selectId, reloadDefaults);
                    this.bindOpenOptions(turboSelectWrapper);
                }
            }
        }
    }

    /**
     * create html elements for select and append it after original select element
     * @param turboSelectWrapper
     * @param id
     * @param reloadDefaults
     */
    makeCustomSelect(turboSelectWrapper, id, reloadDefaults) {
        const realSelect = turboSelectWrapper.querySelector('select');
        const realLabel = turboSelectWrapper.querySelector('label');
        const searchable = realSelect.classList.contains('searchable');

        const options = Array.from(realSelect.options);

        const turboSelectElement = this.turbo.createElement('div', null, {
            class: ['turbo-select'],
            id: id,
        });

        const selectionWrapper = this.turbo.createElement('div', null, {
            class: ['options-wrapper'],
        });

        const labelClasses = ['label'];

        if (searchable) {
            labelClasses.push('search');
        }

        const label = this.turbo.createElement('span', (searchable ? null : realLabel.textContent), {
            class: labelClasses,
            dataset: {
                default: realLabel.textContent,
            }
        });

        if (searchable) {
            const searchInput = this.turbo.createElement('input', null, {
                placeholder: realLabel.textContent,
                id: 'options-search',
                autocomplete: 'off'
            });

            this.turbo.showElement(searchInput, label, 'append', 'block', {});
        }

        const optionsWrapper = this.turbo.createElement('div', null, {
            class: ['options'],
        });

        const defaultOptions = [];

        for (let i = 0; i < options.length; i++) {
            const realOption = options[i];
            let disabled = false;

            if (realOption.hasAttribute('disabled')) {
                disabled = true;
            }

            if (realOption) {
                const optionText = realOption.textContent;
                const optionValue = realOption.value;
                const optionClass = [];

                let optionAttributes = {
                    dataset: {
                        value: optionValue,
                    },
                };

                if (disabled) {

                    if (this.turbo.settings.select.hideDisabledOptions) {
                        continue;
                    }

                    optionClass.push('disabled');

                    optionAttributes.class = optionClass;
                }

                const option = this.turbo.createElement('span', optionText, optionAttributes);

                defaultOptions.push({
                    text: optionText,
                    value: optionValue,
                    attributes: {
                        class: optionClass
                    },
                });

                this.turbo.showElement(option, optionsWrapper, 'append', 'block', {});
            }
        }

        const arrow = this.turbo.createElement('div', null, {
            class: ['dropdown-arrow'],
        });

        for (let i = 0; i < 2; i++) {
            this.turbo.showElement(this.turbo.createElement('span', null, {
                class: ['arrow-part']
            }), arrow, 'append', 'block', {});
        }

        this.turbo.showElement(label, selectionWrapper, 'prepend', 'block', {});
        this.turbo.showElement(optionsWrapper, selectionWrapper, 'append', 'none', {});
        this.turbo.showElement(selectionWrapper, turboSelectElement, 'append', 'flex', {});
        this.turbo.showElement(arrow, turboSelectElement, 'append', 'flex', {});

        this.turbo.showElement(turboSelectElement, turboSelectWrapper, 'append', 'flex', {});

        this.setDefaultOptions(defaultOptions, id, reloadDefaults);
    }

    /**
     * set default options to sessionStorage
     * @param options
     * @param selectId
     * @param refresh
     */
    setDefaultOptions(options, selectId, refresh) {
        const allDefaults = sessionStorage.getItem('turbo-select');

        if (allDefaults) {
            sessionStorage.setItem('turbo-select', JSON.stringify({}));
        }

        const parsedAllDefaults = JSON.parse(allDefaults);
        const defaultOptions = {};

        if (!refresh) {
            for (let existingSelectId in parsedAllDefaults) {
                defaultOptions[existingSelectId] = parsedAllDefaults[existingSelectId];
            }
        }

        defaultOptions[selectId] = options;

        sessionStorage.setItem('turbo-select', JSON.stringify(defaultOptions));
    }

    /**
     * get default options for select with specific id
     * @param selectId
     * @return {*[]}
     */
    getDefaultOptions(selectId) {
        let defaults = sessionStorage.getItem('turbo-select');

        defaults = JSON.parse(defaults);

        return defaults[selectId] ?? [];
    }

    /**
     * bind opening
     * @param turboSelectWrapper
     */
    bindOpenOptions(turboSelectWrapper) {
        if (turboSelectWrapper.querySelector('.turbo-select')) {
            turboSelectWrapper.querySelector('.turbo-select .options-wrapper').addEventListener('click', e => {
                const turboSelect = e.target.closest('.turbo-ui .turbo-select');

                e.stopPropagation();

                if (e.target.nodeName === 'DIV' || e.target.nodeName === 'INPUT') {
                    this.toggleOptions(e, turboSelect);
                } else {
                    const disabledOption = e.target.classList.contains('disabled');

                    if (!disabledOption && this.turbo.getData(e.target, 'value') !== this.turbo.settings.select.notFoundOptionValue) {
                        this.closeOptions(turboSelect.querySelector('.options'), e.target);
                    }
                }
            });

            turboSelectWrapper.querySelector('.turbo-select .dropdown-arrow').addEventListener('click', e => {
                e.stopPropagation();
                this.toggleOptions(e, e.target.closest('.turbo-ui .turbo-select'));
            });

            turboSelectWrapper.querySelector('label').addEventListener('click', e => {
                e.stopPropagation();
                e.preventDefault();
                this.toggleOptions(e, turboSelectWrapper.querySelector('.turbo-select'));
            });
        }
    }

    /**
     * open and close options
     * @param e event
     * @param turboSelect
     */
    toggleOptions(e, turboSelect) {
        const options = turboSelect.querySelector('.options');
        const selectWrapper = turboSelect.closest('.turbo-ui.select');
        const searchable = selectWrapper.querySelector('select').classList.contains('searchable');
        const optionsClasses = options.classList;
        const open = !optionsClasses.contains('opened');

        if (open) {
            this.openOptions(options);
        } else {
            const optionElements = options.querySelectorAll('span');
            let selectedElement = null;
            let selectedText = '';

            if (searchable && this.turbo.getData(turboSelect, 'selected') ||
                (optionElements.length === 1 && this.turbo.getData(optionElements[0], 'value') === this.turbo.settings.select.notFoundOptionValue)) {

                if (e.target.classList.contains('dropdown-arrow')) {
                    this.closeOptions(options, (this.findSelected(options, true)));
                }

                return;
            }

            for (let i = 0; i < optionElements.length; i++) {
                const option = optionElements[i];

                if (option.classList.contains('active')) {
                    selectedElement = option;
                    selectedText = option.textContent;
                }
            }

            if (searchable) {
                if (!this.turbo.isEmpty(selectedText)) {
                    turboSelect.querySelector('input#options-search').value = selectedText;
                }
            }

            this.closeOptions(options, selectedElement);
        }
    }

    /**
     * open options and bind close on clicking away
     * @param options
     */
    openOptions(options) {
        const wrapper = options.closest('.turbo-ui.select');
        const searchable = wrapper.querySelector('select').classList.contains('searchable');

        if (searchable) {
            const label = options.closest('.options-wrapper').querySelector('.label');
            const searchInput = label.querySelector('#options-search');
            const text = searchInput.value;
            const selectedOption = this.findSelected(options);

            if (!this.turbo.isEmpty(text)) {
                searchInput.value = '';
                searchInput.setAttribute('placeholder', text);
            }

            label.classList.remove('selected');

            this.filterOptions(searchInput, searchInput.value, selectedOption);
        }

        this.turbo.toggleAnimationClass(options, 'animation-slide-in-top', 150);

        options.style.display = 'block';
        options.classList.add('opened');

        const _this = this;

        document.addEventListener('click', function closeOptionsFromOutside() {
            const turboClass = require('./turbo');
            const turbo = new turboClass();
            let selectedOptionElement = null;

            if (options.classList.contains('opened')) {
                if (searchable) {
                    const selectWrapper = options.closest('.turbo-select');

                    const label = options.closest('.options-wrapper').querySelector('span.label');
                    const searchInput = label.querySelector('#options-search');
                    let optionElements =  options.querySelectorAll('span');
                    const selectedValue = turbo.getData(selectWrapper, 'selected');

                    if (!selectedValue) {
                        const defaultOptions = _this.getDefaultOptions(options.closest('.turbo-select').id);
                        const founded = _this.selectFilter(searchInput.value.toLowerCase(), defaultOptions, true);

                        if (!turbo.isEmpty(founded)) {
                            return _this.selectFirstOption(options, true);
                        } else {
                            const defaultPlaceholder = turbo.getData(label, 'default');

                            searchInput.value = '';
                            searchInput.setAttribute('placeholder', defaultPlaceholder);

                            searchInput.closest('.label').classList.remove('selected');
                        }
                    }

                    _this.resetOptions(selectWrapper);

                    optionElements = options.querySelectorAll('span');

                    for (let i = 0; i < optionElements.length; i++) {
                        const option = optionElements[i];

                        if (!turbo.isEmpty(selectedValue) && turbo.getData(option, 'value') === selectedValue) {
                            selectedOptionElement = option;

                            break;
                        }
                    }
                }
            }

            _this.closeOptions(options, selectedOptionElement);

            document.removeEventListener('click', closeOptionsFromOutside);
        });
    }

    /**
     * close options
     * @param options
     * @param selectedElement
     */
    closeOptions(options, selectedElement = null) {
        const realSelect = options.closest('.turbo-ui.select').querySelector('select');
        const searchable = realSelect.classList.contains('searchable');
        const label = options.closest('.options-wrapper').querySelector('.label');
        const selectWrapper = options.closest('.turbo-select');

        if (searchable) {
            this.resetOptions(selectWrapper, selectedElement);

            if (!selectedElement) {
                selectedElement = this.findSelected(options, true);
            }
        }

        if (selectedElement) {
            const selectedValue = this.turbo.getData(selectedElement, 'value');
            const selectedText = selectedElement.textContent;

            if (searchable) {
                const searchInput = label.querySelector('#options-search');

                searchInput.value = selectedText;
                searchInput.setAttribute('placeholder', selectedText);
            } else {
                label.textContent = selectedText;
            }

            const optionElements = options.querySelectorAll('span');

            for (let i = 0; i < optionElements.length; i++) {
                const option = optionElements[i];

                option.classList.remove('active');
            }

            label.classList.add('selected');
            options.querySelector(`span[data-value="${this.turbo.getData(selectedElement, 'value')}"]`).classList.add('active');
            realSelect.value = selectedValue;
            selectWrapper.dataset['selected'] = selectedValue;
        }

        this.turbo.toggleAnimationClass(options, 'animation-slide-out-top', 150);

        setTimeout(() => {
            options.style.display = 'none';
        }, 150);

        options.classList.remove('opened');
    }

    /**
     * reset options to default
     * @param selectWrapper
     * @param selectedElement
     */
    resetOptions(selectWrapper, selectedElement = null) {
        const optionsWrapper = selectWrapper.querySelector('.options');
        const options = optionsWrapper.querySelectorAll('span');

        for (let i = 0; i < options.length; i++) {
            options[i].remove();
        }

        const defaultOptions = this.getDefaultOptions(selectWrapper.getAttribute('id'));

        this.showFilteredOptions(optionsWrapper, defaultOptions, selectedElement, false);
    }

    /**
     * find selected option
     * @param options
     * @param getElement
     * @return {string|null|*}
     */
    findSelected(options, getElement = false) {
        options = options.querySelectorAll('span');

        for (let i = 0; i < options.length; i++) {
            const option = options[i];

            if (option.classList.contains('active')) {
                if (getElement) {
                    return option;
                }

                return this.turbo.getData(option, 'value');
            }
        }

        return null;
    }

    /**
     * filter options, available with .searchable class only
     * @param searchInput
     * @param originValue
     * @param selectedValue
     */
    filterOptions(searchInput, originValue, selectedValue = null) {
        const selectId = searchInput.closest('.turbo-select').id;
        const optionsElement = searchInput.closest('.options-wrapper').querySelector('.options');
        const defaultOptions = this.getDefaultOptions(selectId);

        if (originValue === '') {
            this.showFilteredOptions(optionsElement, defaultOptions, selectedValue);
        }

        searchInput.addEventListener('input', () => {
            let searchFor = searchInput.value.toLowerCase();
            let filteredOptions = this.selectFilter(searchFor, defaultOptions);

            if (searchFor !== '') {
                searchInput.closest('.label').classList.add('selected');
            } else {
                searchInput.closest('.label').classList.remove('selected');
            }

            this.showFilteredOptions(optionsElement, filteredOptions, selectedValue);
        });
    }

    /**
     * Filter options
     * @param searchFor
     * @param options
     * @param realFilter means empty searchFor returns empty array
     * @return {*[]}
     */
    selectFilter(searchFor, options, realFilter = false) {
        let filtered = [];

        if (realFilter && searchFor === '') {
            return filtered;
        }

        for (let i = 0; i < options.length; i++) {
            const optionValue = options[i].value;
            const optionText = options[i].text;
            const searchableText = optionText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
            const searchableValue = optionValue.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

            const optionData = {
                value: optionValue,
                text: optionText,
                attributes: options[i].attributes,
            };
            
            if (searchableText.indexOf(searchFor) > -1) {
                filtered[i] = optionData;
            }

            if (this.turbo.settings.select.searchAlsoValue && searchableValue.indexOf(searchFor) > -1 && this.turbo.isEmpty(filtered[i])) {
                filtered[i] = optionData;
            }
        }

        return filtered.filter(item => item !== undefined);
    }

    /**
     *
     * @param optionsElement
     * @param options
     * @param selectedValue
     * @param show
     */
    showFilteredOptions(optionsElement, options, selectedValue = null, show = true) {
        const optionElements = optionsElement.querySelectorAll('span');

        for (let i = 0; i < optionElements.length; i++) {
            optionElements[i].remove();
        }

        if (this.turbo.isEmpty(options)) {
            const option = this.turbo.createElement('span', this.turbo.settings.text.notFound, {
                dataset: {
                    value: this.turbo.settings.select.notFoundOptionValue,
                },
            });

            this.turbo.showElement(option, optionsElement, 'append', 'block', {});
        } else {
            for (let i = 0; i < options.length; i++) {
                const option = options[i];
                const disabledOption = option.attributes?.class.includes('disabled');
                let disabled = false;

                if (disabledOption) {

                    if (this.turbo.settings.select.hideDisabledOptions) {
                        continue;
                    }

                    disabled = true;
                }

                const optionAttributes = {
                    dataset: {
                        value: option.value,
                    },
                };

                if (disabled) {
                    optionAttributes.class = ['disabled'];
                }

                if (selectedValue && option.value === selectedValue) {
                    optionAttributes.class = ['active'];
                }

                const optionElement = this.turbo.createElement('span', this.turbo.capitalizeFirstLetter(option.text), optionAttributes);

                this.turbo.showElement(optionElement, optionsElement, 'append', (show ? 'block' : 'none'), {});
            }
        }
    }

    /**
     * select first option from current options
     * @param optionsElement
     * @param searchable
     */
    selectFirstOption(optionsElement, searchable) {
        const firstOption = optionsElement.querySelectorAll('span')[0];

        if (searchable) {
            this.closeOptions(optionsElement, firstOption);
        }
    }
}

module.exports = Select;