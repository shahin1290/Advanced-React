require('dotenv').config();
const { ApolloServer, gql } = require('apollo-server');
const products = require('./seed-data/data');
const cloudinary = require('cloudinary');

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
    allProducts: [Product!]!
    uploadPhoto(photo: Upload!): Photo!
  }
`;

const resolvers = {
  Query: {
    allProducts: () => products,
    allPhotos: () => {
      console.log(photos);
      return photos;
    },
  },
  Mutation: {
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
