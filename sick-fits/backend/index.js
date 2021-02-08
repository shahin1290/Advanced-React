require('dotenv').config();
const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose');
const Product = require('./models/product');
const ProductImage = require('./models/productImage');
const cloudinary = require('cloudinary');

const MONGODB_URI = process.env.DATABASE_URL;

console.log('connecting to', MONGODB_URI);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message);
  });

/* const image = new ProductImage({
    imageUrl: 'http://res.cloudinary.com/wesbos/image/upload/v1576791335/sick-fits-keystone/5dfbed262849d7961377c2c0.jpg',
    product: '6020301160d78b45cf38b217',
  }) */

/* Product.findOneAndUpdate(
  { name: 'shoe' },
  { photo: '6020301160d78b45cf38b217' },
  null,
  function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      console.log('image saved!');
      mongoose.connection.close();
    }
  }
); */

/* image.save().then((result) => {
  console.log('image saved!');
  mongoose.connection.close();
}); */

const uploadFile = async (file) => {
  // The Upload scalar return a a promise
  const { createReadStream } = await file;
  const fileStream = createReadStream();

  // Initiate Cloudinary with your credentials
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });

  // Return the Cloudinary object when it's all good
  return new Promise((resolve, reject) => {
    const cloudStream = cloudinary.v2.uploader.upload_stream(function (
      err,
      fileUploaded
    ) {
      // In case something hit the fan
      if (err) {
        rejet(err);
      }

      // All good :smile:
      resolve(fileUploaded);
    });

    fileStream.pipe(cloudStream);
  });
};

const typeDefs = gql`
  type Photo {
    imageUrl: String!
    id: ID!
  }

  type Product {
    name: String!
    description: String!
    photo: Photo
    id: ID!
  }

  enum Status {
    DRAFT
    AVAILABLE
    UNAVAILABLE
  }

  type Query {
    allProducts: [Product!]!
    allPhotos: [Photo]
  }

  type Mutation {
    createProduct(name: String!, description: String!): Product
    uploadPhoto(photo: Upload!): Photo!
  }
`;

const photos = [];

const resolvers = {
  Query: {
    allProducts: (root, args) => {
      return Product.find({});
    },
    allPhotos: () => {
      return photos;
    },
  },
  Mutation: {
    createProduct: (root, args) => {
      const product = new Product({ ...args });
      return product.save();
    },
    uploadPhoto: async (parent, args, context, info) => {
      const file = await uploadFile(args.photo);
      const newProductImage = new ProductImage({ imageUrl: file.secure_url });
      await newProductImage.save();

      return newProductImage;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
