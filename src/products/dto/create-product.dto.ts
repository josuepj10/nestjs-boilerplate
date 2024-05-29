import { ApiProperty } from '@nestjs/swagger';
import {
  Min,
  MinLength,
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  IsInt,
  IsArray,
  IsIn,
} from 'class-validator';

export class CreateProductDto {
  
  @ApiProperty({ 
    description: 'Product title unique',
    nullable: false,
    minLength: 1
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number; // ? means optional

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @ApiProperty()
  @IsString({ each: true }) // each: true means that each element of the array should be a string
  @IsArray()
  sizes: string[];

  @ApiProperty()
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @ApiProperty()
  @IsString({ each: true }) 
  @IsArray()
  @IsOptional()
  tags: string[]; 

  @ApiProperty()
  @IsString({ each: true }) 
  @IsArray()
  @IsOptional()
  images?: string[]; 

}
