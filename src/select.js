class Select {

    constructor() {
        const turboClass = require('./turbo');

        this.turbo = new turboClass();
        this.selects = {};
        this.custom = {};
        this.animationSettings = {
            open: 'animation-slide-in-top',
            close: 'animation-slide-out-top',
            duration: 150,
        }
    }

    initSelects() {
        const selects = document.querySelectorAll('.turbo-ui.select');

        if (selects) {
            for (let i = 0; i < selects.length; i++) {
                const turboSelectWrapper = selects[i];
                const selectElement = turboSelectWrapper.querySelector('select');

                if (selectElement) {
                    const turboSelectId = `turbo-select-${i + 1}`;
                    this.generateTurboSelect(turboSelectWrapper, turboSelectId);
                    this.bindSelectActions(turboSelectWrapper);
                }
            }
        }
    }

    generateTurboSelect(turboSelectWrapper, turboSelectId) {
        const realSelect = turboSelectWrapper.querySelector('select');
        const realLabel = turboSelectWrapper.querySelector('label');
        const searchable = realSelect.classList.contains('searchable');
        const multiselect = realSelect.classList.contains('multiselect');
        const wrapperId = turboSelectWrapper.getAttribute('id');
        const customSettings = this.custom[wrapperId]?.settings;
        const options = Array.from(realSelect.options);
        const selectOptions = {
            searchable: searchable,
            multiselect: multiselect,
        }
        const mainElements = this.generateMainElements(turboSelectId, selectOptions, realLabel.textContent);
        const defaultOptions = this.getOptionsInfo(options, customSettings);
        const generatedOptions = this.generateOptions(defaultOptions);

        this.showOptionsInWrapper(mainElements.optionsWrapper, generatedOptions);

        this.turbo.showElement(mainElements.label, mainElements.selectionWrapper, 'prepend', 'block', {});
        this.turbo.showElement(mainElements.optionsWrapper, mainElements.selectionWrapper, 'append', 'none', {});
        this.turbo.showElement(mainElements.selectionWrapper, mainElements.turboSelectElement, 'append', 'flex', {});
        this.turbo.showElement(mainElements.arrow, mainElements.turboSelectElement, 'append', 'flex', {});

        // final select
        this.turbo.showElement(mainElements.turboSelectElement, turboSelectWrapper, 'append', 'flex', {});

        this.createInstance(defaultOptions, turboSelectId, (mainElements.label ? realLabel.textContent : null), searchable, multiselect);
    }

    generateMainElements(turboSelectId, selectOptions, labelText) {
        const turboSelectElement = this.turbo.createElement('div', null, {
            class: ['turbo-select'],
            id: turboSelectId,
        });

        const selectionWrapper = this.turbo.createElement('div', null, {
            class: ['options-wrapper'],
        });

        const label = this.generateLabel(labelText, selectOptions.searchable);

        const optionsWrapper = this.turbo.createElement('div', null, {
            class: ['options'],
        });

        const arrow = this.turbo.createElement('div', null, {
            class: ['dropdown-arrow'],
        });

        for (let i = 0; i < 2; i++) {
            this.turbo.showElement(this.turbo.createElement('div', null, {
                class: ['arrow-part'],
            }), arrow, 'append', 'block', {});
        }

        return {
            turboSelectElement: turboSelectElement,
            selectionWrapper: selectionWrapper,
            label: label,
            optionsWrapper: optionsWrapper,
            arrow: arrow,
        };
    }

    generateLabel(labelText, searchable) {
        const labelClasses = ['label'];

        if (searchable) {
            labelClasses.push('search');
        }

        const label = this.turbo.createElement('div', (searchable ? null : labelText), {
            class: labelClasses,
        });

        if (searchable) {
            const searchInput = this.turbo.createElement('input', null, {
                placeholder: labelText,
                id: 'options-search',
                autocomplete: 'off'
            });

            this.turbo.showElement(searchInput, label, 'append', 'block', {});
        }

        return label
    }

    generateNotFoundOptionInfo(selectId) {
        const value = this.selects[selectId].settings.notFoundOptionValue;

        return {
            text: this.turbo.settings.text.notFound,
            value: value,
            attributes: {
                dataset: {
                    value: value,
                },
                class: ['disabled', 'not-found-option'],
            },
            disabled: true,
            notFoundOption: true,
        };
    }

    getOptionsInfo(arrayOfRealOptions, customSelectSettings) {
        const optionsInfo = [];

        for (let i = 0; i < arrayOfRealOptions.length; i++) {
            const realOption = arrayOfRealOptions[i];
            let disabled = false;

            if (realOption.hasAttribute('disabled')) {
                disabled = true;
            }

            if (realOption) {
                const optionText = realOption.textContent;
                const optionValue = realOption.value;

                let optionAttributes = {
                    dataset: {
                        value: optionValue,
                    },
                    class: [],
                };

                if (disabled) {
                    if ((this.turbo.settings.select.hideDisabledOptions && !customSelectSettings) || customSelectSettings?.hideDisabledOptions) {
                        continue;
                    }

                    optionAttributes.class = ['disabled'];
                }

                optionsInfo.push({
                    text: optionText,
                    value: optionValue,
                    attributes: {
                        class: optionAttributes.class,
                        dataset: optionAttributes.dataset,
                    },
                    disabled: disabled,
                });
            }
        }

        return optionsInfo;
    }

    generateOptions(options) {
        const arrayOfOptions = [];

        for (let i = 0; i < options.length; i++) {
            const option = options[i];

            arrayOfOptions.push(this.turbo.createElement('div', option.text, option.attributes));
        }

        return arrayOfOptions;
    }

    showOptionsInWrapper(wrapper, arrayOfOptions) {
        for (let i = 0; i < arrayOfOptions.length; i++) {
            this.turbo.showElement(arrayOfOptions[i], wrapper, 'append', 'block', {});
        }
    }

    createInstance(options, id, defaultLabel, searchable, multiselect) {
        const select = document.querySelector(`#${id}`);
        const turboSelectWrapper = select.closest('.turbo-ui.select');
        const wrapperId = turboSelectWrapper.getAttribute('id');

        this.selects[id] = {
            id: id,
            wrapperId: wrapperId && this.custom[wrapperId]?.customId ? this.custom[wrapperId]?.customId : null,
            wrapper: select,
            defaultOptions: options,
            options: options,
            settings: {
                searchAlsoValue: wrapperId && this.custom[wrapperId]?.settings?.searchAlsoValue ? this.custom[wrapperId]?.settings?.searchAlsoValue : this.turbo.settings.select.searchAlsoValue,
                notFoundOptionValue: wrapperId && this.custom[wrapperId]?.settings?.notFoundOptionValue ? this.custom[wrapperId]?.settings?.notFoundOptionValue : this.turbo.settings.select.notFoundOptionValue,
                hideDisabledOptions: wrapperId && this.custom[wrapperId]?.settings?.hideDisabledOptions ? this.custom[wrapperId]?.settings?.hideDisabledOptions : this.turbo.settings.select.hideDisabledOptions,
            },
            defaultLabel: defaultLabel,
            selectedOption: null,
            searchable: searchable,
            multiselect: multiselect,
        };
    }

    isSearchable(selectId) {
        return this.selects[selectId].searchable;
    }

    isMultiselect(selectId) {
        return this.selects[selectId].multiselect;
    }

    bindSelectActions(turboSelectWrapper) {
        const selectWrapper = turboSelectWrapper.querySelector('.turbo-select');

        if (selectWrapper) {
            const optionsWrapper = turboSelectWrapper.querySelector('.turbo-select .options-wrapper');
            const options = optionsWrapper.querySelectorAll('.options div');
            const dropdownArrow = turboSelectWrapper.querySelector('.turbo-select .dropdown-arrow');
            const selectId = selectWrapper.id;

            optionsWrapper.addEventListener('click', e => {
                e.stopPropagation();
                this.toggleOptions(turboSelectWrapper, selectId);
            });

            dropdownArrow.addEventListener('click', e => {
                e.stopPropagation();
                this.toggleOptions(turboSelectWrapper, selectId);
            });

            this.bindSelection(options, selectId);

            if (this.isSearchable(selectId)) {
                const searchInput = optionsWrapper.querySelector('#options-search');

                this.bindFiltering(searchInput, selectId);
            }
        }
    }

    bindSelection(options, selectId) {
        for (let i = 0; i < options.length; i++) {
            const option = options[i];

            option.addEventListener('click', e => {
                e.stopPropagation();
                this.selectOption(option, selectId);
            });
        }
    }

    toggleOptions(turboSelectWrapper, selectId) {
        const options = turboSelectWrapper.querySelector('.options');
        const open = !options.classList.contains('opened');

        if (open) {
            this.openOptions(options, selectId);
        } else {
            this.reselectOption(selectId);
            this.closeOptions(options);
        }
    }

    openOptions(options, selectId) {
        const searchable = this.isSearchable(selectId);

        if (searchable) {
            const label = options.closest('.options-wrapper').querySelector('.label');
            const searchInput = label.querySelector('#options-search');
            const actualValue = searchInput.value;

            if (!this.turbo.isEmpty(actualValue)) {
                searchInput.value = '';
                searchInput.setAttribute('placeholder', actualValue);
            }
        }

        this.turbo.toggleAnimationClass(options, 'animation-slide-in-top', this.animationSettings.duration);
        options.style.display = 'block';
        options.classList.add('opened');

        this.bindCloseOptionsFromOutside(options, selectId);
    }

    closeOptions(options) {
        options.classList.remove('opened');
        this.turbo.toggleAnimationClass(options, 'animation-slide-out-top', this.animationSettings.duration);

        setTimeout(() => {
            options.style.display = 'none';
        },this.animationSettings.duration);
    }

    bindCloseOptionsFromOutside(options, selectId) {
        const _this = this;

        document.addEventListener('click', function close() {
            if (options.classList.contains('opened')) {
                if (_this.shouldSelectFirstOption(selectId)) {
                    const firstOptionValue = _this.selects[selectId].options[0].value;

                    if (_this.canSelectOption(firstOptionValue, selectId)) {
                        _this.selectOption({value: firstOptionValue}, selectId);
                    }
                } else {
                    _this.reselectOption(selectId);
                    _this.closeOptions(options);
                }
            }

            document.removeEventListener('click', close);
        });
    }

    shouldSelectFirstOption(selectId) {
        if (this.selects[selectId].options.length === 1 && !this.areOptionsNotFound(selectId) && this.selects[selectId].selectedOption === null) {
            return true;
        }
    }

    areOptionsNotFound(selectId) {
        const firstOptionValue = this.selects[selectId].options[0].value;
        return !!this.getOptionInfoByValue(selectId, firstOptionValue)?.notFoundOption;
    }

    reselectOption(selectId) {
        const selectedOption = this.selects[selectId].selectedOption;
        const selectedValue = selectedOption?.value;

        if (selectedValue) {
            this.updateSelectedElement(selectId);
        }

        const selectedElement = selectedOption?.element;

        if ((selectedElement || selectedValue) && this.canSelectOption((selectedElement ?? selectedValue), selectId)) {
            this.selectOption((selectedElement ?? {value: selectedValue}), selectId, false);
        }
    }

    updateSelectedElement(selectId) {
        const selectedValue = this.selects[selectId].selectedOption?.value;

        if (selectedValue) {
            this.selects[selectId].selectedOption.element = document.querySelector(`#${selectId} div[data-value="${selectedValue}"]`);
        }
    }

    selectOption(option, selectId, triggerChange = true) {
        const turboSelectWrapper = this.selects[selectId].wrapper;
        const realSelect = turboSelectWrapper.closest('.turbo-ui.select').querySelector('select');
        const optionsWrapper = turboSelectWrapper.querySelector('.options');
        const label = turboSelectWrapper.querySelector('.label');
        const searchable = this.isSearchable(selectId);
        const multiselect = this.isMultiselect(selectId);

        if (this.canSelectOption(option, selectId)) {
            this.closeOptions(optionsWrapper);

            setTimeout(() => {
                this.unsetSelected(selectId);
                this.resetSelect(optionsWrapper, label, selectId);

                if (this.turbo.isObject(option) && !this.turbo.isNode(option) && option.value) {
                    option = optionsWrapper.querySelector(`div[data-value="${option.value}"]`);
                } else {
                    option = optionsWrapper.querySelector(`div[data-value="${this.turbo.getData(option, 'value')}"]`);
                }

                const selectedValue = this.turbo.getData(option, 'value');
                const selectedText = option.textContent;

                label.classList.add('selected');
                option.classList.add('active');

                this.selects[selectId].selectedOption = {
                    value: selectedValue,
                    text: selectedText,
                    element: option,
                };

                if (searchable) {
                    const searchInput = label.querySelector('#options-search');

                    searchInput.value = selectedText;
                    searchInput.setAttribute('placeholder', selectedText);
                } else {
                    label.textContent = selectedText;
                }

                realSelect.value = selectedValue;

                if (triggerChange) {
                    this.triggerChangeEvent(realSelect);
                }
            }, this.animationSettings.duration);
        }
    }

    unsetSelected(selectId) {
        this.selects[selectId].selectedOption = null;

        for (const defaultOption of this.selects[selectId].defaultOptions) {
            const newClasses = [...defaultOption.attributes.class];
            const activeClassIndex = newClasses.indexOf('active');

            if (activeClassIndex > -1) {
                newClasses.splice(activeClassIndex, 1);
            }

            defaultOption.attributes.class = newClasses;
        }
    }

    canSelectOption(option, selectId) {
        let selectedValue = option;

        if (this.turbo.isNode(option)) {
            selectedValue = this.turbo.getData(option, 'value');
        }

        const optionInfo = this.getOptionInfoByValue(selectId, selectedValue);

        if (optionInfo?.disabled) {
            return false;
        }

        if (optionInfo?.notFoundOption) {
            return false;
        }

        return true;
    }

    getOptionInfoByValue(selectId, value) {
        if (value === this.selects[selectId].settings.notFoundOptionValue) {
            return {
                notFoundOption: true,
            };
        }

        const optionInfo = this.selects[selectId].defaultOptions.filter(optionData => {
            return optionData.value === value;
        });

        if (optionInfo.length) {
            return optionInfo[0];
        }
    }

    isSelected(selectId, value) {
        return this.selects[selectId].selectedOption?.value === value;
    }

    resetSelect(optionsWrapper, label, selectId) {
        const options = optionsWrapper.querySelectorAll('div');
        const searchable = this.isSearchable(selectId);

        this.selects[selectId].selectedOption = null;

        label = this.generateLabel(this.selects[selectId].defaultLabel, searchable);

        for (let i = 0; i < options.length; i++) {
            const option = options[i];

            if (option.classList.contains('active')) {
                option.classList.remove('active');
            }
        }

        this.resetOptions(selectId);
    }

    resetOptions(selectId) {
        const turboSelectWrapper = this.selects[selectId].wrapper;
        const optionsWrapper = turboSelectWrapper.querySelector('.options');
        const actualOptions = optionsWrapper.querySelectorAll('div');
        let defaultOptions = this.selects[selectId].defaultOptions;

        defaultOptions = this.activateSelectedOptions(selectId, defaultOptions);
        const newOptions = this.generateOptions(defaultOptions);

        for (const actualOption of actualOptions) {
            actualOption.remove();
        }

        this.showOptionsInWrapper(optionsWrapper, newOptions, false);
        this.bindSelection(optionsWrapper.querySelectorAll('div'), selectId);
        this.selects[selectId].options = defaultOptions;
    }

    triggerChangeEvent(select) {
        const event = new Event('change');
        select.dispatchEvent(event);
    }

    bindFiltering(searchInput, selectId) {
        const options = searchInput.closest('.options-wrapper').querySelector('.options');

        searchInput.addEventListener('input', () => {
            const searchFor = searchInput.value.toLowerCase();
            const filtered = this.filterOptions(searchFor, selectId);

            this.replaceOptions(options, filtered, selectId);
        });
    }

    filterOptions(searchFor, selectId) {
        const options = this.selects[selectId].defaultOptions;
        let filtered = [];
        const usedValues = [];

        if (searchFor === '') {
            return options;
        }

        for (const option of options) {
            const optionValue = option.value;
            const optionText = option.text;
            const searchableValue = optionValue.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
            const searchableText = optionText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

            if (searchableText.indexOf(searchFor) > -1) {
                filtered.push(option);
                usedValues.push(optionValue);
            }

            if (this.selects[selectId].settings.searchAlsoValue && !usedValues.includes(optionValue) && searchableValue.indexOf(searchFor) > -1) {
                filtered.push(option);
            }
        }

        return filtered;
    }

    replaceOptions(options, arrayOfNewOptions, selectId) {
        // we must have correct classes
        arrayOfNewOptions = this.activateSelectedOptions(selectId, arrayOfNewOptions);

        let newOptions = this.generateOptions(arrayOfNewOptions);
        const optionsWrapper = this.selects[selectId].wrapper.querySelector('.options');

        for (const option of options.querySelectorAll('div')) {
            option.remove();
        }

        if (this.turbo.isEmpty(arrayOfNewOptions)) {
            arrayOfNewOptions = [this.generateNotFoundOptionInfo(selectId)];
            newOptions = this.generateOptions(arrayOfNewOptions);
        }

        this.selects[selectId].options = arrayOfNewOptions;
        this.showOptionsInWrapper(optionsWrapper, newOptions);

        const optionsElements = this.selects[selectId].wrapper.querySelectorAll('.options div');
        this.bindSelection(optionsElements, selectId);
    }

    activateSelectedOptions(selectId, options) {
        for (const option of options) {
            if (this.isSelected(selectId, option.value)) {
                const newClasses = [...option.attributes.class];
                const activeClassIndex = newClasses.indexOf('active');

                if (activeClassIndex > -1) {
                    newClasses.splice(activeClassIndex, 1);
                }

                newClasses.push('active');

                option.attributes.class = newClasses;
            }
        }

        return options;
    }

}

module.exports = Select;