const showInputError = (formElement, inputElement, errorMessage, options) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.toggle(options.inputErrorClass, true);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(options.errorClass);
};

const hideInputError = (formElement, inputElement, options) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.toggle(options.inputErrorClass, false);
  errorElement.textContent = '';
  errorElement.classList.remove(options.errorClass);
};

const checkInputValidity = (form, field, options) => {
  if (field.validity.patternMismatch && field.dataset.errorMessage) {
    showInputError(form, field, field.dataset.errorMessage, options);
  } else if (!field.validity.valid) {
    showInputError(form, field, field.validationMessage, options);
  } else {
    hideInputError(form, field, options);
  }
  
  return field.validity.valid;
};

const hasInvalidInput = (fields) => {
  return fields.some((field) => {
    return !field.validity.valid;
  });
};

const disableSubmitButton = (submit, options) => {
  submit.classList.add(options.inactiveButtonClass);
  submit.disabled = true;
};

const enableSubmitButton = (submit, options) => {
  submit.classList.remove(options.inactiveButtonClass);
  submit.disabled = false;
};

const toggleButtonState = (fields, button, options) => {
  if (hasInvalidInput(fields)) {
    disableSubmitButton(button, options);
  } 
  else {
    enableSubmitButton(button, options);
  }
};

function setEventListeners(form, options) {
  let fields = form.querySelectorAll(options.inputSelector);
  let button = form.querySelector(options.submitButtonSelector);
  let fieldsArray = [];
  
  for (let i = 0; i < fields.length; i++) {
    fieldsArray[i] = fields[i];
  }
  
  toggleButtonState(fieldsArray, button, options);
  
  for (let j = 0; j < fieldsArray.length; j++) {
    fieldsArray[j].addEventListener('input', function() {
      checkInputValidity(form, fieldsArray[j], options);
      toggleButtonState(fieldsArray, button, options);
    });
  }
}

function clearValidation(form, options) {
  let inputs = form.querySelectorAll(options.inputSelector);
  let button = form.querySelector(options.submitButtonSelector);
  
  for (let i = 0; i < inputs.length; i++) {
    let currentInput = inputs[i];

    hideInputError(form, currentInput, options);
  }
  
  disableSubmitButton(button, options);
}

const enableValidation = function(options) {
  let forms = document.querySelectorAll(options.formSelector);
  
  forms.forEach(function(form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault ? event.preventDefault() : (event.returnValue = false);
    });
    
    if (form.querySelectorAll) {
      let inputs = form.querySelectorAll(options.inputSelector);

      if (inputs.length > 0) {
        setEventListeners(form, options);
      }
    }
  });
};

export { enableValidation, clearValidation };
