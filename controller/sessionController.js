import MongoStore from "connect-mongo"
import { DB, SECRET, SessTime } from "../config.js"


export const  sessionDetail = {
      secret : SECRET, 
      resave: false, 
      saveUninitialized: true, 
      cookie: { 
            secure: false,
            maxAge:  360000
      },
      store : MongoStore.create({
            mongoUrl : DB
      }) 

}