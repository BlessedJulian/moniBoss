import mongoose from "mongoose";
 
import {DB} from "../config.js"

export const dbConnect = async(req, res) => {
    // destructuring mongoose
    const {connect , set} = mongoose
    const dbFilter = set('setDefaultsOnInsert',false)
    const dbCon = await connect(DB, console.log("db connected......")).catch((error) => {
        console.log({dbError : error.message})
    } )
}