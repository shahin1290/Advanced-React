require('dotenv').config();
const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose');
const Product = require('./models/product');
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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const photos = [];

const typeDefs = gql`
  type Product {
    name: String!
    description: String!
  }
  type Photo {
    filename: String!
    path: String!
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
    addProduct(name: String!, description: String!): Product
    uploadPhoto(photo: Upload!): Photo!
  }
`;

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
    addProduct: (root, args) => {
      const product = new Product({ ...args });
      return product.save();
    },
    async uploadPhoto(parent, { photo }) {
      const { filename, createReadStream } = await photo;

      try {
        const result = await new Promise((resolve, reject) => {
          createReadStream().pipe(
            cloudinary.uploader.upload_stream((error, result) => {
              if (error) {
                reject(error);
              }

              resolve(result);
            })
          );
        });

        const newPhoto = { filename, path: result.secure_url };

        photos.push(newPhoto);

        return newPhoto;
      } catch (err) {
        console.log(err);
      }
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
