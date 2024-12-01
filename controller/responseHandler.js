export const responseHandler =  (req, res, statusCode,  responseMessage, responseBody) => {
    return res.status(statusCode).json({
        error : false,
        status : 'success',
        responseMessage,
        responseBody
    })
}