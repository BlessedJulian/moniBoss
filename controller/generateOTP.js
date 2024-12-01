import crypto from 'crypto'


// To generate OTP
export const generateOTP =  (length) => {
    const otp = crypto.randomInt(100000, 999999).toString().slice(0, length);
    return otp;
  }