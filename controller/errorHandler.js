import { appError } from "../utils/index.js";

export const errorHandler = (error, req, res, next) => {
    const statusCode = error.statusCode || 500
    console.log(error)

    if(error instanceof appError){  
        return res.status(statusCode).send({
            error : true,
            statusCode : statusCode,
            message : error.message,
            // stack : error.stack
    
        })

    }

    return res.status(statusCode).send({
        error : true,
        statusCode : statusCode,
        message : error.message,
        stack : error.stack

    })
}