import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

//This decorator will be used to get the autenticated user data from the hhtp request object

export const GetUser = createParamDecorator(

    //
    ( data: string, ctx: ExecutionContext ) => { 
        
        const request = ctx.switchToHttp().getRequest();  //Allow get to the data from the http request (the user authenticated)
        const user = request.user; //Get the user data from the request object

        if( !user ) throw new InternalServerErrorException('User not found');

        return ( !data ) ? user : user[data];
    }

)