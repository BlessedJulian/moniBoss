import { validationResult } from "express-validator"
import { BAD_REQUEST, CREATED, OK, UNPROCESSABLE_CONTENT } from "../constants/statusCode.js"
import { tryCatch, appError } from "../utils/index.js"
import { User } from "../model/usermodel.js"
import { generateOTP } from "../controller/generateOTP.js"
import { OTPDataDetail } from "../model/OTPModel.js"
import { responseHandler } from "../controller/responseHandler.js"
import crypto from "crypto"
import bcrypt from 'bcryptjs'
import { SECRET } from "../config.js"
import axios from "axios"


// OTP Method
export const otpMethod = tryCatch(async(req, res, next) => { 

    // -----------------Send OTP-------------------------------
    if(req.params['otp'] === "sendOTP"){

        const{phoneNumber} = req.body
        
        // checking if field is empty
        if(!phoneNumber)  
            throw new appError(BAD_REQUEST, 'Please enter a phone number in the designated field')

        // checking PhoneNumber  length
        if(phoneNumber.length != 11) throw new appError(BAD_REQUEST, "Invalid Phone Number")
         
        // add +234 to phone number
        // const completeNumber = '+234' + (phoneNumber).replace(/^0/, '')
        const completeNumber = Number(phoneNumber)

        if(!completeNumber) throw new appError(BAD_REQUEST, 'Invalid Phone Number')


        //  checking  if user phone number exist in the user database
        const Users = new User

        const checkIfPhoneNumberExist = await Users.findPhoneNumber({'contactDetail.phoneNumber' : completeNumber})
        

        if(checkIfPhoneNumberExist) 
            throw new appError(BAD_REQUEST, 'This phone number has already been used')

        // generate OTP
        const genOTP = generateOTP(6);



        // checking if phone number exist in otp database
        const otpDetail = new OTPDataDetail

        // Hashing of OTP
        const encryptOTP = await otpDetail.createHashedOTP(genOTP)
        console.log({otp : genOTP})

        
        const findOTPPhoneNumber = await otpDetail.findPhoneNumberOTP({phoneNumber :completeNumber})

        
        if(findOTPPhoneNumber){
            const filter = { phoneNumber : completeNumber };
            const updateData = {
                OTP: encryptOTP,
                expiredAt: Date.now() + 360000 
            }

            const updatedOtpRecord = await otpDetail.updateUserOTP(filter, updateData)
            
            responseHandler(req, res, OK,  'OTP Resent', updatedOtpRecord ) 

        }else{

            // Save user otp to database
            const addOTP = await otpDetail.addUserOTP({
                phoneNumber : completeNumber,
                OTP : encryptOTP,
                expiredAt : Date.now() + 360000
            }) 
        
            addOTP.save()
                    
             responseHandler(req, res, CREATED, 'OTP created', "OTP has been sent " ) 

        }

    }

    // ===================validate sent OTP =================
     else if(req.params['otp'] === "validateOTP" ){

        const{phoneNumber, otp} = req.body

         // add +234 to phone number
         const completeNumber = '+234' + (phoneNumber).replace(/^0/, '')

        // checking if otp field is empty
        if(!otp) 
            throw new appError(BAD_REQUEST, 'Please enter the OTP that was sent to your phone number')

        // checking OTP  length
        // if(otp.length != 6) throw new appError(BAD_REQUEST, "Invalid OTP")

        const otpDetail = new OTPDataDetail


        const findOTPPhoneNumber = await otpDetail.findOTP({phoneNumber : completeNumber})

        // checking if otp match

        const hashedOTP = await otpDetail.verifyOTP(otp)

        const compareOTP =  hashedOTP === findOTPPhoneNumber.OTP
        if(!compareOTP) throw new appError(BAD_REQUEST, "Wrong OTP")

        
        // checking if OTP has expired
        const expired =   Date.parse(findOTPPhoneNumber.expiredAt)
        
        const compareTime = Date.now() > expired

        if(compareTime) throw new appError(BAD_REQUEST, "Expired OTP")

        responseHandler(req, res, 200, "","proceed to register")

     }

 })

//  Get user nin token header
export const requireUserNINToken = tryCatch(async(req, res, next) => {
    
     const response = await axios.post('https://passport.immigration.gov.ng:8443/ngnPassport/v1/auth/serverToken')

    //  return(res.json(response.data))
 
    const jsonData = JSON.stringify(response.data); // Parse if it's a string
    const header = JSON.parse(jsonData);

    req.header = header
    
       next ()

})

//Get user NIN
export const ninMethod = tryCatch(async(req, res, next) => {
    const token = req.header
    const {bearerToken} = token

    const {dateOfBirthMonth, nin, dateOfBirthDay,dateOfBirthYear,dateOfBirth } = req.body

    if(!dateOfBirthMonth || !dateOfBirthDay || !dateOfBirthYear || !nin) 
        throw new appError(BAD_REQUEST, 'Please all field')
  const header = { 
        'Application_crest': `${bearerToken}`, 
        'Content-Type': 'application/json'
    }

    const config = {  
        method: 'post',
        url: 'https://passport.immigration.gov.ng:8443/ngnPassport/v2/application/validateNIN',
        headers : header,
        data : {
            "applyingFor": "FRESH",
            dateOfBirthMonth,
            nin,
            dateOfBirthDay,
            dateOfBirthYear,
            dateOfBirth
        }
    };

    axios.request(config)
    .then((response) => {
     const userData = (JSON.stringify(response.data));
     const userDetail = JSON.parse(userData);
     const {details : {firstName, middleName, lastName, gender}} = userDetail
        //  req.firstName = firstName
        //  req.middleName = middleName
        //  req.lastName = lastName
        //  req.gender = gender

        // return res.send({firstName, middleName, lastName, gender})
        responseHandler(req, res, OK, {firstName, middleName, lastName, gender} ) 
      
     
    })
    .catch((error) => {
        console.log(error.message);
    });    
    
})



// user sign up
export const signUpMethod = tryCatch(async(req, res, next) => {

     // destructuring request body
    const {Bio :{firstName, lastName, otherName, gender}, contactDetail : {phoneNumber, email,  address}, password, confirmPassword} = req.body


    // checking if fields are empty
    if(!firstName || !lastName  || !email || !address || !password || !confirmPassword || !phoneNumber || !gender)
        throw new appError(BAD_REQUEST, 'Please fill in all required fields')

    // checking user error 
    const error = validationResult(req)
    if(!error.isEmpty()){
        const errorObj = error.array().map(err => err.msg)
        throw new appError(UNPROCESSABLE_CONTENT, errorObj)
    }


    //checking if password match
    if(password != confirmPassword) throw new appError(UNPROCESSABLE_CONTENT, 'password match')

    // add +234 to phone number
    const completeNumber = '+234' + (phoneNumber).replace(/^0/, '')

        const Users= new User

    
    //  checking  user phone Number  email exist
    const checkingUseremail= await Users.findUser({'contactDetail.email' : email})
    const checkingPhoneNumber= await Users.findUser({'contactDetail.phoneNumber' : completeNumber})

    // const alreadyExistData = await Users.findUser({$or : [
    //     {'contactDetail.email' : email}, {'contactDetail.phoneNumber' : completeNumber}
    // ]})

    // if(alreadyExistData) 
    //     throw new appError(BAD_REQUEST, ' The provided phone number and email address are already associated with an existing account.')


    if(checkingPhoneNumber) 
        throw new appError(BAD_REQUEST, 'This phone number has already been used')
    if(checkingUseremail) 
        throw new appError(BAD_REQUEST, 'The email address  already exists')

   
        // add new user
        const newUser = await Users.addUser({
            Bio : {
                firstName,
                lastName,
                otherName,
                BVN : null,
                gender
            },
            contactDetail : {
                phoneNumber : completeNumber,
                email,
                address
            }, 
            password
        })

        newUser.save()
    

    responseHandler(req, res, OK, 'account created', `${newUser.Bio.firstName} proceed to Log In`) 

})


// user Log In
export const logInMethod = tryCatch(async(req, res, next) => {

    // destructuring request body
    const {phoneNumber, password} = req.body

    
    // check ing if fields are empty
    if(!phoneNumber || !password )
        throw new appError(BAD_REQUEST, 'Please fill in all required fields')

    
    // add +234 to phone number
    const completeNumber = '+234' + (phoneNumber).replace(/^0/, '')

    const Users= new User
 
    //  checking  user exist
    const checkIfUserExist= await Users.findUser({'contactDetail.phoneNumber' : completeNumber})


    if(!checkIfUserExist) throw new appError(BAD_REQUEST, 'Phone Number or password not found')


    // comparing password
	const comparePassword = await bcrypt.compare(password, checkIfUserExist.password)


	if(!comparePassword) 
        throw new appError(BAD_REQUEST, 'Phone Number or password not found')

        
    // creating JWT for verify Users
    const{_id} = checkIfUserExist 
      

    // const token  = await Users.userAuthentication({_id})
     req.session._id = _id
    const ttt= req.session.id

    responseHandler(req, res, OK, 'login successful', {_id, ttt})
})


// create transaction pin
export const createTranPinMethod = tryCatch(async(req, res, next) => {

    const _id = req.session._id 
    
     // destructuring request body
     const {pin, confirmPin} = req.body

     // checking if fields are empty
     if(!pin || !confirmPin )
         throw new appError(BAD_REQUEST, 'Please fill in all required fields')
 
     // checking user error 
     const error = validationResult(req)
     if(!error.isEmpty()){
         const errorObj = error.array().map(err => err.msg)
         throw new appError(UNPROCESSABLE_CONTENT, errorObj)
     }

    //checking if pin match
    if(pin != confirmPin) throw new appError(UNPROCESSABLE_CONTENT, 'pin mismatch')

    // create transaction Pin
    const hash = crypto.createHmac('sha256', SECRET)
                .update(pin)
                .digest('hex');
 

    const Users= new User
    

    const filter = { _id};
    const updateData = {
        transactionPin : hash
    }

    // checking if transaction pin exit
    const checkifTranspin = await Users.findUser(filter)

    
    // destructuring checkifTranspin
    const transPin = checkifTranspin.transactionPin == null

    // return res.send(trans)

    if(transPin){
         const createPin = await Users.updateUsers(filter, updateData)
         responseHandler(req, res, CREATED, 'Transaction Pin created', createPin)
     }
     else{
        throw new appError(BAD_REQUEST, 'You already created a transaction PIN')
     }
})


//.................................... password reset token..................................
export const passwordMethod = tryCatch(async(req, res, next) => {

    // -----------------Send Reset password token-------------------------------
    if(req.params['password'] === "forgetPassword"){

        const{phoneNumber} = req.body

        // checking if field is empty
        if(!phoneNumber)  
            throw new appError(BAD_REQUEST, 'Please enter a phone number in the designated field')

        // checking PhoneNumber  length
        if(phoneNumber.length != 11) throw new appError(BAD_REQUEST, "Invalid Phone Number")
        
        // add +234 to phone number
        const completeNumber = '+234' + (phoneNumber).replace(/^0/, '')


        //  checking  if user phone number exist in the user database
        const Users = new User

        const checkIfPhoneNumberExist = await Users.findPhoneNumber({'contactDetail.phoneNumber' : completeNumber})

        if(!checkIfPhoneNumberExist) 
            throw new appError(BAD_REQUEST, 'Verify that the phone number you entered is correct')

        // generate OTP
        const genOTP = generateOTP(6);

        // Hashing of OTP
        const encryptOTP = await Users.createHashedOTP(genOTP)
        console.log({otp : genOTP})

        const filter = { 'contactDetail.phoneNumber' : completeNumber};
        const updateData = {

             resetToken :   { token  : encryptOTP,
                expiredAt: Date.now() + 360000 
            }
        }
    
        // checking if transaction pin exit
        const check = await Users.updateUsers(filter, updateData)
        
        responseHandler(req, res, CREATED, `Reset token created`, 'proceed to validate token sent to You')
    }


    // -----------------validate Reset password token-------------------------------
    else if(req.params['password'] === "validatePasswordToken" ){
        const{phoneNumber, token, password, confirmPassword} = req.body

        // checking if field is empty
        if(!phoneNumber || !token || !password || !confirmPassword)  
            throw new appError(BAD_REQUEST, 'Please fill in all required fields')

        // add +234 to phone number
        const completeNumber = '+234' + (phoneNumber).replace(/^0/, '')

        // checking token  length & password length
        if(token.length != 6) throw new appError(BAD_REQUEST, "Invalid token")
        if (password.length != 6) 
            throw new appError(BAD_REQUEST, "Password should contain six characters")
        
        // checking if password is strictly Number
        const pass = Number(password)
        const confirmPass = Number(confirmPassword)

        if(!pass || !confirmPass)throw new appError(BAD_REQUEST, "Password should only contain numbers")

        // checking if both password match
        if(password != confirmPass) throw new appError(BAD_REQUEST, 'Password mismatch')
        
        const Users= new User

        const findUser = await Users.findUser({'contactDetail.phoneNumber' : completeNumber})
        

        // destructuring findPhoneNumber
        const {resetToken : {token : tokenNumber, expiredAt}} = findUser

        // checking if token match
        const hashedToken = await Users.verifyToken(token)

        const compareToken=  hashedToken === tokenNumber
        
        if(!compareToken) throw new appError(BAD_REQUEST, "Wrong Token")

        // checking if Token has expired
        const expired =   Date.parse(expiredAt)
        
        const compareTime = Date.now() > expired

        if(compareTime) throw new appError(BAD_REQUEST, "Expired Token")
        
        // update user new password
        const hashedPassword = bcrypt.hash(password, 12)

        const filter = { 'contactDetail.phoneNumber' : completeNumber};
        const updateData = {
            password : await bcrypt.hash(password, 12)
        }
        const updateUserPassword = await Users.updateUsers( filter, updateData)
        // return res.send(updateData)

        responseHandler(req, res, 200, "Token Validated",updateUserPassword)
        
    }
})


// .................Change User Transaction pin........................
export const  changeUserTranPinMethod = tryCatch(async(req, res, next) => {
    const _id = req._id
    
    // destructuring request body
    const {oldPin, newPin, confirmNewPin} = req.body 

    // checking if fields are empty
    if(!oldPin ||!newPin || !confirmNewPin )
        throw new appError(BAD_REQUEST, 'Please fill in all required fields')

    // Checking Transaction Pin Length
    if(newPin.length != 4) throw new appError(BAD_REQUEST, "pin length is four characters ")


    // checking if New transaction pin is numberonly
    const numberNewPin = Number(newPin)
    if(!numberNewPin)throw new appError(BAD_REQUEST, 'Pin should only contain numbers')


    // checking if both pin match
    if(numberNewPin != confirmNewPin)throw new appError(BAD_REQUEST, 'Password mismatch')

    const pin = numberNewPin.toString()

    const Users= new User

    const findTranPin =  await Users.findUserDetail(_id)

    // destructuring findTranPin
    const {transactionPin} = findTranPin

    if(!transactionPin) throw new appError(BAD_REQUEST, `You don't have a transaction pin` )
    

    // hashing old transaction pin
    const  hashOldPin = await Users?.hashTranPin(oldPin)

    // hashing new transaction pin
    const  hashNewPin = await Users?.hashTranPin(pin)

    if(hashOldPin != transactionPin) 
        throw new appError(BAD_REQUEST, "Please Enter your old pin correctly")
    
    // Updating User new transaction
    
        const filter = { _id};
        const updateData = {
            transactionPin : hashNewPin
        }
    
        // checking if transaction pin exit
        const updateTranPin = await Users.updateUsers(filter, updateData)


    
    responseHandler(req, res, CREATED, 'New Transaction Pin created', "Transaction pin changed")

})


// .................Change User password........................
export const changeUserPasswordMethod = tryCatch(async(req, res, next) => {
    const _id = req._id
    
    // destructuring request body
    const {oldPassword, newPassword, confirmNewPassword} = req.body 

    // checking if fields are empty
    if(!oldPassword ||!newPassword || !confirmNewPassword)
        throw new appError(BAD_REQUEST, 'Please fill in all required fields')

    // Checking User Password Length
    if(newPassword.length != 6) throw new appError(BAD_REQUEST, "pin length is six characters ")


    // checking if New User Password Length is number only
    const numberNewPassword = Number(newPassword)
    if(!numberNewPassword)throw new appError(BAD_REQUEST, 'Pin should only contain numbers')


    // checking if both password match
    if(numberNewPassword != confirmNewPassword)throw new appError(BAD_REQUEST, 'Password mismatch')

    const password = numberNewPassword.toString()

    const Users= new User

    const findUser =  await Users.findUserDetail(_id)

     // comparing password
	const comparePassword = await bcrypt.compare(oldPassword, findUser.password)

	if(!comparePassword) 
        throw new appError(BAD_REQUEST, "Please Enter your old password correctly")

     // Updating User new transaction
    
     const filter = { _id};
     const updateData = {
         password : await bcrypt.hash(password, 12)
     }

 
     // checking if transaction pin exit
     const updateTranPin = await Users.updateUsers(filter, updateData)


     responseHandler(req, res, CREATED, 'New Password created', "Transaction password changed")
})


// ................. update profile............................
export const updatedProfileMethod = tryCatch(async(req, res, next) => {
    const _id = req._id

    const pic = req.file
    const {Bio : {BVN} } = req.body 

    

    const Users= new User

    const currentUser = await Users?.findUserDetail(_id)

    const {Bio : {firstName, lastName, otherName, gender, image}} = currentUser

    
    
    


     // Updating User profile
     const filter = { _id};
     const updateData = {
        
        Bio : {
            firstName, 
        lastName,
         otherName, 
         gender,
            BVN,
             image : { imgName : _id + "--" +pic.originalname,
                img:{
                    data : pic.buffer,
                    contentType : pic.mimetype
                } }
            
        }
    
          
        
         
     }


    //  return res.send(updateData)

 
     // checking if transaction pin exit
     const updateProfile = await Users.updateUsers(filter, updateData)



    res.send({profilePic : updateProfile})

    
})


