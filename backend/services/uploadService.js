const cloudinary = require("../config/cloudinary");

// Dossiers Cloudinary autorisés (?dossier=… sur la route d'upload)
const FOLDERS = {
  products: "cooking-ib/products",
  homepage: "cooking-ib/homepage",
};

function uploadBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
}

async function uploadImages(files, folderKey = "products") {
  const folder = FOLDERS[folderKey] || FOLDERS.products;
  return Promise.all(files.map((file) => uploadBuffer(file.buffer, folder)));
}

module.exports = { uploadImages };
