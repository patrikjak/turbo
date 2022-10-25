# Turbo

Useful JS functions to use

## Installation

``npm install turbostarter``

___

## Turbo Start Styling

Check example [here](https://github.com/patrikjak/turbo/blob/main/example/index.html) and pimp your page

___

## Default settings

```js
// default animation settings
turbo.settings.animation.duration = 300;
turbo.settings.animation.showClass = 'animation-slide-in-fwd-center';
turbo.settings.animation.hideClass = 'animation-slide-out-bck-center';

// default texts
turbo.settings.text.save = 'Save';
turbo.settings.text.cancel = 'Cancel';
turbo.settings.text.confirm = 'Confirm';
turbo.settings.text.info = 'Info';
turbo.settings.notFound = 'No results found';
turbo.settings.allSelected = 'All options have been selected';

// notification settings
turbo.settings.notification.autoHide = true;
turbo.settings.notification.autoHideTime = 4000;
turbo.settings.notification.showCloseButton = true;

// turbo select
turbo.settings.select.searchAlsoValue = false;
turbo.settings.select.notFoundOptionValue = '-';
turbo.settings.select.hideDisabledOptions = false;
turbo.settings.select.autoSelect = true;
turbo.settings.select.customLabel = '';

//turbo multiselect
turbo.settings.select.multiselect.hideSelected = true;
turbo.settings.select.multiselect.hideOptionsAfterSelect = false;
turbo.settings.select.multiselect.autoSelectFirstOption = false;
```

## Methods

``addGlobalEventListener(selector, type, callback, options, parent)`` - method will add global event listener

```js
turbo.addGlobalEventListener('button', 'click', () => {
    // Do something
});
```

``createElement(element, textContent, attributes)`` - creates a new element with attributes

```js
turbo.createElement('p', 'Some text', {
   class: ['description', 'faded'],
   id: 'product-description',
   dataset: {
       id: 5
   }
});

//> <p class="description faded" id="product-description" data-id="5">Element</p>
```

``beNode(element)`` - converts selector to node

```js
turbo.beNode('button.show-me');

//> <button class="show-me">Show me</button>
```

``isNode(element)`` - check if element is node

```js
turbo.beNode('button');

//> false
```

``isEmpty(variable)`` - check if variable is empty

```js
turbo.isEmpty({});
//> true

turbo.isEmpty([1, 2]);
//> false

turbo.isEmpty(0);
//> true
```

``insertAfter(newNode, referenceNode)`` - show element right after another element

```js
const element = turbo.createElement('p', 'Some text');

turbo.insertAfter(element, '.some-element');
```

``showElement(element, destination, position, display, animation)`` - show element to specific destination with custom display property

```js
const element = turbo.createElement('p', 'Some text');

turbo.showElement(element, '.destination', 'prepend', 'flex', {
   duration: 500,
   showClass: 'showing-animation'
});
```

``hideElement(element, all, animation)`` - hide element or all elements with specific selector - *element*

```js
turbo.hideElement('.element', true, {
   duration: 400,
   hideClass: 'hiding-animation'
});
```

``startLoader()`` - show loader element

```js
turbo.startLoader();
```

``stopLoader()`` - stop existing loader

```js
turbo.stopLoader();
```

``getData(element, dataAttribute)`` - get data-* attribute

```js
turbo.getData('#element', 'id');

//> '5'
```

``getCss(element, property)`` - get all or style property of element

```js
const element = document.querySelector('.element');

turbo.getCss(element, 'display');

//> 
```

``showModal(heading, content, buttons, id)`` - show modal window with custom heading and content
buttons value can be changed too, id will be '{id}-modal',
cancel button will be always displayed

```js
turbo.showModal('Today\'s news', '<p>Some news</p>', {
        primary: {
            hide: false,
            class: ['news-share'],
            id: 'custom-button-id',
            text: 'Share with love',
        },
        cancel: {
            class: ['news-cancel'],
            id: 'custom-button-id',
            text: 'Do not share',
        }
    }, 'news');
```

``showConfirmation(text, buttons)`` - show confirmation modal, returns promise by
clicking cancel (_reject()_) or confirm button (_resolve()_)

```js
// buttons settings can look like in the showModal method
turbo.showConfirmation('Are your sure?');
```

``notify(message, heading, level)`` - show notification with custom message and heading,
notification can have one of levels below, level - notification left border color

```js
// levels - ['success', 'info', 'warning', 'error']
turbo.notify('Data was not saved', 'Saving', 'error');
```

``floatingPlaceholders(element)`` - get right functionality of floating placeholders

```js
const form = document.querySelector('#my-form');

turbo.floatingPlaceholders(form);
```

``capitalizeFirstLetter(string)`` - capitalize the first letter in the string

```js
turbo.capitalizeFirstLetter('title');

//> 'Turbo'
```

``toggleAnimationClass(element, newAnimationClass, newAnimationDuration)`` -
remove old animation class and add new

```js
const options = document.querySelector('.options');

turbo.toggleAnimationClass(options, 'animation-slide-in-top', 150);
```

``collectFormData(form, except)`` - collect all form data except name of the inputs

object key is the attribute name of the input

```js
turbo.collectFormData('#my-form');
//> {name: 'John', email: 'john@example.com'}
```

## Turbo Select
___

``initSelects()`` - init turbo selects

- hide original select element and show custom
- original select element must be in wrapper with classes .turbo-ui.select
- searchable select - add a class 'searchable' for the select element
- multiselect - add a class 'multiselect' for the select element

```js
turboSelect.initSelect();

// this method will replace all selects with turbo select
```

## Turbo Validator
___
turboValidator.validate() - validate inputs

- if form will not be valid, errors appear automatically

```js
const rules = {
    name: {
        rules: 'required|max:8',
        fieldName: 'your turbo name' // define custom label for the field
    },
    surname: 'required',
    agreement: 'accepted', // checkbox must be checked
};
const form = document.querySelector('#form');

form.querySelector('input[type="submit"]').addEventListener('click', e => {
    e.preventDefault();
    turboValidator.validate(form, rules);
});
```