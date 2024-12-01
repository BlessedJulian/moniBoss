import { BAD_REQUEST, FORBIDDEN } from "../constants/statusCode.js";
import { User } from "../model/usermodel.js";
import { appError, tryCatch } from "../utils/index.js";

// function isAuthenticated(req, res, next) {
//       if (req.session.userId) {
//         return next(); // User is authenticated, proceed to the next middleware/route handler
//       } else {
//         res.status(401).send('You need to log in first');
//       }
//     }
    

    export const isAuthenticated = tryCatch(async(req, res, next) =>{

      if(!req.session._id || req.session._id === null)   throw new appError(FORBIDDEN, 'invalid header')
      
           const userId =  req.session._id 
            const Users= new User

            const user = await Users?.findUserDetail(userId)
            
            
    if(!user) throw new appError(BAD_REQUEST, "Session expired")
   
      next()
    })