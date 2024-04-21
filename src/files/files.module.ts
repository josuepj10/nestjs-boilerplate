import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [FilesController],
  providers: [FilesService], 
  imports: [ConfigModule] //ConfigModule provides ConfigService, allow the access to the environment variables and is required in the FilesController
})
export class FilesModule {}
