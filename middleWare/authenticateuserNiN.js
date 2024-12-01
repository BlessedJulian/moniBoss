import { FORBIDDEN } from "../constants/statusCode.js"
import { appError, tryCatch } from "../utils/index.js"
import axios from "axios"


export const requireNINToken = tryCatch(async(req, res, next) =>{

    const authHeader = req.headers?.authorization

    const token = authHeader?.startsWith("Application_crest") && authHeader?.split(" ")[1]


    // to get token header
    const response = await axios.post('https://passport.immigration.gov.ng:8443/ngnPassport/v1/auth/serverToken')
    
    // if(!response)   throw new appError(FORBIDDEN, 'invalid header')
      return(res.json(response.data));
     

})