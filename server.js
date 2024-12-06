import express from "express"
import { errorHandler } from "./controller/errorHandler.js"
import { ENV, PORT,  } from "./config.js"
import { appError } from "./utils/index.js"
import { NOT_FOUND } from "./constants/statusCode.js"
import morgan from 'morgan'
import { USER } from "./route/userRoute.js"
import { dbConnect } from "./controller/dbController.js"  
import session from "express-session"
import { sessionDetail } from "./controller/sessionController.js"

const app = express()

//middle ware
if(ENV === "development"){

    app.use(morgan('dev'))  
    console.log({Mode  : ENV})  
}

if (ENV === "production") {
    app.set('trust proxy', 1) // trust first proxy
}

app.use(express.json())

// user sesion Detail
app.use(session(sessionDetail))



//  routes

// user route
app.use('/api/v2/user', USER.router)
// for route/page not found
app.all('*', (req, res) => {
    throw new appError(NOT_FOUND, 'page not found')
})



// db connection
dbConnect()

// global error handler
    app.use(errorHandler)

// app listening
    app.listen(PORT, (error) => {
        if(error) console.log({errMsg : error.message})
        console.log(`App is up and running....... on ${PORT}`)
    })