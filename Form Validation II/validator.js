function Validator(formSelector){
    var _this = this
    var formRules = {}
     
    function getParent(element, selector){
        while (element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement
            }
            element = element.parentElement
        }
    }
    
    var validatorRules = {
        /** Quy ước tạo rule
        * Nếu có lỗi thì return `error message 
        * Nếu không có lỗi thì return `undefined`
        */
        required: function(value){
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Email không hợp lệ'
        },
        min: function(min){
            return function(value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} kí tự`
            }
        },
        max: function(max){
            return function(value) {
                return value.length <= max ? undefined : `Vui lòng nhập không quá ${min} kí tự`
            }
        },
    }

    var formElement = document.querySelector(formSelector)
    if(formElement){
        var inputs = formElement.querySelectorAll('[name][rules]')

        for(var input of inputs){
            var rules = input.getAttribute('rules').split('|')
            for(var rule of rules){
                if(rule.includes(':')){
                    var ruleInfo = rule.split(':')
                    rule = validatorRules[ruleInfo[0]](ruleInfo[1])
                }
                var ruleFunc = typeof rule == 'function' ? rule : validatorRules[rule]
                if(Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunc)
                }
                else {
                    formRules[input.name] = [ruleFunc]
                }
            }
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }

        function handleValidate(event) {
            var rules = formRules[event.target.name]
            var errorMessage

            for (var rule of rules){
                errorMessage = rule(event.target.value)
                if(errorMessage) 
                    break
            }

            if(errorMessage){
                var formGroup = getParent(event.target, '.form-group')
                if(formGroup){
                    var formMessage = formGroup.querySelector('.form-message')
                    if(formMessage){
                        formMessage.innerText = errorMessage
                    }
                    formGroup.classList.add('invalid')
                }                
            }

            return !errorMessage
        }

        function handleClearError(event){
            var formGroup = getParent(event.target, '.form-group')
            if(formGroup){
                formGroup.classList.remove('invalid')
                var formMessage = formGroup.querySelector('.form-message')
                if(formMessage){
                    formMessage.innerText = ''
                }
            }
        }

        formElement.onsubmit = function(event) {
            event.preventDefault();
            
            var isValid = true
            for(var input of inputs){
                isValid = handleValidate({target: input})
            }
            if(isValid){
                if(typeof _this.onSubmit == 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    var formValues = Array.from(enableInputs).reduce(function(values, input){
                        values[input.name] = input.value
                        return values
                    }, {})
                    _this.onSubmit(formValues)
                }
                else {
                    formElement.submit()
                }
            }
        }
    }
}
