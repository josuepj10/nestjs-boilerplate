import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(private productsService: ProductsService,
    @InjectRepository( User )
    private userRepository: Repository<User>,
  ) {} //Inject the ProductsService to use the deleteAllProducts method or any other method

  async runSeed() {
    await this.deleteTables(); //Delete all the products from the database after inserting them
    const adminUser = await this.insertUsers();
    await this.insertNewProducts( adminUser );
    return 'Seed executed';
  }

  private async deleteTables() {

    await this.productsService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute(); //Delete all the products from the database
  }

  private async insertUsers() {

    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach( user => {
      users.push(this.userRepository.create(user));
    });

    const dbUsers = await this.userRepository.save(seedUsers);  
    return dbUsers[0];
  }


  private async insertNewProducts( user: User ) {
    await this.productsService.deleteAllProducts();
    const products = initialData.products;
    const isertPromises = [];

    products.forEach((product) => {   //Iterate over the products array and create a new product for each one
      isertPromises.push(this.productsService.create(product, user)); //Push the promise returned by the create method to the isertPromises array
    });

    await Promise.all(isertPromises); //Wait for all the promises to be resolved
    return true;
  }
}
