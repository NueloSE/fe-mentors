'use strict'

// let year = document.getElementById('year');
// let month = document.getElementById('month');
// let day = document.getElementById('day');

const dayTitle = document.querySelector('label[for="day"]');

let dayError = document.querySelector('.day-error');
let monthError = document.querySelector('month-error');
let yearError = document.querySelector('year-error');

const checkBtn = document.querySelector('.submitBtn');

const resetBtn = document.querySelector('.resetBtn');

const yearInputField = document.getElementById('year');
const monthInputField = document.getElementById('month');
const dayInputField = document.getElementById('day');

const getInputValue =  (field) => document.getElementById(field).value


let checkEmptyInput = (input) =>{
    const inputFeild = document.getElementById(input);
    if (!inputFeild.value){
        console.log(`${input} is ${inputFeild}`);
        inputFeild.classList.add('error-input')

        document.querySelector(`.${input}-error`).textContent = 'This field is required';
        document.querySelector(`label[for="${input}"]`).classList.add('error-field');
    }
}

let validateDay = (input) => {
        document.querySelector(`.${input}-error`).textContent = 'Must be a valid date';
        document.querySelector(`label[for="${input}"]`).classList.add('error-field');
        document.getElementById(input).classList.add('error-input');
}

let validateMonth = (input) => {
    document.querySelector(`.${input}-error`).textContent = 'Must be a valid month';
    document.querySelector(`label[for="${input}"]`).classList.add('error-field');
    document.getElementById(input).classList.add('error-input');
}

let validateYear = (input) => {
    let errorMessage = document.querySelector(`.${input}-error`)
    if (getInputValue(input) < -1){
        errorMessage.textContent = 'Must be a valid year';
    } else {
        errorMessage.textContent = 'This date is in the future';
    }
    document.querySelector(`label[for="${input}"]`).classList.add('error-field');
    document.getElementById(input).classList.add('error-input');
}

function fullDateValidator() {

    let dayValue = Number(getInputValue('day'));
    let monthValue = Number(getInputValue('month'));
    let monthWith30 = [4, 6, 9, 11];

    if ((monthWith30.includes(monthValue)) && (dayValue === 31)) {
        document.querySelector('.day-error').textContent = `${monthValue}th month contains only 30 days`;
        document.querySelector(`label[for="day"]`).classList.add('error-field');
        document.getElementById('day').classList.add('error-input');
        return false;
    } 
        
    else if ( (monthValue === 2) && (dayValue > 29)) {
        document.querySelector(`.day-error`).textContent = `${monthValue}nd month contains only 29 days`;
        document.querySelector(`label[for="day"]`).classList.add('error-field');
        document.getElementById('day').classList.add('error-input');
        return false;
    }
    return true;
}

function inputValidator(input)  {
    let value = getInputValue(input);
    let year = getInputValue('year');
    let month = getInputValue('month') - 1;
    let day = getInputValue('day') + 1;
    
    if ((input === 'day') && (value < 1 || value > 31)) {
        validateDay(input);
        return false;
    } else if ((input === 'month') && (value < 1 || value > 12)) {
        validateMonth(input);
        return false;
    } else if ((input === 'year') && ((new Date(year, month, day)) > (new Date()) || value < 1900)){
        validateYear(input);
        return false;
    }
    return true
}

function computeAge() {
    if (inputValidator('day') && inputValidator('month') && inputValidator('year') &&fullDateValidator()) {

    let today = new Date();
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth() + 1;
    let currentDay = today.getDate();

    let birthYear = Number(getInputValue('year'));
    let birthMonth = Number(getInputValue('month'));
    let birthDay = Number(getInputValue('day'));

    let calcYear;
    let calcMonth;
    let calcDay;

    if ((currentMonth === birthMonth) && (currentDay === birthDay)) {
        calcYear = currentYear - birthYear;
        calcMonth = 0;
        calcDay = 0
    } else if (birthMonth > currentMonth) {
        calcYear = currentYear - birthYear - 1;
        calcMonth = currentMonth - 1;
        calcDay = currentDay;
    } else if (birthMonth < currentMonth) {
        calcYear = currentYear - birthYear;
        calcMonth = currentMonth - birthMonth - 1;
        calcDay = currentDay;
    } else if ((currentMonth === birthMonth) && (birthDay < currentDay)){
        calcYear = currentYear - birthYear;
        calcMonth = 0;
        calcDay = currentDay - birthDay;
    }

    document.getElementById('calc-year').textContent = calcYear;
    document.getElementById('calc-month').textContent = calcMonth;
    document.getElementById('calc-day').textContent = calcDay
    }
}

function clearInput(input) {
    document.getElementById(input).value = null;
}

function clearError(input) {
    document.querySelector(`.${input}-error`).textContent = '';

    document.querySelector(`label[for="${input}"]`).classList.remove('error-field');

    document.getElementById(input).classList.remove('error-input');
}

function clearResult(input) {
    document.getElementById(`calc-${input}`).textContent = '--';
}

function clearAllField(input) {
    clearResult(input);
    clearError(input);
    clearInput(input);
}

checkBtn.onclick = computeAge;

resetBtn.addEventListener('click', function() {
    clearAllField('day');
    clearAllField('month');
    clearAllField('year');
})

yearInputField.addEventListener('keypress', function(event){
    if (event.key === 'Enter'){
        computeAge();
    }
})

yearInputField.oninput = () => {
    clearError('year');
}

monthInputField.oninput = () => {
    clearError('month');
} 

dayInputField.oninput = () => {
    clearError('day');
}
