import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
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
