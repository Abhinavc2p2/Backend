

 const asyncHandler=(requesthndler)=>{
    (req,res,next)=>{
        Promise.resolve(requesthndler(res,res,next)).catch((error)=>next(err))
    }
 }
export {asyncHandler}


// const asyncHandler=(fn)=> async (req,res,next)=>{
//     try {
        
//     } catch (error) {
//         res.status(error.code || 500).json({
//             sucess:false,
//             message:error.message
//         })
        
//     }
// }