import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from './helpers';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response, // Inject the Response object
    @Param('imageName') imageName: string,
  ) {
    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile(path); // Send the file to the client
  }

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      //limits: { fileSize: 1000 }
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  ) // Use the fileFilter helper

  // Next library will handle the file upload
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    //console.log({ fileInController: file })

    if (!file) {
      throw new BadRequestException(
        'Make sure that the file is an image with jpg, jpeg, png, or gif extension',
      );
    }
    // console.log(file)

    const secureUrl = `${ this.configService.get('HOST_API') }/files/product/${ file.filename }`; //When the file is uploaded, the controller will return the URL of the file

    return { secureUrl };
  }
}