import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private productsService: ProductsService) {} //Inject the ProductsService to use the deleteAllProducts method or any other method

  async runSeed() {
    await this.insertNewProducts();
    return 'Seed executed';
  }

  private async insertNewProducts() {
    await this.productsService.deleteAllProducts();
    const products = initialData.products;
    const isertPromises = [];

    products.forEach((product) => {   //Iterate over the products array and create a new product for each one
      isertPromises.push(this.productsService.create(product)); //Push the promise returned by the create method to the isertPromises array
    });

    await Promise.all(isertPromises); //Wait for all the promises to be resolved
    return true;
  }
}
