import jwt from 'jsonwebtoken'
import {SECRETKEY } from "../config.js";
import { tryCatch, appError } from "../utils/index.js"
import { BAD_REQUEST, FORBIDDEN } from '../constants/statusCode.js';
import { User } from '../model/usermodel.js';



export const requireToken = tryCatch(async(req, res, next) =>{

    const authHeader = req.headers?.authorization

    const token = authHeader?.startsWith("accessToken") && authHeader?.split(" ")[1]

    if(!token || token === null)   throw new appError(FORBIDDEN, 'invalid header')

    // verify token
     await jwt.verify(token, SECRETKEY, async(error, payload) =>{
        if (error)  throw new appError (BAD_REQUEST, error.message)

        req._id = payload._id

        const Users= new User

    const user = await Users?.findUserDetail(payload._id)

    if(!user) throw new appError(BAD_REQUEST, "Session expired")
   
    next()

    })  

}) 
