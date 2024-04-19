import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]), //Creates or updates the database table based on the entities
  ],
  exports: [ProductsService, TypeOrmModule], //Export the ProductsService to be used in other modules (Used in the SeedModule)
})
export class ProductsModule {}
