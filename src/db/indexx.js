import mongoose from "mongoose"

import { DB_NAME } from "../constants.js"

const connectDB=async ()=>{
    try {
   const connectioninstance=await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
   console.log(` \n mongodb connected ${connectioninstance.connection.host}`)
    } catch (error) {
        console.log("mongodb connected",error)
        process.exit(1)
        
    }
}

export default connectDB