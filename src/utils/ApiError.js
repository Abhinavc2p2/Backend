class ApiError extends Error{
    constructor (
        statuscode,
        message="something wwent wrong",
        error=[],
        stack=""
    ){
        super(message)
        this.statuscode=statuscode
        this.data=null
        this.message=message
        this.success=false;
        this.errors=error
        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}