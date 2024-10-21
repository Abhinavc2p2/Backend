class Apiresponse{
    constructor(staatuscode,data,message="sucess"){
        this.staatuscode=staatuscode;
        this.data=data
        this.message=message;
        this.success=staatuscode<400
    }
}

export {Apiresponse}