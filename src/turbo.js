class Turbo {

    /**
     * unpaired HTML tags
     * @type {string[]}
     */
    unpairedTags = ['br, hr', 'img', 'input'];

    /**
     * class constructor
     */
    constructor() {

        /**
         * Turbo's settings
         * @type {{animation: {duration: number, showClass: string, hideClass: string}}}
         */
        this.settings = {
            animation: {
                duration: 300,
                showClass: 'animation-slide-in-fwd-center',
                hideClass: 'animation-slide-out-bck-center',
            },
            text: {
                save: 'Save',
                cancel: 'Cancel',
                confirm: 'Confirm',
                info: 'Info',
                notFound: 'No results found',
                allSelected: 'All options have been selected',
            },
            notification: {
                autoHide: true,
                autoHideTime: 4000,
                showCloseButton: true,
            },
            select: {
                searchAlsoValue: false,
                notFoundOptionValue: '-',
                allOptionsSelectedOptionValue: '-',
                hideDisabledOptions: false,
                autoSelect: true,
                customLabel: '',
                multiselect: {
                    hideSelected: true,
                    hideOptionsAfterSelect: false,
                    autoSelectFirstOption: false,
                },
            }
        };
    }

    /**
     * adds global event listener
     * @param selector
     * @param type
     * @param callback
     * @param options
     * @param parent
     */
    addGlobalEventListener(selector, type, callback, options, parent = document) {
        parent.addEventListener(type, e => {
            if (e.target.matches(selector)) {
                callback(e);
            }
        }, options);
    }

    /**
     * create html element
     * @param element tag name
     * @param textContent text content for paired tags
     * @param attributes custom attributes
     * @return {*}
     */
    createElement(element, textContent = null, attributes = {}) {
        const newElement = document.createElement(element);

        for (let attribute in attributes) {
            if (attribute === 'class') {
                newElement.classList.add(...attributes[attribute]);
            } else if (attribute === 'dataset') {
                for (let dataset in attributes[attribute]) {
                    newElement.dataset[dataset] = attributes[attribute][dataset];
                }
            } else {
                newElement.setAttribute(attribute, attributes[attribute]);
            }
        }

        if (textContent !== null && !this.unpairedTags.includes(element)) {
            newElement.textContent = textContent;
        }

        return newElement;
    }

    /**
     * converts selector to node
     * @param element
     * @return {Node}
     */
    beNode(element) {
        if (!this.isNode(element)) {
            element = document.querySelector(element);
        }

        return element;
    }

    /**
     * check if element is node
     * @param element
     * @return {boolean}
     */
    isNode(element) {
        return (element instanceof Node) && typeof element !== 'string';
    }

    /**
     * check if variable is object
     * @param variable
     * @return {boolean}
     */
    isObject(variable) {
        return typeof variable === 'object' && !Array.isArray(variable) && variable !== null;
    }

    /**
     * Check if variable is empty
     * @param variable
     * @returns {boolean}
     */
    isEmpty(variable) {
        if (Array.isArray(variable)) {
            return variable.length === 0;
        } else if (this.isObject(variable)) {
            return Object.keys(variable).length === 0;
        }

        return !!!variable;
    }

    /**
     * Show element right after another element
     * @param newNode
     * @param referenceNode
     */
    insertAfter(newNode, referenceNode) {
        referenceNode = this.beNode(referenceNode);
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    /**
     * show element to destination
     * @param element element to show
     * @param destination where to show
     * @param position append || prepend || insertAfter
     * @param display css display property of element
     * @param animation animation duration and showing animation class
     */
    showElement(element, destination = 'body', position = 'append', display = 'block', animation = {
        duration: this.settings.animation.duration,
        showClass: this.settings.animation.showClass,
    }) {
        destination = this.beNode(destination);

        if (Object.entries(animation).length > 0) {
            if (animation?.showClass) {
                element.classList.add(animation.showClass ?? this.settings.animation.showClass);
            }
            element.style.animationDuration = `${animation.duration ?? this.settings.animation.duration}ms`;
        }
        element.style.display = display;

        if (position === 'prepend') {
            destination.prepend(element);
        } else if (position === 'insertAfter') {
            this.insertAfter(element, destination);
        } else {
            destination.appendChild(element);
        }
    }

    /**
     * hide specific element
     * @param element selector or node
     * @param all all elements if element is selector
     * @param animation animation settings - duration, hideClass
     */
    hideElement(element, all = false, animation = {
        duration: this.settings.animation.duration,
        hideClass: this.settings.animation.hideClass,
    }) {
        let elements = element;
        let isNode = true;

        if (!this.isNode(element)) {
            isNode = false;
            elements = document.querySelectorAll(element);
        }

        let animationClass = animation.hideClass ? animation.hideClass : this.settings.animation.hideClass;
        let animationDuration = animation.duration ? animation.duration : this.settings.animation.duration;

        if (elements) {
            for (let i = 0; i < (all ? elements.length : 1); i++) {
                element = this.beNode(elements[i]) ?? elements;

                if (element) {
                    this.toggleAnimationClass(element, animationClass, animationDuration);
                }
            }

            for (let i = 0; i < (all ? elements.length : 1); i++) {
                if (elements.length || isNode) {
                    const element = isNode ? elements : elements[i];
                    setTimeout(() => {
                        element.remove();
                    }, animationDuration);
                }
            }
        }
    }

    /**
     * start loader
     */
    startLoader() {
        const loaderWrapper = this.createElement('div', null, {
            class: ['loader-wrapper'],
        });

        const loaderElement = this.createElement('div', null, {
            class: ['turbo-loader'],
        });

        this.showElement(loaderElement, loaderWrapper);

        for (let i = 0; i < 4; i++) {
            this.showElement(this.createElement('div'), loaderElement, 'append', 'block', {});
        }

        this.showElement(loaderWrapper, 'body', 'append', 'block', {
            duration: 100,
        });
    }

    /**
     * stop loader
     */
    stopLoader() {
        const loader = document.querySelector('body > .loader-wrapper');

        this.hideElement(loader, false, {
            hideClass: 'animation-fade-out',
        });
    }

    /**
     * get data-* attribute
     * @param element
     * @param dataAttribute
     * @return {string}
     */
    getData(element, dataAttribute) {
        element = this.beNode(element);
        return element.getAttribute(`data-${dataAttribute}`);
    }

    /**
     * get all or style property of element
     * @param element
     * @param property
     * @return {string|CSSStyleDeclaration}
     */
    getCss(element, property = '') {
        element = this.beNode(element);
        const style = getComputedStyle(element);

        if (property === '') {
            return style;
        }

        return style.getPropertyValue(property);
    }

    /**
     * show modal window with custom heading and content
     * buttons value can be changed too, id will be '{id}-modal',
     * cancel button will be always displayed
     * @param heading
     * @param content
     * @param buttons
     * @param id
     * @param selectInstance
     */
    showModal(heading, content, buttons = {}, id = null, selectInstance = null) {
        const overlay = this.createElement('div', null, {
            class: ['overlay'],
        });

        const modalAttributes = {
            class: ['turbo-modal'],
        }

        if (id) {
            modalAttributes.id = `${id}-modal`;
        }

        const modalWrapper = this.createElement('div', null, modalAttributes);

        const modalHeader = this.createElement('div', null, {
            class: ['modal-header'],
        });

        modalHeader.innerHTML = `<h4>${heading}</h4>`;

        const modalContent = this.createElement('div', null, {
            class: ['modal-content'],
        });

        modalContent.innerHTML = content;

        const modalFooter = this.createElement('div', null, {
            class: ['modal-footer'],
        });

        let primaryButton = '';

        if (!buttons?.primary?.hide) {
            const buttonText = buttons?.primary?.text ? buttons.primary.text : this.settings.text.save;
            const buttonAttributes = {
                class: ['modal-primary']
            };

            if (buttons?.primary?.class) {
                buttonAttributes.class.push(...buttons.primary.class);
            }

            if (buttons?.primary?.id) {
                buttonAttributes.id = buttons.primary.id;
            }

            primaryButton = this.createElement('button', buttonText, buttonAttributes);
        }

        let closeButton = '';

        if (buttons?.close) {
            closeButton = this.createElement('div', null, {
                class: ['close-button'],
            });
        }

        const cancelButtonText = buttons?.cancel?.text ? buttons.cancel.text : this.settings.text.cancel;
        const cancelButtonAttributes = {
            class: ['modal-secondary'],
        };

        if (buttons?.cancel?.class) {
            cancelButtonAttributes.class.push(...buttons.cancel.class);
        }

        if (buttons?.cancel?.id) {
            cancelButtonAttributes.id = buttons.cancel.id;
        }

        const cancelButton = this.createElement('button', cancelButtonText, cancelButtonAttributes);

        this.showElement(cancelButton, modalFooter, 'append', 'block', {});

        if (primaryButton !== '') {
            this.showElement(primaryButton, modalFooter, 'append', 'block', {});
        }

        this.showElement(modalHeader, modalWrapper, 'append', 'block', {});

        if (closeButton !== '') {
            this.showElement(closeButton, modalHeader, 'append', 'block', {});
        }

        this.showElement(modalContent, modalWrapper, 'append', 'block', {});
        this.showElement(modalFooter, modalWrapper, 'append', 'flex', {});

        this.showElement(modalWrapper, overlay, 'append', 'block', {});

        this.showElement(overlay);

        if (selectInstance) {
            selectInstance.initSelect();
        }

        if (buttons?.primary?.callback) {
            document.querySelector('.turbo-modal .modal-primary').addEventListener('click', () => {
                buttons.primary.callback();
            });
        }

        document.querySelector('.turbo-modal .modal-secondary').addEventListener('click', () => {
            this.hideElement('.overlay');

            if (selectInstance) {
                for (const id of selectInstance.getLastInitialized()) {
                    delete selectInstance.selects[id];
                }
            }
        });
    }

    /**
     * show confirmation modal, returns promise by
     * clicking cancel (reject()) or confirm button (resolve())
     * @param text
     * @param buttons
     * @return {Promise<unknown>}
     */
    showConfirmation(text, buttons) {
        const overlay = this.createElement('div', null, {
            class: ['overlay'],
        });

        const wrapper = this.createElement('div', null, {
            class: ['turbo-confirmation'],
        });

        const contentWrapper = this.createElement('div', null, {
            class: ['confirmation-content'],
        });

        const content = this.createElement('p', text);

        this.showElement(content, contentWrapper, 'append', 'block', {});

        const footer = this.createElement('div', null, {
            class: ['confirmation-footer'],
        });

        const confirmationButtonAttributes = {
            class: ['confirmation-confirm'],
        };

        const cancelButtonAttributes = {
            class: ['confirmation-cancel'],
        };

        if (buttons?.confirm?.class) {
            confirmationButtonAttributes.class.push(...buttons.confirm.class);
        }

        if (buttons?.confirm?.id) {
            confirmationButtonAttributes.id = buttons.confirm.id;
        }

        if (buttons?.cancel?.class) {
            cancelButtonAttributes.class.push(...buttons.cancel.class);
        }

        if (buttons?.cancel?.id) {
            cancelButtonAttributes.id = buttons.cancel.id;
        }

        const confirmationText = buttons?.confirm?.text ? buttons.confirm.text : this.settings.text.confirm;
        const cancelText = buttons?.cancel?.text ? buttons.cancel.text : this.settings.text.cancel;

        const confirmationButton = this.createElement('button', confirmationText, confirmationButtonAttributes);
        const cancelButton = this.createElement('button', cancelText, cancelButtonAttributes);

        if (!buttons?.cancel?.hide) {
            this.showElement(cancelButton, footer, 'append', 'block', {});
        }

        this.showElement(confirmationButton, footer, 'append', 'block', {});
        this.showElement(contentWrapper, wrapper, 'append', 'block', {});
        this.showElement(footer, wrapper, 'append', 'flex', {});
        this.showElement(wrapper, overlay, 'append', 'block', {});
        this.showElement(overlay);

        return new Promise((resolve, reject) => {
            if (!buttons?.cancel?.hide) {
                document.querySelector('.turbo-confirmation .confirmation-cancel').addEventListener('click', () => {
                    reject();
                    this.hideElement('body > .overlay');
                });
            }

            document.querySelector('.turbo-confirmation .confirmation-confirm').addEventListener('click', () => {
                resolve();
                this.hideElement('body > .overlay');
            });
        });
    }

    /**
     * show notification with custom message and heading
     * @param message notification message
     * @param heading
     * @param level
     */
    notify(message, heading = this.settings.text.info, level = 'error') {
        const notificationWrapper = this.createElement('div', null, {
            class: ['turbo-notification', level],
        });

        const notificationLevel = this.createElement('div', null, {
            class: ['notification-level'],
        });

        const content = this.createElement('div', null, {
            class: ['notification-content'],
        });

        const closeButton = `<div class="close-button"></div>`;

        const headingElement = this.createElement('h6', heading);
        const messageElement = this.createElement('p', message);

        this.showElement(headingElement, content, 'append', 'block', {});
        this.showElement(messageElement, content, 'append', 'block', {});
        this.showElement(notificationLevel, notificationWrapper, 'append', 'block', {});

        if (this.settings.notification.showCloseButton || !this.settings.notification.autoHide) {
            notificationWrapper.innerHTML += closeButton;
        }

        this.showElement(content, notificationWrapper, 'append', 'block', {});
        this.showElement(notificationWrapper, 'body', 'append', 'flex', {
            showClass: 'animation-slide-in-fwd-left',
        });

        let isHidden = false;

        if (this.settings.notification.showCloseButton || !this.settings.notification.autoHide) {
            document.querySelector('.turbo-notification .close-button').addEventListener('click', (e) => {
                this.hideElement(e.target.closest('.turbo-notification'), false, {
                    hideClass: 'animation-slide-out-bck-left',
                });
                isHidden = true;
            });
        }

        if (this.settings.notification.autoHide) {
            setTimeout(() => {
                if (!isHidden) {
                    this.hideElement(notificationWrapper, false, {
                        hideClass: 'animation-slide-out-bck-left',
                    });
                    isHidden = true;
                }
            }, this.settings.notification.autoHideTime + this.settings.animation.duration);
        }
    }

    /**
     * get right functionality of floating placeholders
     * @param element
     */
    floatingPlaceholders(element = '') {
        let searchIn;

        if (element === '') {
            searchIn = document;
        } else {
            element = this.beNode(element);
            searchIn = element;
        }

        let inputs = searchIn.querySelectorAll('.turbo-ui.input input:not([type="submit"])');
        let textareas = searchIn.querySelectorAll('.turbo-ui.input textarea');

        this.bindFloatingInput(inputs);
        this.bindFloatingInput(textareas);
    }

    /**
     * bind inputs
     * @param inputs
     */
    bindFloatingInput(inputs) {
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].value !== '') {
                inputs[i].classList.add('filled');
            }

            inputs[i].addEventListener('input', e => {
                if (e.target.value !== '') {
                    e.target.classList.add('filled');
                } else {
                    e.target.classList.remove('filled');
                }
            });
        }
    }

    /**
     * capitalize first letter in string
     * @param string
     * @return {string}
     */
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * remove old animation class and add new
     * @param element to toggle class
     * @param newAnimationClass new animation class
     * @param newAnimationDuration new animation duration
     */
    toggleAnimationClass(element, newAnimationClass = this.settings.animation.showClass, newAnimationDuration = this.settings.animation.duration) {
        const oldAnimationRegex = /^animation-.+$/;
        let classToDelete = '';

        if (element.classList.value !== '') {
            for (let className of element.classList) {
                let match = oldAnimationRegex.exec(className);

                if (match !== null) {
                    classToDelete = match;
                    break;
                }
            }
        }

        if (classToDelete !== '') {
            element.classList.remove(classToDelete);
        }

        element.style.animationDuration = `${newAnimationDuration}ms`;
        element.classList.add(newAnimationClass);
    }

    /**
     * @param form
     * @param except
     * @return {{}}
     */
    collectFormData(form, except = ['_method', '_token']) {
        form = this.beNode(form);

        const inputs = form.querySelectorAll('input');
        const selects = form.querySelectorAll('select');
        const textareas = form.querySelectorAll('textarea');
        const _this = this;

        let collectedData = {};

        collectedData = {
            ...collectedData,
            ..._this.getDataFromInputs(inputs, except),
            ..._this.getDataFromSelects(selects, except),
            ..._this.getDataFromTextareas(textareas, except)
        };

        return collectedData;
    }

    /**
     * @param inputs
     * @param except
     * @return {{}}
     */
    getDataFromInputs(inputs, except) {
        let usedCheckboxValues = {};
        let data = {};

        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            const inputName = input.getAttribute('name');

            if (input.type === 'submit' || input.closest('.turbo-ui.select') !== null) {
                continue;
            }

            if (!except.includes(inputName)) {
                if (input.type === 'checkbox') {
                    if (usedCheckboxValues.hasOwnProperty(inputName)) {
                        if (input.checked) {
                            usedCheckboxValues[inputName].push(input.value);
                        }

                        usedCheckboxValues[`${inputName}-count`]++;
                    } else {
                        usedCheckboxValues[inputName] = [];
                        usedCheckboxValues[`${inputName}-count`] = 0;

                        if (input.checked) {
                            usedCheckboxValues[inputName].push(input.value);
                        }
                    }

                    // multiple choices are checked, get values instead of boolean value
                    if (usedCheckboxValues[`${inputName}-count`] > 1) {
                        data[inputName] = usedCheckboxValues[inputName];
                    } else {
                        data[inputName] = input.checked;
                    }
                } else if (input.type === 'radio') {
                    if (input.checked) {
                        data[inputName] = input.value;
                    } else if (this.isEmpty(data[inputName])) {
                        data[inputName] = null;
                    }
                } else {
                    data[inputName] = input.value;
                }
            }
        }

        return data;
    }

    /**
     * @param selects
     * @param except
     * @return {{}}
     */
    getDataFromSelects(selects, except) {
        let data = {};

        for (let i = 0; i < selects.length; i++) {
            const select = selects[i];
            const selectName = select.getAttribute('name');

            if (!except.includes(selectName)) {
                if (select.hasAttribute('multiple')) {
                    data[selectName] = [];

                    for (const option of select.options) {
                        if (option.selected) {
                            data[selectName].push(option.value);
                        }
                    }
                } else {
                    data[selectName] = selects[i].value;
                }
            }
        }

        return data;
    }

    /**
     * @param textareas
     * @param except
     * @return {{}}
     */
    getDataFromTextareas(textareas, except) {
        let data = {};

        for (let i = 0; i < textareas.length; i++) {
            const textareaName = textareas[i].getAttribute('name');

            if (!except.includes(textareaName)) {
                data[textareaName] = textareas[i].value;
            }
        }

        return data;
    }
}

export default Turbo;