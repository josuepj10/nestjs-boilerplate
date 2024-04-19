import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './index';

@Entity({ name: 'products' }) //rename the entity and db table to products
export class Product {
  @PrimaryGeneratedColumn('uuid') // The id property is a primary key and it is generated automatically by the database
  id: string;

  @Column('text', { unique: true })
  title: string;

  @Column('float', { default: 0 })
  price: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column('text', { unique: true })
  slug: string;

  @Column('int', { default: 0 })
  stock: number;

  @Column('text', { array: true })
  sizes: string[];

  @Column('text')
  gender: string;

  @OneToMany( 
    () => ProductImage,
    (productImage) => productImage.product, // The productImage entity has a property called product that is related to the Product entity
    { cascade: true, eager: true } // If you delete a product, all its images will be deleted as well / eager (findOne): when you load a product, its images will be loaded as well
  )
  images?: ProductImage[];

  @BeforeInsert() // This decorator is used to execute a function before the entity is inserted in the database
  checkSlugInsert() {
    if (!this.slug) { // If the slug is not defined, it will be created based on the title
      this.slug = this.title;
    }
    this.slug = this.slug // The slug is transformed to lowercase and all spaces and single quotes are replaced by underscores
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  // The tags property is an array of strings that will store the tags of the product
  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  tags: string[];

  @BeforeUpdate() // This decorator is used to execute a function before the entity is updated in the database
  checkSlugUpdate() {  // The same logic is applied to the slug in the update method
    this.slug = this.slug // The slug is transformed to lowercase and all spaces and single quotes are replaced by underscores
    .toLowerCase()
    .replaceAll(' ', '_')
    .replaceAll("'", '');
  }



}
