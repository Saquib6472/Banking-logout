
'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 =
{
  owner: 'Abul saquib',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE

};

const account2 =
{
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',

};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovement = function (date,locale) 
{

    const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
    const daysPassed = calcDaysPassed(new Date(), date);
    
    if (daysPassed === 0) return 'Today';
    if (daysPassed === 1) return 'Yesterday';
    if (daysPassed <= 7) return `${daysPassed} days ago`;


/*
    const day = `${date.getDate()}`.padStart(2, 0);// we used the padstart here to show the date 02/8/2012 like this
    const month = `${date.getMonth() + 1}`.padStart(2, 0); //02/08/2014.
    const year = date.getFullYear();// since this one is 0 based we have to add 1
    return `${day}/${month}/${year}`;
*/
    return new Intl.DateTimeFormat(locale).format(date); 

};

const formatCur = function (value, locale, currency)
{
    return new Intl.NumberFormat(locale,
        {
            style: 'currency',
            currency: currency,

        }).format(value);

}

const displayMovements = function (acc, sort = false)
{
  containerMovements.innerHTML = '';

    const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function (mov, i) {
      const type = mov > 0 ? 'deposit' : 'withdrawal';

      const date = new Date(acc.movementsDates[i]);// so that is the current index in the movements array and the same index is gonna point to the equivalent date in 
    // this movements dates array.this is the common technique of looping over 2 arrays at the same time,so we call the foreach method on one of
    //them that's the movements then we each the current index to also get the data from some other array.

      const displayDate = formatMovement(date, acc.locale);

      const formattedMov = formatCur(mov, acc.locale, acc.currency);


      const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
        } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc)
{
    acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
    labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc)
{
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
    labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
    labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
    labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);

};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;// the reason for this global variable timer is we need this variable to access between different logins.otherwise,after the handler function here
                        // would be ready then the timer variable would disappear from the other login.

/*Fake always logged in

currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100
*/


const startLogOutTimer = function ()
{
    const tick = function ()// we made this function to call out the function immediately to the screen
    {
        const min = String(Math.trunc(time / 60)).padStart(2, 0);
        const sec = String(time % 60).padStart(2, 0);

        //In each call, print the remaining to the UI
        labelTimer.textContent = `${min}:${sec}`;

    
        //whem the time is at 0 seconds, stop the time and log out user.

        if (time === 0)
        {
            clearInterval(timer);
            labelWelcome.textContent = 'Log in to get started'
            containerApp.style.opacity = 0;
        }

        //Decrease 1s

        time--;


    };

    //set time to 5 minutes

    let time =50;

    // call the timer every second

    tick();
    const timer = setInterval(tick, 1000);
    return timer;

};

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

    if (currentAccount?.pin === +(inputLoginPin.value)) {
        // Display UI and message
        labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]
            }`;
        containerApp.style.opacity = 100;

        //clear current dates

        const now = new Date();
        const options =
        {
            hour: 'numeric',
            minute: 'numeric',
            day: 'numeric',
            month: 'numeric',// for the month if we put long it will show the whole month name suppose it's september so it will show september.
            year: 'numeric',//this is 2022, so if we put 2-digit will be only 22.
            //weekday: 'long'

        };

        //const locale = navigator.language;// this is how we get the users date dynamically.
        //console.log(locale);

        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);// we define the internationalizing API like this.this methods sets the 
                       //date for you no matter where u at.(asia,europe,etc).all that we need to pass in that function parameter here is a so called (locale string).and this
                         // locale is usually the language dash the country('en-US') so all of this creates a new formatter and on that formatter
                        // we can call .format and then here we actually pass in the date that we want to format and that's .format(now).



        /*
        const day = `${now.getDate()}`.padStart(2, 0);// we used the padstart here to show the date 02/8/2012 like this
        const month = `${now.getMonth() + 1}`.padStart(2, 0); //02/08/2014.
        const year = now.getFullYear();// since this one is 0 based we have to add 1
        const hours = `${now.getHours()}`.padStart(2, 0);
        const minutes = `${now.getMinutes()}`.padStart(2, 0);
        labelDate.textContent = `${day}/${month}/${year}, ${hours}:${minutes}`;
        */

   // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
        inputLoginPin.blur();

        if (timer) clearInterval(timer);
        timer = startLogOutTimer();// setting the timer to the timer that is returned here.however if there is already a timer we first need to clear it.suppose we logged in   
                                  // for js and there is timer already going on and then if we want to login for jd then we need to clear the jonas timer.

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
      receiverAcc.movements.push(amount);

    //Add Transfer Date

      currentAccount.movementsDates.push(new Date().toISOString());
      receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
      updateUI(currentAccount);

   // Reset the timer
      // so imagine that the timer was at 1:30seconds,so when we do a transfer that timer is cleared by clearinterval()and then the new timer started again at 2mins.
      clearInterval(timer);
      timer = startLogOutTimer();
  }

});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

    const amount = Math.floor(inputLoanAmount.value);

    if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {


            // Add movement
        setTimeout(function ()
        {
            currentAccount.movements.push(amount);

            // Add Loan date

            currentAccount.movementsDates.push(new Date().toISOString());

            // Update UI
            updateUI(currentAccount);

            //reset the timer// same as transfers description
            clearInterval(timer);
            timer = startLogOutTimer();

        }, 2500);
  }
    inputLoanAmount.value = '';


  
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});



let sorted = false;
btnSort.addEventListener('click', function () {
    displayMovements(currentAccount, !sorted);

    // if (!sorted) {
    //   printMovements(currentAccount.movements.slice().sort((a, b) => a - b));
    // } else {
    //   printMovements(currentAccount);
    // }
    sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES


/*
//converting and checking number

//In javascript all numbers are represented internally as floating point number.Basically always as decimals no matter if we write them as integers.and that's the reason
// why we only have one data type for numbers. also numbers are represented internally in a 64 base to format.so that means the numbers are always stored in a binary format.
//so basically they are only composed of 0's and 1's.

console.log(23 === 23.0);// true

// Base 10 = 0-9, 1/10 = 0.1, 3/10 = 3.33333
//Binary Base 2 = 0,1

console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);// we know that this is true. but when we log to the console it will show false cause this is the error of js that they can't fixed.

//converted string to numbers
console.log(Number('23'));
console.log(+'23');// it works as the same as Number method, because when javascript sees the +operator before a string number it does type coercion.s.o it will
                   //  automatically all the operands to numbers.

// parsing

// the parseint function actuallt accepts a 2nd argument which is so called reddix. and the reddix is based on the numeral system that we are using.so here we are simply 
//going to use base 10 number on the 2nd argument.
console.log(Number.parseInt('30px', 10));// by parseInt methd javascript will automatically catch that the string number value is actually a number not a string. 
                                     // even though if the string number has big string with it ('30px')=30.in order to make this work the string needs to start with a
                                    // Number.

//console.log(Number.parseInt('e23'));// this is not gonna work.

// there is also parseFloat

console.log(Number.parseFloat('2.5rem', 10));
console.log(Number.parseInt('2.5rem', 10));// if we put parseInt then we will only get int part which is 2.

//isNaN

//check if value is NaN
console.log(Number.isNaN(20));// basically here isNaN is going to check that if the value is a number or not.so here it's just a value so it will log as false.
console.log(Number.isNaN('20'));// still going to be false cause it's still a value.
console.log(Number.isNaN(+'20e'));// now it's going to be true cause it's actually not a number because we put a string in there.// true.
console.log(Number.isNaN(23 / 0));// dividing by 0 gives us infinite.so dividing by 0 it's something that not allowed in mathemetics and so it will give us infinity and 
                                  // infinity is also not a number.

//isFinite

// isFinite is the opposite of NaN. also isFinite is the best method for checking it the value is a number

console.log(Number.isFinite(20));// true
console.log(Number.isNaN('20'));// false
console.log(Number.isNaN(+'20e'));// false
console.log(Number.isFinite(23 / 0));//false. cause it's inifinity.

//isInt
console.log(Number.isInteger(20));//true
console.log(Number.isInteger(20.0));//true
console.log(Number.isInteger(23 / 0));//false


*/

// Math and rounding

/*
console.log(Math.sqrt(25));// square root of 25
console.log(25 ** (1 / 2));// this is the same as square root
console.log(8 ** (1 / 3));// this will be cubic root of 8 which is 2.
console.log(Math.max(5, 18, 23, 11, 2));// it will return the max value which is 23.
console.log(Math.max(5, 18, '23', 11, 2));// this max value also does the type coercion.but it doesn't do parseInt so if we put the '23pxs' it will not work work.
console.log(Math.min(5, 18, 23, 11, 2));
console.log(Math.PI * Number.parseFloat('10px') ** 2);// this is how we calculate the area of a circle with this-> ('10px') radius.
console.log(Math.trunc(Math.random() * 6) + 1);

//math.random is between 0 and 1.
const randomInt = (min, max) => Math.floor(Math.random() * (max - min) + 1) + min;
//0...1->0...(max-min)->min...max
console.log(randomInt(10, 20));

// rounding integers


// all of this methods they also does type coercion.

console.log(Math.round(23.3));// it will be 23
console.log(Math.round(23.9));// it will be 24, cause of the nearest integer

console.log(Math.ceil(23.3));// this will round up and will make number 23 as 24
console.log(Math.round(23.9));// 24

console.log(Math.floor(23.3));// this one will rounded down to 23
console.log(Math.floor(23.9));//23

console.log(Math.trunc(-23.3));// math.trunc is to remove any decimal part.
//math.round will always round to the nearest integer.

console.log(Math.floor(-23.3));// because of the floor will round up to -24.but when it's a positive sign floor will round down.

// rounding decimals

console.log((2.7).toFixed(0));// tofixed always returns with the string, not with the number.
console.log((2.7).toFixed(3));// it will return 2.700, also it adds 0's until it has 3 decimal parts.
console.log((2.345).toFixed(2));// it will return 2.35. the first and the last decimal number.
console.log(+(2.345).toFixed(2));// converted the string to a number


*/

//The remainder operator


/*
console.log(5 % 2);// the remainder is one in here cause if we do 5/2 there will be 1 left, and that 1 is the remainder.
console.log(5 / 2);//5=2*2+1

console.log(8 % 3);// 2
console.log(8 / 3);//8=2*3+2->2 is the remainder

console.log(6 % 2);//0 cause there is nothing left
console.log(6 / 2);//3

console.log(7 % 2);//1
console.log(7 / 2);

const isEven = n => n % 2 === 0;
console.log(isEven(8));// 8 is an even number there will be nothing left, so that's why its true
console.log(isEven(23));// 23 is an odd number, so that's why it's false,cause there will be something left
console.log(isEven(514));//true.

labelBalance.addEventListener('click', function ()
{

    [...document.querySelectorAll('.movements__row')].forEach(function (row, i)
    //0,2,4,6
    {
        if (i % 2 === 0)
            row.style.backgroundColor = 'orangered';// so everytime we click the label balance the deposit will show as orangered color.also it will show after every 2nd 
                                                    //position

        //0,3,6,9
        if (i % 3 === 0)// it will show after every third position.
    
            row.style.backgroundColor = 'blue';

    
    })


});

*/

//Numeric separators


/*
//287,460,000,000
const diameter = 287_460_000_000;
console.log(diameter);

const price = 345_99;
console.log(price);

const transferFee1 = 15_00;
const transferFee2 = 1_500;

const PI = 3.1415;
console.log(PI);

*/

/*
// working with BigInt

console.log(2 ** 53 - 1);// this is the biggest number that javascript can safely represent
console.log(Number.MAX_SAFE_INTEGER);// this gives us the same thing.
console.log(2 ** 53 + 1);
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);

//BigInt uses for as large number as we want

console.log(483313948144843890432890234983242084n)//with this n this can be a bigInt.this n here basically transforms a regular number into a bigint number.
console.log(BigInt(483313948));

//Operations

console.log(10000n + 10000n);
console.log(10000000002030300000000330n * 10303020301204848n);
//console.log(Math.sqrt(16n));// won't work

//you cannot mix bigint with regular numbers

const huge = 73201401940843290249034903249043n;
const num = 23;
//console.log(huge * num);// it will be an error
console.log(huge * BigInt(num));// now it's going to work

//exception
console.log(20n > 15);// true
console.log(20n === 20);// false cause in js when we use the === operator it doesn't do type coercion.
console.log(20n == '20');// true cause of type coercion
console.log(huge + ' is really big');

//divisions
console.log(10n / 3n);// it will simple return the closes bigint which is 3

*/

//creating dates
/*
const now = new Date();
console.log(now);// we get the current date and time

console.log(new Date('Sep 14 2022 04:57:01 GMT-0400'));
console.log(new Date('Dec 24 2015'));
console.log(new Date(account1.movementsDates[0]));
console.log(new Date(2037, 10, 19, 15, 23, 5));// so it will show us this Thu Nov 19 2037 15:23:05 GMT-0500// but here we put the 10 as month so it should be october
                                               // but it showed november cause js works on 0 based.
console.log(new Date(2037, 10, 31));// since november has only 30 days.js will autocorrect the date and make it dec 01.

console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));



//working with date

const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());// it doesn't mean that day of the month, it means that day of the week
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());// it is one of the most useful cases, when you want to convert a particular date object into a string that you can store somewhere
console.log(future.getTime());
console.log(new Date(2142274980000));
console.log(Date.now());

future.setFullYear(2040);
console.log(future);// now the date of the year will be 2040.

*/


//operation with dates

/*
const future = new Date(2037, 10, 19, 15, 23);
console.log(+future);

const calcDaysPassed = (date1, date2) => Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);// this 1000 in here will convert the milliseconds to seconds and then *60 will convert 
                                                                            //that seconds to a minute then *60 will convert that minute to an hour then *24 will convert
                                                                            // that hours to a day.
//const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 24));// so april 14 to april 24 is 10 days.
const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 4));// here when it logs to the console without Math.abs it will show -10 days.
console.log(days1);//this will give us some milliseconds.

*/
// Internationalizing Numbers


//const num = 384848484.23;

//the 3 different options for the style is unit,percent and currency, but when we define the percent and currency we completely ignore the unit.but in currency we have to 
// define it by currency.


/*
const options =
{
    style: 'unit',
    unit: 'mile-per-hour'
};



const options =
{
    style: 'unit',
    unit: 'celsius'
};


const options =
{
    style: 'percent',
    unit: 'celsius'
};



const options =
{
    style: 'currency',
    unit: 'celsius',
    currency: 'EUR',
  //useGrouping:false,// with this method the number will be just printed as exactly the way it is without the separators.

};


console.log('Us:', new Intl.NumberFormat('en-US',options).format(num));
console.log('Germany:', new Intl.NumberFormat('de-DE',options).format(num));
console.log('Syria:', new Intl.NumberFormat('ar-SY',options).format(num));
console.log(navigator.language, new Intl.NumberFormat(navigator.language,options).format(num));// we can get what country we are doing this from by (navigator.language) method

*/

// setTimeOut and setInterval

// settimeout timer runs just ones after a define time.
// interval timer keeps running basically forever until we stop it.


/*
const ingredients = ['olives', 'spinach'];
// also we can setup a function argument in setimeout method
const pizzaTimer = setTimeout((ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`), 3000, ...ingredients);
console.log('Waiting...');

if (ingredients.includes('spinach'))   
{
    clearTimeout(pizzaTimer);// so the cleartimeout()method in here will basically clear the settimeout.because the pizza ingredients includes with spinach.
}


//setinterval

setInterval(function ()// this callback function is now executing every second.so every sec a new date is created here and it's then log to the console.
{
    const now = new Date();
    console.log(now);

},1000);

*/





















