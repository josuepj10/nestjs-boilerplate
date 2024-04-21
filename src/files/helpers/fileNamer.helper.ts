import { v4 as uuid } from 'uuid';

export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  //console.log({file})
  if (!file) {
    return callback(new Error('File is empity'), false); // If file is empty, return an error after the callback
  }

  const fileExtension = file.mimetype.split('/')[1]; // Get the file extension
  const fileName = `${uuid()}.${fileExtension}`; //  Generate a unique file name from the UUID and the file extension

  callback(null, fileName); // Return the file name after the callback
};
