import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './index';
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'products' }) //rename the entity and db table to products
export class Product {
  
  @ApiProperty({ 
    example: 'a3c3023d-df50-4acc-8f26-52f8e0ced341',
    description: 'Product id',
    uniqueItems: true,
   }) // This decorator is used to document the property in the Swagger UI
  @PrimaryGeneratedColumn('uuid') // The id property is a primary key and it is generated automatically by the database
  id: string;

  @ApiProperty({
    example: 'T-shirt Teslo',
    description: 'Product title',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  title: string;

  @ApiProperty({
    example: 0,
    description: 'Product price'
  })
  @Column('float', { default: 0 })
  price: number;

  @ApiProperty({
    example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    description: 'Product description',
    default : null
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ApiProperty({
    example: 't-shirt_teslo',
    description: 'Product SLUG for SEO purposes',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  slug: string;

  @ApiProperty({
    example: 10,
    description: 'Product stock',
    default: 0
  })
  @Column('int', { default: 0 })
  stock: number;

  @ApiProperty({
    example: ['S', 'M', 'L'],
    description: 'Product sizes'
  })
  @Column('text', { array: true })
  sizes: string[];

  @ApiProperty({
    example: 'woman'
  })
  @Column('text')
  gender: string;

  @ApiProperty()
  @OneToMany(
    () => ProductImage,
    (productImage) => productImage.product, // The productImage entity has a property called product that is related to the Product entity
    { cascade: true, eager: true }, // If you delete a product, all its images will be deleted as well / eager (findOne): when you load a product, its images will be loaded as well
  )
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user: User;

  @BeforeInsert() // This decorator is used to execute a function before the entity is inserted in the database
  checkSlugInsert() {
    if (!this.slug) {
      // If the slug is not defined, it will be created based on the title
      this.slug = this.title;
    }
    this.slug = this.slug // The slug is transformed to lowercase and all spaces and single quotes are replaced by underscores
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  // The tags property is an array of strings that will store the tags of the product
  @ApiProperty()
  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  tags: string[];

  @BeforeUpdate() // This decorator is used to execute a function before the entity is updated in the database
  checkSlugUpdate() {
    // The same logic is applied to the slug in the update method
    this.slug = this.slug // The slug is transformed to lowercase and all spaces and single quotes are replaced by underscores
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
