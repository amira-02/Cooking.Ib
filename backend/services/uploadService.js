const cloudinary = require("../config/cloudinary");

function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "cooking-ib/products", resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
}

async function uploadImages(files) {
  return Promise.all(files.map((file) => uploadBuffer(file.buffer)));
}

module.exports = { uploadImages };