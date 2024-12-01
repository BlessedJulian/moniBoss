
import { check, body } from "express-validator";

// Sign Up
export const santiseUserSignUpInput = [
    // firstname
    body('Bio.firstName').trim().escape()
    .matches('^[A-Za-z]+$').withMessage('Firstname should only contain alphabets').bail()
    .isLength({
        min : 3,
        max : 10
    }).withMessage('Firstname require mininum of 3 characters and maxmum of 10 charcters')
    .bail(),

    // Lastname
    body('Bio.lastName').trim().escape()
    .matches('^[A-Za-z]+$').withMessage('Lastname should only contain alphabets').bail()
    .isLength({
        min : 3,
        max : 10
    }).withMessage('Lastname require mininum of 3 characters and maxmum of 10 charcters')
    .bail(),

    // Othername
    check('Bio.otherName') .optional({ checkFalsy: true }).trim().escape()
    .matches('^[A-Za-z]+$').withMessage('Othername should only contain alphabets').bail()
    .isLength({
        min : 3,
        max : 10
    }).withMessage('Othername require mininum of 3 characters and maxmum of 10 charcters')
    .bail(),

    // gender
    check("Bio.gender").trim().escape()
    .matches('^[A-Za-z]+$').withMessage('Gender should only contain alphabets').bail(),

    // phone Number
    check("contactDetail.phoneNumber").trim().escape()
    .matches('^[0-9]+$').withMessage('Phone number should only contain numbers').bail()
    .isLength({
        min : 11,
        max : 11
    }).withMessage('Invalid phone number')
    .bail(),

     // email
    check('contactDetail.email').trim().escape().normalizeEmail()
    .isEmail().withMessage('Invalid email address')
    .bail(),

    // Address
    check('contactDetail.address').trim().escape()
    .matches('^[A-Za-z0-9,:@ ]+$').withMessage('Invalid address syntax').bail()
    .isLength({
        min : 10 ,
        max : 80
    }).withMessage('address characters too long').bail(),

    // password
    check("password").trim().escape()
    .matches('^[0-9]+$').withMessage('Password should at least contain minimium of 6 numbers').bail()
    .isLength({
        min : 6,
        max : 8
    }).withMessage('password should not be less than 6 or more than 8 characters'),

    // confirm Password
    check('confirmPassword').trim().escape()
]

// Login
export const sanitiseUserLogIn = [
    // username
    check('username').trim().escape(),

    // password
    check('password').trim().escape()

]

// create transaction Pin
export const sanitiseUserTransPin = [
     // transaction Pin
     check("pin").escape()
     .matches('^[0-9]+$').withMessage('Pin should only contain numbers').bail()
     .isLength({
         min : 4,
         max : 4
     }).withMessage('pin length is four characters')
]

// reset password input
export const resetPasswordInput = [
    check('password').trim().escape()
    .isStrongPassword({
        minNumber : 1,
        minUppercase : 1,
        minLength : 1,
        minSymbols : 1,
        minLowercase : 1
    }).withMessage('Password should at least contain 1 uppercase, lowercase, number, special character and should not be less than 6 characters').bail()
    .isLength({max : 10}).withMessage('password should not be more than 10 characters')
]
