import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity({ name: 'product_images'}) //rename the entity and db table to product_images
export class ProductImage {

    @PrimaryGeneratedColumn() 
    id: number;

    @Column('text')
    url: string;

    @ManyToOne(
        () => Product,
        (product) => product.images, //The product is related to the images property of the Product entity
        { onDelete: 'CASCADE' } //If you delete a product, all its images will be deleted as well
    )
    product: Product
}