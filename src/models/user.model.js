import mongoose, { Schema } from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const Userschema= new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
        },
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avtar:{
                type:String,
                required:true,
        },
        coverimage:{
            type:String,
        },
        watchhistory:[
            {
            type:Schema.Types.ObjectId,
            ref:"Videos"
            } 
    ],
    password:{
        type:String,
        required:[true,"password is required"]
    },
    refreshToken:{
        type:String
    }
    },{timestamps:true}
)


/* pass word is hashed here*/
Userschema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,10)
    next()
})


/*password is compare here*/
Userschema.methods.isPasswordcorrect=async function(password){
   return await bcrypt.compare(password,this.password)      
}
Userschema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1h' // Default expiry if not defined
        }
    );
}

Userschema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' // Default expiry if not defined
        }
    );
}




console.log("Access token expiry:", process.env.ACCESS_TOKEN_EXPIRY); // Should log '1d'
console.log("Refresh token expiry:", process.env.REFRESH_TOEKN_EXPIRY); // Should log '10d'


export const User=mongoose.model("User",Userschema)

