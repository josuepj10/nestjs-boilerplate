import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]), //Creates or updates the database table based on the entities
    AuthModule, //Import the AuthModule to use the Auth decorator
  ],
  exports: [ProductsService, TypeOrmModule], //Export the ProductsService to be used in other modules (Used in the SeedModule)
})
export class ProductsModule {}
