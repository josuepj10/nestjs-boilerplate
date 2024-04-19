import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage, Product } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService'); // Allow view console logs in a better way

  // This repository is used to interact the Entity with the database
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage) //Necesary to inject the ProductImage repository
    private readonly productImageRepository: Repository<ProductImage>, //Instance of the ProductImage repository

    private readonly dataSource: DataSource, //DataSource: Used to connect to the database for the query runner
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto; //Destructure the images from the createProductDto

      const product = this.productRepository.create({
        //Create a new product instance
        ...productDetails,
        images: images.map(
          (
            image, //Create a new product image instance for each image
          ) => this.productImageRepository.create({ url: image }),
        ),
      });
      await this.productRepository.save(product); //save the product to the database

      return { ...product, images }; //return the product with the images, excluding the image id
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto; //Define a limite by default of 10 and offset of 0

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true, //Include the images of the product
      },
    });

    return products.map((product) => ({
      ...product, //exclude the image id
      images: product.images.map((img) => img.url),
    }));
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      //If the term is a UUID, find the product by its id
      product = await this.productRepository.findOneBy({ id: term }); //find the product with the given id
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod'); //Query builder to search for the product by its title or slug
      product = await queryBuilder
        .where('LOWER(title) = LOWER(:term) OR LOWER(slug) = LOWER(:term)', {
          //search for the product by its title or slug and is insensitive to case
          term: term.toLowerCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages') //include the images of the product
        .getOne(); //get the product from the database
    }

    if (!product)
      throw new NotFoundException(`Product with id ${term} not found`); //if the product is not found, throw an exception

    return product;
  }

  //This method is used to return the product with the images as an array of strings
  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term); //Destructure the images from the product
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      //preload the product with the given id
      id, //id of the product compared with the id of the product in the database
      ...toUpdate,
      images: [],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`); //if the product is not found, throw an exception
    }

    //Create query runner
    const queryRunner = this.dataSource.createQueryRunner(); //Create a query runner to run the transaction (It is used to delete all the images of the product and create new ones)
    await queryRunner.connect(); //connect to the database
    await queryRunner.startTransaction(); //start the transaction

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: product.id }); //Delete all the images of the product (Delete from product_image where product_id = product.id)
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ); //Create a new product image instance for each image
      } else {
        //??
      }

      await queryRunner.manager.save(product); //save the product but no impact the database yet
      // await this.productRepository.save(product);

      await queryRunner.commitTransaction(); //commit the transaction
      await queryRunner.release(); //release the query runner

      return this.findOnePlain(id); //return the product with the images as an array of strings
    } catch (error) {
      await queryRunner.rollbackTransaction(); //rollback the transaction
      await queryRunner.release(); //release the query runner

      this.handleDBException(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id); //find the product with the given id

    await this.productRepository.remove(product); //remove the product from the database
  }

  private handleDBException(error: any) {
    if (error.code === '23505') {
      throw new InternalServerErrorException(error.detail);
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Something went wrong, check server logs for more information',
      );
    }
  }

  //This method is used to delete all the products from the database
  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('prod'); //Create a query builder to delete all the products
    try {
      return await query.delete().where({}).execute(); //delete all the products from the database
    } catch (error) {
      this.handleDBException(error);
    }
  }
}
