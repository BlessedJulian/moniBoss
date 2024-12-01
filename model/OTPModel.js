import mongoose from "mongoose"
import crypto from "crypto"

// destructuring mongoose
const{Schema, model} = mongoose

const OTPSchema = new Schema({
    phoneNumber : {
        type : String,
        required : true
    },
    OTP : {
        type : String,
        required : true,
        unique : true
    },
    createdAt : {
        type :   Date,
        default: Date.now(),
     },
     expiredAt : {
         type :  Date,
     }
}, {timestamps : true})





export class OTPDataDetail {

    constructor (){
        this.otpModel = model("OTPRecord", OTPSchema)
    }

    // save UserOTP
    async addUserOTP(otpData){
        const addNewUsersOTP = this.otpModel(otpData);
        return addNewUsersOTP;
      }


      // find user phone and otp
    async updateUserOTP(filter, updateData){
        const updateOTP = await this.otpModel.findOneAndUpdate(filter, updateData, {
            new: true,
            upsert: true,
        });
        return updateOTP;
      }

       // find user only phone 
    async findPhoneNumberOTP(otpData){
        const findPhoneNumberOTP = this.otpModel.findOne(otpData)
            .select({_id : 1, phoneNumber : 1});
        return findPhoneNumberOTP;
      }

       // find user only phone and otp
    async findOTP(otpData){
        const findOTP = this.otpModel.findOne(otpData)
            .select({_id : 0, OTP : 1, expiredAt : 1});
        return findOTP;
      }

    //   ====================hashing and unhashing of OTP  ==========================================

      async createHashedOTP(data){
        // Hashing method
        const hash = crypto.createHash('sha256');
        const hashedOTP = hash.update(data).digest('hex');
    
        // Assign the hashed OTP to the schema property
        this.OTP = hashedOTP;
    
        return hashedOTP
    } 

    // Add the verifyOTP method to the schema
    async verifyOTP(inputOTP) {
        const hash = crypto.createHash('sha256');
        const hashedInput = hash.update(inputOTP).digest('hex');
        return hashedInput;
    };

}