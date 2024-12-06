import mongoose from "mongoose";
import bcrypt from 'bcryptjs'
import { SECRET, SECRETKEY, TIME } from "../config.js";
import jwt from 'jsonwebtoken'
import crypto from "crypto"
import { type } from "os";

// destructuring mongoose
const{Schema, model} = mongoose

const userSchema = new Schema({
    Bio : {
        firstName : {
            type : String,
            required : true,
            trim : true
        },
        lastName : {
            type : String,
            required : true,
            trim : true
        },
        otherName : {
            type : String,
        },
        image : { 
            imgName: String,
            img: {
            data: Buffer,
            contentType: String
            }
        },
        gender : {
            type : String,
            required : true,
            trim : true
        },
        NIN : {
            type : Number,
            trim : true
        },
        BVN : {
            type : Number,
            trim : true
        }   
    },
    contactDetail : {
        phoneNumber : {
            type : String,
            unique : true,
            required : true
        },
        email : {
            type : String,
            trim : true,
            unique : true,
            required : true
        },
        address : {
            type : String,
            trim : true,
            required : true
        },
    },
    transactionPin:{
        type : String,
        trim : true
    },
    password : {
        type : String,
        trim : true,
        required : true,
        // select : false
    },
    expiredAt : {
        type : Date
    },
    passwordResetToken : {  
        token : {
                type : String,
                trim : true
        },
        expiredAt : {
                type : Date
        }
    },
    tranPinResetToken : {  
        token : {
                type : String,
                trim : true
        },
        expiredAt : {
                type : Date
        }
    }

},  {timestamps : true})


// {{{{{{{{{{{{{{{{{{{{{{Mongodb middleware}}}}}}}}}}}}}}}}}}}}}}
userSchema.pre("save", async function(next){
    this.password = await bcrypt.hash(this.password, 12)
    next()
})



export class User {

    constructor (){
        this.userModel = model("User", userSchema)
    }

     // checking if users exist in database 
     async findUser(userData){
        const checkUser =  this.userModel.findOne(userData).select('+password')
        return checkUser
    }

    // add new users to databas
    async addUser(userData){
        const addNewUsers = this.userModel(userData);
        return addNewUsers;
      }

    // find only userphoneNumber in database
    async findPhoneNumber(userData){
        const checkUser =  this.userModel.findOne(userData)
         .select({ _id : 0, 'contactDetail.phoneNumber' : 1})
        return checkUser
    }

     // find and update user
     async updateUsers(filter, updateData){
        const updateUser = await this.userModel.findByIdAndUpdate(filter, updateData, {
            new: true,
            upsert: true,
        });
        return updateUser;
      }

    //   ...................JWT............................................
      async userAuthentication(data){
        const token =  await jwt.sign(data, SECRETKEY, {expiresIn : TIME})
        return token
     }


     async findUserDetail(userData){
        const checkUsers =  this.userModel.findById(userData).select({
            restToken : 0,
            createdAt: 0,
            updatedAt: 0,
            __v : 0
        })
        return checkUsers

     }

     //   ====================hashing and unhashing of OTP  =========================================

     async createHashedOTP(data){
        // Hashing method
        const hash = crypto.createHash('sha256')
        const hashedOTP = hash.update(data).digest('hex')
    
        // Assign the hashed OTP to the schema property
        this.restToken = hashedOTP;
    
        return hashedOTP
    } 

    // Add the verifytoken method to the schema
    async verifyToken(inputOTP) {
        const hash = crypto.createHash('sha256')
        const hashedInput = hash.update(inputOTP).digest('hex')
        return hashedInput;
    }

    //  ====================hashing and unhashing of trasaction Pin===============================
    async hashTranPin(pin){
        const updateHash = crypto.createHmac('sha256', SECRET)
        .update(pin)
        .digest('hex');
        return updateHash
    }



    // find and update user
    async updateUsers(filter, updateData){
        const updateUser = await this.userModel.findOneAndUpdate(filter, updateData, {
            new: true,
            upsert: true,
        });
        return updateUser;
      }


      // find and update user
    // async updates(filter, updateData){
    //     const updateUser = await this.userModel.findByIdAndUpdate(filter, updateData, {
    //         new: true,
    //         upsert: true,
    //     });
    //     return updateUser;
    //   }
 
}



