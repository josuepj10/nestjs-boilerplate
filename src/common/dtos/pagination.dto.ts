import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {


  @ApiProperty({
    default: 10,
    description: 'How many items to return at one time',
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    default: 0,
    description: 'How many items to skip',
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number; //Offset is the number of elements that have been skipped
}
