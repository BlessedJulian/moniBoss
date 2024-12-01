import express from "express"
import { signUpMethod, otpMethod, logInMethod,  passwordMethod, changeUserTranPinMethod, createTranPinMethod, changeUserPasswordMethod, updatedProfileMethod, ninMethod, requireUserNINToken} from "../method/userMethod.js"
import { sanitiseUserLogIn, sanitiseUserTransPin, santiseUserSignUpInput} from "../middleWare/sanitizeInput.js"
import { requireToken } from "../middleWare/authenticateUser.js"
import { profilePic } from "../controller/multerController.js"
import { requireNINToken } from "../middleWare/authenticateuserNiN.js"
import { isAuthenticated } from "../middleWare/isAuth.js"

const router = express.Router()


router
    // otp route
    .post('/otp/:otp',  otpMethod)
    // for user nin
    .post('/userNIN', requireUserNINToken,  ninMethod)
    // for sign up 
    .post ('/signUp', santiseUserSignUpInput,  signUpMethod)
    // for Log In
    .post ('/logIn', sanitiseUserLogIn, logInMethod)
    //  for transactionPin
    .post('/creatTranPin', sanitiseUserTransPin, isAuthenticated, createTranPinMethod)
    // reset password
    .post('/resetPassword/:password', passwordMethod)
    // Change User Transaction password
    .post('/changeUserTranPin',requireToken , changeUserTranPinMethod)
    // Change User  password
    .post('/changeUserPassword', requireToken, changeUserPasswordMethod)
    // for user to update their profile
    .post('/updateProfile',  requireToken, profilePic, updatedProfileMethod)
   
   
export const USER = {
        router
}