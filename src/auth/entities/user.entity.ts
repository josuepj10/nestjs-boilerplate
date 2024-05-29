import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/products/entities';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {

  @ApiProperty({ 
    example: '4496e028-7869-44ac-9234-268ba5c803c5',
    description: 'User id',
    uniqueItems: true,
   })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'youremail@gmail.com',
    description: 'Your email address',
    uniqueItems: true,
  })
  @ApiProperty()
  @Column('text', { unique: true })
  email: string;

  @ApiProperty({
    example: 'Abc123',
    description: 'Your password',
  })
  @Column('text', { select: false }) //Hide the password in the queries
  password: string;

  @ApiProperty()
  @Column('text')
  fullName: string;

  @ApiProperty({
    example: 'True or False',
    description: 'User status',
    default : true
  })
  @Column('bool', { default: true })
  isActive: boolean;

  @ApiProperty()
  @Column('text', { array: true, default: ['user'] })
  roles: string[];

  @OneToMany(
    () => Product, // The related entity
    (product) => product.user,
  )
  product: Product;

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  emailToLowerCaseOnUpdate() {
    this.emailToLowerCase();
  }
}
