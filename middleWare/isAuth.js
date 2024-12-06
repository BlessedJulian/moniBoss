import { BAD_REQUEST, FORBIDDEN } from "../constants/statusCode.js";
import { User } from "../model/usermodel.js";
import { appError, tryCatch } from "../utils/index.js";

    export const isAuthenticated = tryCatch(async(req, res, next) =>{

      if(!req.session._id || req.session._id === null)   throw new appError(FORBIDDEN, 'Unauthorise User, proceed to logIn')
      
           const userId =  req.session._id 
            const Users= new User

            const user = await Users?.findUserDetail(userId)
            
            
    if(!user) throw new appError(BAD_REQUEST, "User not found")
   
      next()
    })