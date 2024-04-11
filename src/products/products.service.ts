import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService'); // Allow view console logs in a better way

  // This repository is used to interact the Entity with the database
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto); //create a new product instance (do not save it to the database yet)
      await this.productRepository.save(product); //save the product to the database

      return product;
    } catch (error) {
      this.handleDBException(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto; //Define a limite by default of 10 and offset of 0

    return this.productRepository.find({
      take: limit,
      skip: offset,
      //TODO RELATIONSHIPS
    });
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      //If the term is a UUID, find the product by its id
      product = await this.productRepository.findOneBy({ id: term }); //find the product with the given id
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder(); //Query builder to search for the product by its title or slug
      product = await queryBuilder
        .where('LOWER(title) = LOWER(:term) OR LOWER(slug) = LOWER(:term)', {
          //search for the product by its title or slug and is insensitive to case
          term: term.toLowerCase(),
        })
        .getOne(); //get the product from the database
    }

    if (!product)
      throw new NotFoundException(`Product with id ${term} not found`); //if the product is not found, throw an exception

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      //preload the product with the given id
      id: id, //id of the product compared with the id of the product in the database
      ...updateProductDto,
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`); //if the product is not found, throw an exception
    }

    try {
      await this.productRepository.save(product);
      return product; //save the product to the database
    } catch (error) {
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
}
