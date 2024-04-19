import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { ProductsModule } from 'src/products/products.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [ProductsModule], //Import the ProductsModule to use the ProductsService for use the deleteAllProducts method or any other method
})
export class SeedModule {}
