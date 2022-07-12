const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLNonNull } = require('graphql');

const app = express();
const port = 5000;

const authors = [
   { id: 1, name: 'J. K. Rowling' },
   { id: 2, name: 'J. R. R. Tolkien' },
   { id: 3, name: 'Brent Weeks' },
];

const books = [
   { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorID: 1 },
   { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorID: 1 },
   { id: 3, name: 'Harry Potter and the Goblet of Fire', authorID: 1 },
   { id: 4, name: 'The Fellowship of the Ring', authorID: 2 },
   { id: 5, name: 'The Two Towers', authorID: 2 },
   { id: 6, name: 'The Return of the King', authorID: 2 },
   { id: 7, name: 'The Way of Shadows', authorID: 3 },
   { id: 8, name: 'Beyond the Shadows', authorID: 3 },
];

const BookType = new GraphQLObjectType({
   name: 'Book',
   description: 'This represents a book written by an author',
   fields: () => ({
      id: { type: new GraphQLNonNull(GraphQLInt) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      authorID: { type: new GraphQLNonNull(GraphQLInt) },
      author: {
         type: AuthorType,
         resolve: (book) => {
            return authors.find((author) => author.id === book.authorId);
         },
      },
   }),
});

const AuthorType = new GraphQLObjectType({
   name: 'Author',
   description: 'This represents a author of a book',
   fields: () => ({
      id: { type: new GraphQLNonNull(GraphQLInt) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      books: {
         type: new GraphQLList(BookType),
         resolve: (author) => {
            return books.filter((book) => book.authorID === author.id);
         },
      },
   }),
});

const RootQueryType = new GraphQLObjectType({
   name: 'Query',
   description: 'Root Query',
   fields: () => ({
      book: {
         type: BookType,
         description: 'A Single Book',
         args: {
            id: { type: GraphQLInt },
         },
         resolve: (parent, args) => books.find((book) => book.id === args.id),
      },
      books: {
         type: new GraphQLList(BookType),
         description: 'List of Books',
         resolve: () => books,
      },
      authors: {
         type: new GraphQLList(AuthorType),
         description: 'List of Authors',
         resolve: () => authors,
      },
      author: {
         type: AuthorType,
         description: 'A Single Author',
         args: {
            id: { type: GraphQLInt },
         },
         resolve: (parent, args) => authors.find((author) => author.id === args.id),
      },
   }),
});

const RootMutationType = new GraphQLObjectType({
   name: 'Mutation',
   description: 'Root Mutation',
   fields: () => ({
      addBook: {
         type: BookType,
         description: 'Add a book',
         args: {
            name: { type: new GraphQLNonNull(GraphQLString) },
            authorID: { type: new GraphQLNonNull(GraphQLInt) },
         },
         resolve: (parent, args) => {
            const book = { id: books.length + 1, name: args.name, authorID: args.authorID };
            books.push(book);
            return book;
         },
      },
      addAuthor: {
         type: AuthorType,
         description: 'Add an author',
         args: {
            name: { type: new GraphQLNonNull(GraphQLString) },
         },
         resolve: (parent, args) => {
            const author = { id: authors.length + 1, name: args.name };
            authors.push(author);
            return author;
         },
      },
   }),
});

const schema = new GraphQLSchema({
   query: RootQueryType,
   mutation: RootMutationType,
});

// Root URL
app.use(
   '/graphql',
   expressGraphQL({
      schema: schema,
      graphiql: true,
   })
);

app.listen(port, () => {
   console.log(`Server is running on port ${port}`);
});
