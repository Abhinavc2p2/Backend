

 const asyncHandler=(requesthandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requesthandler(req,res,next)).catch((error)=>next(error))
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