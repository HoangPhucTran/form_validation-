
function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }


    var selectorRules = {}

    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage
        var rules = selectorRules[rule.selector]

        for (let i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'))
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)
                    break;
            }
            if(errorMessage) break
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')

        } else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage
    }

    var formElement = document.querySelector(options.form)
    if (formElement) {

        formElement.onsubmit = function (e) {
            e.preventDefault()
            var isFormValid = true

            options.rule.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false
                }
            })
            
            if (isFormValid) {
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch (input.type) {
                            case 'radio':
                            case 'checkbox':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break;
                        
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    }, {})
                    console.log(formValues)
                    options.onSubmit(formValues)
                }
            } else {
                console.log('Có lỗi')
            }
        } 

        options.rule.forEach(function (rule) {
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
                
            } else {
                selectorRules[rule.selector] = [rule.test]
            }


            var inputElements = formElement.querySelectorAll(rule.selector)

            Array.from(inputElements).forEach(function (inputElement) {
                inputElement.onblur = function() {
                    validate(inputElement, rule)
                }

                inputElement.oninput = function () {
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            })

        })
    }
}

Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Email không hợp lệ' 
            
        }
        
    }
}   

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự` 
            
        }
        
    }
}   

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
            
        }
        
    }
}   
