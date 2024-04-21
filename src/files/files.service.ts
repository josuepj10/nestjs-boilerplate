import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
    
  getStaticProductImage(imageName: string) {
    const path = join(__dirname, '../../static/products', imageName); //Location of the image in the server

    if (!existsSync(path)) { //Check if the image exists
      throw new BadRequestException(
        `Product not found with image ${imageName}`,  //If the image does not exist, throw an error
      );
    }
    return path; //Return the path of the image
  }
}
