const turboClass = require('./turbo');

class Select {

    constructor() {
        this.turbo = new turboClass();
        this.selects = {};
        this.custom = {};
        this.animationSettings = {
            open: 'animation-slide-in-top',
            close: 'animation-slide-out-top',
            duration: 150,
        };
        this.beautySpace = 10; // multiselect options || input
        this.lastInitialized = [];
    }

    /**
     * @param parent
     */
    initSelect(parent = document) {
        const selects = parent.querySelectorAll('.turbo-ui.select');

        if (selects) {
            this.lastInitialized = [];

            for (let i = 0; i < selects.length; i++) {
                const turboSelectWrapper = selects[i];
                const selectElement = turboSelectWrapper.querySelector('select');

                if (selectElement && this.turbo.getCss(selectElement, 'display') !== 'none') {
                    const turboSelectId = this.generateSelectId(i + 1);
                    this.generateTurboSelect(turboSelectWrapper, turboSelectId);
                    this.bindSelectActions(turboSelectWrapper);
                }
            }
        }
    }

    /**
     * @return {[]}
     */
    getLastInitialized() {
        return this.lastInitialized;
    }

    /**
     * @param id
     * @return {string}
     */
    generateSelectId(id) {
        let selectId = `turbo-select-${id}`;

        if (this.selects[selectId]) {
            selectId = `turbo-select-${Object.keys(this.selects).length + 1}`;
        }

        return selectId;
    }

    /**
     * @param turboSelectWrapper
     * @param turboSelectId
     */
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
        };
        const labelText = realLabel ? realLabel.textContent : '';
        const mainElements = this.generateMainElements(turboSelectId, selectOptions, labelText, multiselect, searchable);
        const defaultOptions = this.getOptionsInfo(options, customSettings);
        const generatedOptions = this.generateOptions(defaultOptions);

        this.showOptionsInWrapper(mainElements.optionsWrapper, generatedOptions);

        this.turbo.showElement(mainElements.label, mainElements.selectionWrapper, 'prepend', 'block', {});
        this.turbo.showElement(mainElements.optionsWrapper, mainElements.selectionWrapper, 'append', 'none', {});
        this.turbo.showElement(mainElements.selectionWrapper, mainElements.turboSelectElement, 'append', 'flex', {});
        this.turbo.showElement(mainElements.arrow, mainElements.turboSelectElement, 'append', 'flex', {});

        realSelect.style.display = 'none';

        // final select
        this.turbo.showElement(mainElements.turboSelectElement, turboSelectWrapper, 'append', 'flex', {});

        this.createInstance(defaultOptions, turboSelectId, (mainElements.label ? labelText : null), searchable, multiselect);

        this.updateLabel(turboSelectId);
        this.selectSelected(turboSelectId);
    }

    /**
     * @param turboSelectId
     * @param selectOptions
     * @param labelText
     * @param multiselect
     * @param searchable
     * @return {{arrow: *, optionsWrapper: *, selectionWrapper: *, label: *, turboSelectElement: *}}
     */
    generateMainElements(turboSelectId, selectOptions, labelText, multiselect = false, searchable = false) {
        const turboSelectClasses = ['turbo-select'];

        if (multiselect) {
            turboSelectClasses.push('multiselect');
        }

        if (searchable) {
            turboSelectClasses.push('searchable');
        }

        const turboSelectElement = this.turbo.createElement('div', null, {
            class: turboSelectClasses,
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

    /**
     * @param labelText
     * @param searchable
     * @param onlyInput
     * @return {*}
     */
    generateLabel(labelText, searchable, onlyInput = false) {
        const labelClasses = ['label'];

        if (searchable) {
            labelClasses.push('search');
        }

        const label = this.turbo.createElement('div', (searchable ? null : labelText), {
            class: labelClasses,
        });

        if (searchable) {
            const searchInput = this.turbo.createElement('input', null, {
                placeholder: labelText ? labelText : '',
                class: ['options-search'],
                autocomplete: 'off'
            });

            if (onlyInput) {
                return searchInput;
            }

            this.turbo.showElement(searchInput, label, 'append', 'block', {});
        }

        return label;
    }

    /**
     * @param selectId
     * @param additionalOption
     * @return {{}|{notFoundOption: boolean, attributes: {dataset: {value: (string|*)}, class: string[]}, disabled: boolean, text: (string|*), value: (string|*), allSelectedOption: boolean}}
     */
    generateAdditionalOption(selectId, additionalOption = 'notFound') {
        if (['notFound', 'allSelected'].includes(additionalOption)) {
            const value = additionalOption === 'notFound' ? this.selects[selectId].settings.notFoundOptionValue : this.selects[selectId].settings.allOptionsSelectedOptionValue;
            const text = additionalOption === 'notFound' ? this.turbo.settings.text.notFound : this.turbo.settings.text.allSelected;
            const classes = ['disabled'];

            if (additionalOption === 'notFound') {
                classes.push('not-found-option');
            } else {
                classes.push('all-selected-option');
            }

            return {
                text: text,
                value: value,
                attributes: {
                    dataset: {
                        value: value,
                    },
                    class: classes,
                },
                disabled: true,
                notFoundOption: additionalOption === 'notFound',
                allSelectedOption: additionalOption === 'allSelected',
            };
        }

        return {};
    }

    /**
     * @param text
     * @param value
     * @param nextRow
     * @return {*}
     */
    generateSelectedOption(text, value, nextRow = false) {
        const optionClasses = [
            'selected-option',
        ];

        if (nextRow) {
            optionClasses.push('next-row');
        }

        const selectedOption = this.turbo.createElement('div', text, {
            class: optionClasses,
            dataset: {
                value: value,
            }
        });

        const removeButton = this.turbo.createElement('div', null, {
            class: ['remove-button'],
        });

        for (let i = 0; i < 2; i++) {
            this.turbo.showElement(this.turbo.createElement('div', null, {
                class: ['remove-line'],
            }), removeButton, 'append', 'block', {});
        }

        this.turbo.showElement(removeButton, selectedOption, 'append', 'block', {});

        return selectedOption;
    }

    /**
     * @param arrayOfRealOptions
     * @param customSelectSettings
     * @return {*[]}
     */
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

    /**
     * @param options
     * @return {*[]}
     */
    generateOptions(options) {
        const arrayOfOptions = [];

        for (let i = 0; i < options.length; i++) {
            const option = options[i];

            arrayOfOptions.push(this.turbo.createElement('div', option.text, option.attributes));
        }

        return arrayOfOptions;
    }

    /**
     * @param selectId
     */
    selectSelected(selectId) {
        const realOptions = this.selects[selectId].wrapper.closest('.turbo-ui.select').querySelectorAll('option');

        for (const realOption of realOptions) {
            if (realOption.selected) {
                this.selectOption({value: realOption.value}, selectId);

                if (!this.isMultiselect(selectId)) {
                    break;
                }
            }
        }
    }

    /**
     * @param wrapper
     * @param arrayOfOptions
     */
    showOptionsInWrapper(wrapper, arrayOfOptions) {
        for (let i = 0; i < arrayOfOptions.length; i++) {
            this.turbo.showElement(arrayOfOptions[i], wrapper, 'append', 'block', {});
        }
    }

    /**
     * @param options
     * @param id
     * @param defaultLabel
     * @param searchable
     * @param multiselect
     */
    createInstance(options, id, defaultLabel, searchable, multiselect) {
        const select = document.querySelector(`#${id}`);
        const turboSelectWrapper = select.closest('.turbo-ui.select');
        const wrapperId = turboSelectWrapper.getAttribute('id');
        const customSelectSettings = this.custom[wrapperId]?.settings;
        const defaultSettings = this.turbo.settings.select;

        this.selects[id] = {
            id: id,
            wrapperId: wrapperId && this.custom[wrapperId]?.customId ? this.custom[wrapperId]?.customId : null,
            wrapper: select,
            defaultOptions: options,
            options: options,
            settings: {
                searchAlsoValue: wrapperId && typeof customSelectSettings?.searchAlsoValue !== 'undefined' ? customSelectSettings.searchAlsoValue : defaultSettings.searchAlsoValue,
                notFoundOptionValue: wrapperId && typeof customSelectSettings?.notFoundOptionValue !== 'undefined' ? customSelectSettings.notFoundOptionValue : defaultSettings.notFoundOptionValue,
                allOptionsSelectedOptionValue: wrapperId && typeof customSelectSettings?.allOptionsSelectedOptionValue !== 'undefined' ? customSelectSettings.allOptionsSelectedOptionValue : defaultSettings.allOptionsSelectedOptionValue,
                autoSelect: wrapperId && typeof customSelectSettings?.autoSelect !== 'undefined' ? customSelectSettings.autoSelect : defaultSettings.autoSelect,
                customLabel: wrapperId && typeof customSelectSettings?.customLabel !== 'undefined' ? customSelectSettings.customLabel : defaultSettings.customLabel,
            },
            label: defaultLabel,
            selectedOption: (multiselect ? [] : null),
            searchable: searchable,
            multiselect: multiselect,
        };

        this.lastInitialized.push(id);

        if (multiselect) {
            const hideSelectedOptions = wrapperId && typeof this.custom[wrapperId]?.settings?.multiselect?.hideSelected !== 'undefined';

            this.selects[id].settings.multiselect = {};
            this.selects[id].settings.multiselect.hideSelected = hideSelectedOptions ? this.custom[wrapperId].settings.multiselect.hideSelected : this.turbo.settings.select.multiselect.hideSelected;
            this.selects[id].settings.multiselect.hideOptionsAfterSelect = wrapperId && typeof this.custom[wrapperId]?.settings?.multiselect?.hideOptionsAfterSelect !== 'undefined' ? this.custom[wrapperId].settings.multiselect.hideOptionsAfterSelect : this.turbo.settings.select.multiselect.hideOptionsAfterSelect;

            if (hideSelectedOptions) {
                this.selects[id].settings.hideDisabledOptions = true;
            }
        }
    }

    /**
     * get select id
     * @param select element
     * @return {string}
     */
    getSelectId(select) {
        select = this.turbo.beNode(select);
        return select.closest('.turbo-ui.select').querySelector('.turbo-select').id;
    }

    /**
     * @param selectId
     * @return {*}
     */
    isSearchable(selectId) {
        return this.selects[selectId].searchable;
    }

    /**
     * @param selectId
     * @return {*}
     */
    isMultiselect(selectId) {
        return this.selects[selectId].multiselect;
    }

    /**
     * @param turboSelectWrapper
     */
    bindSelectActions(turboSelectWrapper) {
        const selectWrapper = turboSelectWrapper.querySelector('.turbo-select');

        if (selectWrapper) {
            const optionsWrapper = turboSelectWrapper.querySelector('.turbo-select .options-wrapper');
            const options = optionsWrapper.querySelectorAll('.options div');
            const dropdownArrow = turboSelectWrapper.querySelector('.turbo-select .dropdown-arrow');
            const selectId = selectWrapper.id;

            if (this.isSearchable(selectId)) {
                const searchInput = optionsWrapper.querySelector('.options-search');
                this.bindFiltering(searchInput, selectId);
            }

            optionsWrapper.addEventListener('click', e => {
                e.stopPropagation();
                this.toggleOptions(turboSelectWrapper, selectId);
            });

            dropdownArrow.addEventListener('click', e => {
                e.stopPropagation();
                this.toggleOptions(turboSelectWrapper, selectId);
            });

            this.bindSelection(options, selectId);
        }
    }

    /**
     * @param options
     * @param selectId
     */
    bindSelection(options, selectId) {
        for (let i = 0; i < options.length; i++) {
            const option = options[i];

            option.addEventListener('click', e => {
                e.stopPropagation();
                this.selectOption(option, selectId);
            });
        }
    }

    /**
     * @param option
     * @param selectId
     */
    bindOptionDelete(option, selectId) {
        const deleteButton = option.querySelector('.remove-button');

        deleteButton.addEventListener('click', e => {
            e.stopPropagation();

            this.removeOption(option, selectId);
        });

        option.addEventListener('click', e => {
            e.stopPropagation();
        });
    }

    /**
     * @param turboSelectWrapper
     * @param selectId
     */
    toggleOptions(turboSelectWrapper, selectId) {
        const options = turboSelectWrapper.querySelector('.options');
        const open = !options.classList.contains('opened');

        if (open) {
            this.openOptions(selectId);

            if (this.isSearchable(selectId)) {
                turboSelectWrapper.querySelector('.options-search').focus();
            }
        } else {
            this.safeCloseOptions(selectId);
        }
    }

    /**
     * select the first available option and update label
     * only for not multiselect
     * @param selectId
     */
    updateLabel(selectId) {
        const selectInfo = this.selects[selectId];
        const originalLabel = selectInfo.wrapper.closest('.turbo-ui.select').querySelector('label');
        const label = selectInfo.wrapper.querySelector('.label');

        for (const option of selectInfo.options) {
            if (this.canSelectOption(option, selectId)) {
                if (!originalLabel) {
                    if (selectInfo.searchable) {
                        label.querySelector('input').placeholder = option.text;
                    } else {
                        label.textContent = option.text;
                    }
                }

                if (!selectInfo.multiselect && selectInfo.settings.autoSelect) {
                    this.selectOption(option, selectId, false);
                }

                break;
            }
        }

        if (!selectInfo.settings.autoSelect && selectInfo.settings.customLabel !== '') {
            const customLabel = selectInfo.settings.customLabel;

            if (selectInfo.searchable) {
                label.querySelector('input').placeholder = customLabel;
            } else {
                label.textContent = customLabel;
            }
        }
    }

    /**
     * @param selectId
     */
    openOptions(selectId) {
        const searchable = this.isSearchable(selectId);
        const multiselect = this.isMultiselect(selectId);
        const options = this.selects[selectId].wrapper.querySelector('.options');

        if (searchable) {
            const label = options.closest('.options-wrapper').querySelector('.label');
            const searchInput = label.querySelector('.options-search');
            const actualValue = searchInput.value;

            if (!this.turbo.isEmpty(actualValue)) {
                searchInput.value = '';
                searchInput.setAttribute('placeholder', actualValue);
            }
        }

        options.style.display = 'block';
        options.classList.add('opened');

        if (multiselect) {
            this.setOptionWrapperPosition(selectId);
        }

        this.bindCloseOptionsFromOutside(options, selectId);
    }

    /**
     * @param selectId
     */
    setOptionWrapperPosition(selectId) {
        const turboSelectWrapper = this.selects[selectId].wrapper;
        const optionWrapper = turboSelectWrapper.querySelector('.options-wrapper');
        const options = turboSelectWrapper.querySelector('.options');

        const selectWrapperHeight = parseFloat(this.turbo.getCss(turboSelectWrapper, 'height'));
        const optionWrapperMinHeight = parseFloat(this.turbo.getCss(optionWrapper, 'min-height'));

        options.style.top = (selectWrapperHeight - optionWrapperMinHeight) + 'px';
    }

    /**
     * @param selectId
     */
    closeOptions(selectId) {
        const options = this.selects[selectId].wrapper.querySelector('.options');

        options.classList.remove('opened');
        this.turbo.toggleAnimationClass(options, 'animation-slide-out-top', this.animationSettings.duration);

        setTimeout(() => {
            options.style.display = 'none';
            this.turbo.toggleAnimationClass(options, 'animation-slide-in-top', this.animationSettings.duration);
        }, this.animationSettings.duration);
    }

    /**
     * @param options
     * @param selectId
     */
    bindCloseOptionsFromOutside(options, selectId) {
        const _this = this;

        document.addEventListener('click', function close() {
            _this.safeCloseOptions(selectId);
            document.removeEventListener('click', close);
        });
    }

    safeCloseOptions(selectId) {
        const options = this.selects[selectId].wrapper.querySelector('.options');

        if (options.classList.contains('opened')) {
            if (this.shouldSelectFirstOption(selectId)) {
                const firstOptionValue = this.selects[selectId].options[0].value;

                if (this.canSelectOption(firstOptionValue, selectId)) {
                    this.selectOption({value: firstOptionValue}, selectId);
                }
            } else {
                this.reselectOption(selectId);
                this.closeOptions(selectId);
            }

            if (this.isMultiselect(selectId) && this.isSearchable(selectId)) {
                options.closest('.options-wrapper').querySelector('.options-search').value = '';

                setTimeout(() => {
                    this.resetOptions(selectId, this.selectableOptions(selectId));
                }, this.animationSettings.duration);
            }
        }
    }

    /**
     * @param selectId
     * @return {boolean}
     */
    shouldSelectFirstOption(selectId) {
        if (this.selects[selectId].options.length === 1 && !this.areOptionsNotFound(selectId) && this.selects[selectId].selectedOption === null) {
            return true;
        }
    }

    /**
     * @param selectId
     * @return {boolean}
     */
    areOptionsNotFound(selectId) {
        const firstOptionValue = this.selects[selectId].options[0].value;
        return !!this.getOptionInfoByValue(selectId, firstOptionValue)?.notFoundOption;
    }

    /**
     * @param selectId
     */
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

    /**
     * @param selectId
     */
    updateSelectedElement(selectId) {
        const selectedValue = this.selects[selectId].selectedOption?.value;

        if (selectedValue) {
            this.selects[selectId].selectedOption.element = document.querySelector(`#${selectId} div[data-value="${selectedValue}"]`);
        }
    }

    /**
     * @param option
     * @param selectId
     * @param triggerChange
     */
    selectOption(option, selectId, triggerChange = true) {
        const turboSelectWrapper = this.selects[selectId].wrapper;
        const realSelect = turboSelectWrapper.closest('.turbo-ui.select').querySelector('select');
        const optionsWrapper = turboSelectWrapper.querySelector('.options');
        const label = turboSelectWrapper.querySelector('.label');
        const searchable = this.isSearchable(selectId);
        const multiselect = this.isMultiselect(selectId);

        if (this.canSelectOption(option, selectId)) {
            if (!multiselect || this.selects[selectId].settings.multiselect.hideOptionsAfterSelect) {
                this.closeOptions(selectId);
            }

            setTimeout(() => {
                if (!multiselect) {
                    this.unsetSelected(selectId);
                    this.resetSelect(optionsWrapper, label, selectId);
                }

                if (this.turbo.isObject(option) && !this.turbo.isNode(option) && option.value) {
                    option = optionsWrapper.querySelector(`div[data-value="${option.value}"]`);
                } else {
                    option = optionsWrapper.querySelector(`div[data-value="${this.turbo.getData(option, 'value')}"]`);
                }
                
                let selectedValue = null;

                try {
                    selectedValue = this.turbo.getData(option, 'value');
                } catch (e) {
                    console.error('This option cannot be selected');
                    return false;
                }

                const selectedText = option.textContent;

                label.classList.add('selected');
                option.classList.add('active');

                const selectedInfo = {
                    value: selectedValue,
                    text: selectedText,
                    element: option,
                };

                if (multiselect) {
                    this.selects[selectId].selectedOption.push(selectedInfo);
                } else {
                    this.selects[selectId].selectedOption = selectedInfo;
                }

                if (searchable && !multiselect) {
                    const searchInput = label.querySelector('.options-search');

                    searchInput.value = selectedText;
                    searchInput.setAttribute('placeholder', selectedText);
                } else if (multiselect) {
                    this.showSelectedOptions(selectId);
                    this.hideSelectedOption(selectId, option);
                    this.resetOptions(selectId, this.selects[selectId].settings.multiselect.hideSelected ? this.selectableOptions(selectId) : {});

                    if (this.selects[selectId].options.length === 0 || this.selects[selectId].options === null) {
                        this.addAllSelectedOption(selectId);
                    }
                } else {
                    label.textContent = selectedText;
                }

                if (multiselect) {
                    this.selectRealOption(selectId, selectedValue);
                } else {
                    realSelect.value = selectedValue;
                }

                if (triggerChange) {
                    this.triggerChangeEvent(realSelect);
                }
            }, this.animationSettings.duration);
        }
    }

    /**
     * @param selectId
     * @param value
     */
    selectRealOption(selectId, value) {
        const turboSelectWrapper = this.selects[selectId].wrapper.closest('.turbo-ui.select');
        const realSelect = turboSelectWrapper.querySelector('select');

        realSelect.querySelector(`option[value="${value}"]`).selected = true;
    }

    /**
     * for multiselect
     * @param option
     * @param selectId
     */
    removeOption(option, selectId) {
        const optionValue = this.turbo.getData(option, 'value');
        option.remove();

        this.makeOptionAvailable(optionValue, selectId);
        this.showSelectedOptions(selectId);

        if (this.turbo.isEmpty(this.selects[selectId].selectedOption)) {
            const turboSelectWrapper = this.selects[selectId].wrapper;
            const newLabel = this.generateLabel(this.selects[selectId].label, this.isSearchable(selectId));

            turboSelectWrapper.querySelector('.label').remove();
            this.turbo.showElement(newLabel, turboSelectWrapper.querySelector('.options-wrapper'), 'prepend', 'block', {});
        }

        this.deleteAllSelectedOption(selectId);
    }

    /**
     * @param selectId
     */
    deleteAllSelectedOption(selectId) {
        const options = this.selects[selectId].options;
        let allSelectedOptionIndex = false;

        for (let i = 0; i < options.length; i++) {
            const option = options[i];

            if (option.value === this.selects[selectId].settings.allOptionsSelectedOptionValue) {
                allSelectedOptionIndex = i;
            }
        }

        if (allSelectedOptionIndex !== false) {
            this.selects[selectId].options.splice(allSelectedOptionIndex, 1);
        }

        this.deleteAllSelectedOptionElement(selectId);
    }

    /**
     * @param selectId
     */
    deleteAllSelectedOptionElement(selectId) {
        for (const optionElement of this.selects[selectId].wrapper.querySelectorAll('.options div')) {
            if (this.turbo.getData(optionElement, 'value') === this.selects[selectId].settings.allOptionsSelectedOptionValue) {
                optionElement.remove();
            }
        }
    }

    /**
     * for multiselect
     * @param selectedOptionValue
     * @param selectId
     */
    makeOptionAvailable(selectedOptionValue, selectId) {
        const optionData = this.getOptionInfoByValue(selectId, selectedOptionValue);

        for (let i = 0; i < this.selects[selectId].selectedOption.length; i++) {
            const option = this.selects[selectId].selectedOption[i];

            if (option.value === selectedOptionValue) {
                if (this.selects[selectId].settings.multiselect.hideSelected) {
                    this.selects[selectId].options.push(optionData);
                    this.sortOptionsByDefault(selectId);
                } else {
                    this.cancelDisability(selectId, selectedOptionValue);
                }

                this.selects[selectId].selectedOption.splice(i, 1);
            }
        }

        if (!this.selects[selectId].settings.multiselect.hideSelected) {
            this.selects[selectId].options = [...this.activateSelectedOptions(selectId, this.selects[selectId].defaultOptions)];
        }

        this.resetOptions(selectId, this.selects[selectId].options);
    }

    /**
     * @param selectId
     */
    sortOptionsByDefault(selectId) {
        const defaultOptions = [...this.selects[selectId].defaultOptions];
        const optionsOrder = {};
        const ordered = [];

        for (let i = 0; i < defaultOptions.length; i++) {
            optionsOrder[defaultOptions[i].value] = i;
        }

        for (const option of this.selects[selectId].options) {
            ordered[optionsOrder[option.value]] = option;
        }

        this.selects[selectId].options = ordered.filter(option => option);
    }

    /**
     * for current options
     * @param selectId
     * @param option
     */
    cancelDisability(selectId, option) {
        for (const optionData of this.selects[selectId].options) {
            if (optionData.value === option) {
                let disableClassIndex = optionData.attributes.class.indexOf('disabled');
                optionData.disabled = false;

                if (disableClassIndex > -1) {
                    optionData.attributes.class.splice(disableClassIndex, 1);
                }
            }
        }
    }

    /**
     * @param option
     * @param selectId
     * @return {number}
     */
    getDefaultOptionIndex(option, selectId) {
        for (let i = 0; i < this.selects[selectId].defaultOptions.length; i++) {
            if (option === this.selects[selectId].defaultOptions[i].value) {
                return i;
            }
        }

        return 0;
    }

    /**
     * @param selectId
     */
    resetAvailableOptions(selectId) {
        const turboSelectWrapper = this.selects[selectId].wrapper;
        const optionsWrapper = turboSelectWrapper.querySelector('.options');

        for (const option of optionsWrapper.querySelectorAll('div')) {
            option.remove();
        }

        const newOptions = this.generateOptions(this.selects[selectId].options);
        this.showOptionsInWrapper(optionsWrapper, newOptions);
        this.bindSelection(optionsWrapper.querySelectorAll('div'), selectId);
    }

    /**
     * just for multiselect
     * @param selectId
     */
    showSelectedOptions(selectId) {
        const turboSelectWrapper = this.selects[selectId].wrapper;
        const selectedOptions = this.selects[selectId].selectedOption;
        let label = turboSelectWrapper.querySelector('.label');

        const optionsWrapper = turboSelectWrapper.querySelector('.options-wrapper');
        const usableWidth = this.getUsableOptionWrapperWidth(optionsWrapper);
        let optionsWidthSum = 0;

        label.textContent = '';

        for (const selectedOption of selectedOptions) {
            const selectedOptionElement = this.generateSelectedOption(selectedOption.text, selectedOption.value);
            this.turbo.showElement(selectedOptionElement, label, 'append', 'inline-flex', {});

            optionsWidthSum += this.getElementUsedWidth(selectedOptionElement);

            if (this.mustBePlacedBelowFirstRow(usableWidth, optionsWidthSum)) {
                selectedOptionElement.classList.add('next-row');
            }

            this.bindOptionDelete(selectedOptionElement, selectId);
        }

        if (this.isSearchable(selectId)) {
            const searchInput = this.generateLabel(null, true, true);
            this.turbo.showElement(searchInput, label, 'append', 'inline-flex', {});
            this.bindFiltering(searchInput, selectId);

            searchInput.focus();
        }

        this.setOptionWrapperPosition(selectId);
    }

    /**
     * @param wrapper
     * @return {number}
     */
    getUsableOptionWrapperWidth(wrapper) {
        const wrapperWidth = parseFloat(this.turbo.getCss(wrapper, 'width'));
        const wrapperPaddings = parseFloat(this.turbo.getCss(wrapper, 'padding-right')) + parseFloat(this.turbo.getCss(wrapper, 'padding-left'));

        return wrapperWidth - (wrapperPaddings - this.beautySpace);
    }

    /**
     * @param element
     * @return {number}
     */
    getElementUsedWidth(element) {
        const elementWidth = parseFloat(this.turbo.getCss(element, 'width'));
        const elementMargins = parseFloat(this.turbo.getCss(element, 'margin-right')) + parseFloat(this.turbo.getCss(element, 'margin-left'));

        return elementWidth + elementMargins;
    }

    /**
     * @param wrapperUsableWidth
     * @param optionsSum
     * @return {boolean}
     */
    mustBePlacedBelowFirstRow(wrapperUsableWidth, optionsSum) {
        return wrapperUsableWidth < optionsSum;
    }

    /**
     * @param selectId
     * @param option
     */
    hideSelectedOption(selectId, option) {
        const optionValue = this.turbo.getData(option, 'value');

        if (this.selects[selectId].settings.multiselect.hideSelected) {
            option.remove();

            for (const selectedOption of this.selects[selectId].selectedOption) {
                if (selectedOption.value === optionValue) {
                    selectedOption.element = null;
                    break;
                }
            }

            let selectedOptionIndex = null;

            for (let i = 0; i < this.selects[selectId].options.length; i++) {
                const option = this.selects[selectId].options[i];

                if (option.value === optionValue) {
                    selectedOptionIndex = i;
                }
            }

            if (selectedOptionIndex !== null) {
                this.selects[selectId].options = [...this.selects[selectId].options];
                this.selects[selectId].options.splice(selectedOptionIndex, 1);
            }
        } else {
            this.makeOptionDisabled(selectId, option);
        }
    }

    /**
     * @param selectId
     * @param option
     */
    makeOptionDisabled(selectId, option) {
        const optionValue = this.turbo.getData(option, 'value');
        option.classList.add('disabled');

        for (const optionData of this.selects[selectId].options) {
            if (optionValue === optionData.value) {
                optionData.disabled = true;
                optionData.attributes.class.push('disabled');
            }
        }
    }

    /**
     * @param selectId
     */
    addAllSelectedOption(selectId) {
        const option = this.generateAdditionalOption(selectId, 'allSelected');
        const optionElement = this.generateOptions([option]);
        const turboSelectWrapper = this.selects[selectId].wrapper;
        const optionsWrapper = turboSelectWrapper.querySelector('.options');

        this.showOptionsInWrapper(optionsWrapper, optionElement);
        this.bindSelection(optionsWrapper.querySelectorAll('div'), selectId);
        this.selects[selectId].options.push(option);
    }

    /**
     * @param selectId
     */
    unsetSelected(selectId) {
        const multiselect = this.isMultiselect(selectId);

        if (!multiselect) {
            this.selects[selectId].selectedOption = null;
        }

        for (const defaultOption of this.selects[selectId].defaultOptions) {
            const newClasses = [...defaultOption.attributes.class];
            const activeClassIndex = newClasses.indexOf('active');

            if (activeClassIndex > -1) {
                newClasses.splice(activeClassIndex, 1);
            }

            defaultOption.attributes.class = newClasses;
        }
    }

    /**
     * @param option
     * @param selectId
     * @return {boolean}
     */
    canSelectOption(option, selectId) {
        let selectedValue = option;

        if (this.turbo.isNode(option)) {
            selectedValue = this.turbo.getData(option, 'value');

            if (!!!selectedValue) {
                selectedValue = option.value;
            }
        } else if (this.turbo.isObject(option) && option.value) {
            selectedValue = option.value;
        }

        const optionInfo = this.getOptionInfoByValue(selectId, selectedValue);

        if (!!optionInfo?.disabled) {
            return false;
        }

        if (!!optionInfo?.notFoundOption) {
            return false;
        }

        if (this.isMultiselect(selectId)) {
            const selectedOptions = this.selects[selectId].selectedOption;

            for (const selectedOption of selectedOptions) {
                if (optionInfo.value === selectedOption.value) {
                    return false
                }
            }
        }

        return true;
    }

    /**
     * @param selectId
     * @param value
     * @return {{notFoundOption: boolean}|*}
     */
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

    /**
     * @param selectId
     * @param value
     * @return {boolean}
     */
    isSelected(selectId, value) {
        if (this.isMultiselect(selectId)) {
            for (const selectedOption of this.selects[selectId].selectedOption) {
                if (selectedOption.value === value) {
                    return true;
                }
            }
        }

        return this.selects[selectId].selectedOption?.value === value;
    }

    /**
     * @param optionsWrapper
     * @param label
     * @param selectId
     */
    resetSelect(optionsWrapper, label, selectId) {
        const options = optionsWrapper.querySelectorAll('div');
        const searchable = this.isSearchable(selectId);
        const multiselect = this.isMultiselect(selectId);

        if (!multiselect) {
            this.selects[selectId].selectedOption = null;
        }

        label = this.generateLabel(this.selects[selectId].label, searchable);

        for (let i = 0; i < options.length; i++) {
            const option = options[i];

            if (option.classList.contains('active')) {
                option.classList.remove('active');
            }
        }

        this.resetOptions(selectId);
    }

    /**
     * @param selectId
     * @param options
     */
    resetOptions(selectId, options = {}) {
        const turboSelectWrapper = this.selects[selectId].wrapper;
        const optionsWrapper = turboSelectWrapper.querySelector('.options');
        const actualOptions = optionsWrapper.querySelectorAll('div');
        let newOptions, newOptionsData;

        if (this.turbo.isEmpty(options)) {
            let defaultOptions = this.selects[selectId].defaultOptions;

            newOptionsData = [...defaultOptions];
            defaultOptions = this.activateSelectedOptions(selectId, defaultOptions);
            newOptions = this.generateOptions(defaultOptions);
        } else {
            newOptions = this.generateOptions(options);
            newOptionsData = [...options];
        }

        for (const actualOption of actualOptions) {
            actualOption.remove();
        }

        this.showOptionsInWrapper(optionsWrapper, newOptions);
        this.bindSelection(optionsWrapper.querySelectorAll('div'), selectId);
        this.selects[selectId].options = [...newOptionsData];
    }

    /**
     * @param select
     */
    triggerChangeEvent(select) {
        const event = new Event('change');
        select.dispatchEvent(event);
    }

    /**
     * @param searchInput
     * @param selectId
     */
    bindFiltering(searchInput, selectId) {
        const options = searchInput.closest('.options-wrapper').querySelector('.options');

        searchInput.addEventListener('input', () => {
            const searchFor = searchInput.value.toLowerCase();
            const filtered = this.filterOptions(searchFor, selectId);

            this.replaceOptions(options, filtered, selectId);
        });
    }

    /**
     * @param searchFor
     * @param selectId
     * @return {*[]|*}
     */
    filterOptions(searchFor, selectId) {
        const options = this.isMultiselect(selectId) ? this.selectableOptions(selectId) : this.selects[selectId].defaultOptions;
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

    /**
     * selectedOptions \ defaultOptions
     * @param selectId
     * @return {*[]}
     */
    selectableOptions(selectId) {
        const notSearchableOptionValues = [];
        const forSearching = [];

        for (const option of this.selects[selectId].selectedOption) {
            notSearchableOptionValues.push(option.value);
        }

        for (const defaultOption of [...this.selects[selectId].defaultOptions]) {
            if (!notSearchableOptionValues.includes(defaultOption.value)) {
                forSearching.push(defaultOption);
            }
        }

        return forSearching;
    }

    /**
     * @param options
     * @param arrayOfNewOptions
     * @param selectId
     */
    replaceOptions(options, arrayOfNewOptions, selectId) {
        // we must have correct classes
        arrayOfNewOptions = this.activateSelectedOptions(selectId, arrayOfNewOptions);

        let newOptions = this.generateOptions(arrayOfNewOptions);
        const optionsWrapper = this.selects[selectId].wrapper.querySelector('.options');

        for (const option of options.querySelectorAll('div')) {
            option.remove();
        }

        if (this.turbo.isEmpty(arrayOfNewOptions)) {
            arrayOfNewOptions = [this.generateAdditionalOption(selectId)];
            newOptions = this.generateOptions(arrayOfNewOptions);
        }

        this.selects[selectId].options = arrayOfNewOptions;
        this.showOptionsInWrapper(optionsWrapper, newOptions);

        const optionsElements = this.selects[selectId].wrapper.querySelectorAll('.options div');
        this.bindSelection(optionsElements, selectId);
    }

    /**
     * @param selectId
     * @param options
     * @return {*}
     */
    activateSelectedOptions(selectId, options) {
        for (const option of options) {
            const newClasses = [...option.attributes.class];
            const activeClassIndex = newClasses.indexOf('active');

            if (activeClassIndex > -1) {
                newClasses.splice(activeClassIndex, 1);
            }

            if (this.isSelected(selectId, option.value)) {
                newClasses.push('active');
            }

            option.attributes.class = newClasses;
        }

        return options;
    }

}

module.exports = Select;