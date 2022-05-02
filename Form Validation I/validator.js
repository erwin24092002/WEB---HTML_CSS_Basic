function Validator(options){
    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var selectorRules = {}

    function validate(inputElement, rule){
        var errorMessage 
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        
        var rules = selectorRules[rule.selector]

        for (var i=0; i<rules.length; i++){
            errorMessage = rules[i](inputElement.value)
            if(errorMessage) break
        }
        
        if(errorMessage){
            errorElement.innerText = errorMessage
            inputElement.parentElement.classList.add('invalid')
        }
        else{
            errorElement.innerText = ''
            inputElement.parentElement.classList.remove('invalid')
        }

        return !errorMessage
    }

    var formElement = document.querySelector(options.form)
    if(formElement) {
        formElement.onsubmit = function(e){
            e.preventDefault()

            var isFormValid = true
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if(!isValid)
                    isFormValid=false
            })

           

            if(isFormValid){
                if(typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    var formValues = Array.from(enableInputs).reduce(function(values, input){
                        values[input.name] = input.value
                        return values
                    }, {})

                    options.onSubmit(formValues)
                }
            }
            else{
                alert('Nhập chưa đủ thông tin')
            }
        }

        options.rules.forEach(function(rule){
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            }
            else {
                selectorRules[rule.selector]=[rule.test]
            }

            var inputElement = formElement.querySelector(rule.selector)
            if(inputElement){
                inputElement.onblur = function() {
                    validate(inputElement, rule)
                }
                
                inputElement.oninput = function(){
                    var errorMessage = rule.test(inputElement.value)
                    var errorElement = inputElement.parentElement.querySelector('.form-message')
                    errorElement.innerText = ''
                    inputElement.parentElement.classList.remove('invalid')
                }
            }
        })
    }
}

Validator.isRequired = function(selector) {
    return {
        selector: selector,
        test: function(value) {
            return value.trim() ? undefined : "Vui lòng nhập trường này"
        }
    }
}

Validator.isEmail = function(selector) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là Email'
        }
    }
}

Validator.minLength = function(selector, min) {
    return {
        selector: selector,
        test: function(value) {
            return value.length>=min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    }
}

Validator.isComfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value){
            return value == getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}