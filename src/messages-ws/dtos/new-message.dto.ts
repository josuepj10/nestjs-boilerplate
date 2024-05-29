import { IsString, Min, MinLength } from "class-validator";



export class NewMessageDto {
  
    @IsString()
    @MinLength(1)
    message: string;
}