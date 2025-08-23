export const bookTypeDefs = `#graphql
  type Book {
    id: ID!
    title: String!
    author: String!
    publishedYear: Int!
    genre: String!
    createdBy: User!
    createdAt: String!
    updatedAt: String!
  }

  input BookInput {
    title: String!
    author: String!
    publishedYear: Int!
    genre: String!
  }

  input BookUpdateInput {
    title: String
    author: String
    publishedYear: Int
    genre: String
  }

  input BookFilterInput {
    title: String
    author: String
    genre: String
    publishedYear: Int
  }

  extend type Query {
    books(filter: BookFilterInput, limit: Int, offset: Int): [Book!]!
    book(id: ID!): Book
    searchBooks(query: String!, limit: Int, offset: Int): [Book!]!
    booksByGenre(genre: String!, limit: Int, offset: Int): [Book!]!
    booksByAuthor(author: String!, limit: Int, offset: Int): [Book!]!
  }

  extend type Mutation {
    createBook(input: BookInput!): Book!
    updateBook(id: ID!, input: BookUpdateInput!): Book!
    deleteBook(id: ID!): String!
  }
`;
