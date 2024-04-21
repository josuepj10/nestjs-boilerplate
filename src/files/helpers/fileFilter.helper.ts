export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  //console.log({file})
  if (!file) {
    return callback(new Error('File is empity'), false); // If file is empty, return an error after the callback
  }

  const fileExtension = file.mimetype.split('/')[1]; // Get the file extension

  const validExtensions = ['jpg', 'jpeg', 'png', 'gif']; // Define the valid extensions

  if (validExtensions.includes(fileExtension)) return callback(null, true); // If the file extension is valid, return true after the callback

  callback(null, false);
  
};
