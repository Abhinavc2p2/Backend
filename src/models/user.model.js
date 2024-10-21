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
    this.password=bcrypt.hash(this.password,10)
    next()
})


/*password is compare here*/
Userschema.methods.isPasswordcorrect=async function(password){
   return await bcrypt.compare(password,this.password)      
}

Userschema.methods.genrateaccesstoken=function(){
    jwt.sign({
        _id:this._id,
        email:this.email,
        useranme:this.useranme,
        fullname:this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}


Userschema.methods.genraterefreshtoken=function(){
    jwt.sign({
        _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}




export const User=mongoose.model("User",Userschema)

