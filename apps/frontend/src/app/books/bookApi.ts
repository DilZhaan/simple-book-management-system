
const GRAPHQL_URL = process.env.GRAPHQL_URL || 'http://localhost:3000/graphql';

export interface Book {
  id: string;
  title: string;
  author: string;
  publishedYear: number;
  genre: string;
  createdBy: {
    id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BookInput {
  title: string;
  author: string;
  publishedYear: number;
  genre: string;
}

export interface BookUpdateInput {
  title?: string;
  author?: string;
  publishedYear?: number;
  genre?: string;
}

export interface BookFilterInput {
  title?: string;
  author?: string;
  genre?: string;
  publishedYear?: number;
}




async function graphqlRequest(query: string, variables?: any) {
  const token = localStorage.getItem('authToken');
  console.log(token);
  
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify({
      query,
      variables
    })
  });

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  
  return result.data;
}




export async function getBooks(filter?: BookFilterInput, limit = 10, offset = 0): Promise<Book[]> {
  const query = `
    query GetBooks($filter: BookFilterInput, $limit: Int, $offset: Int) {
      books(filter: $filter, limit: $limit, offset: $offset) {
        id
        title
        author
        publishedYear
        genre
        createdBy {
          id
          username
        }
        createdAt
        updatedAt
      }
    }
  `;
  
  const data = await graphqlRequest(query, { filter, limit, offset });
  return data.books;
}



export async function getBook(id: string): Promise<Book | null> {
  const query = `
    query GetBook($id: ID!) {
      book(id: $id) {
        id
        title
        author
        publishedYear
        genre
        createdBy {
          id
          username
        }
        createdAt
        updatedAt
      }
    }
  `;
  
  const data = await graphqlRequest(query, { id });
  return data.book;
}




export async function searchBooks(query: string, limit = 10, offset = 0): Promise<Book[]> {
  const searchQuery = `
    query SearchBooks($query: String!, $limit: Int, $offset: Int) {
      searchBooks(query: $query, limit: $limit, offset: $offset) {
        id
        title
        author
        publishedYear
        genre
        createdBy {
          id
          username
        }
        createdAt
        updatedAt
      }
    }
  `;
  
  const data = await graphqlRequest(searchQuery, { query, limit, offset });
  return data.searchBooks;
}




export async function createBook(input: BookInput): Promise<Book> {
  const mutation = `
    mutation CreateBook($input: BookInput!) {
      createBook(input: $input) {
        id
        title
        author
        publishedYear
        genre
        createdBy {
          id
          username
        }
        createdAt
        updatedAt
      }
    }
  `;
  
  const data = await graphqlRequest(mutation, { input });
  return data.createBook;
}




export async function updateBook(id: string, input: BookUpdateInput): Promise<Book> {
  const mutation = `
    mutation UpdateBook($id: ID!, $input: BookUpdateInput!) {
      updateBook(id: $id, input: $input) {
        id
        title
        author
        publishedYear
        genre
        createdBy {
          id
          username
        }
        createdAt
        updatedAt
      }
    }
  `;
  
  const data = await graphqlRequest(mutation, { id, input });
  return data.updateBook;
}




export async function deleteBook(id: string): Promise<string> {
  const mutation = `
    mutation DeleteBook($id: ID!) {
      deleteBook(id: $id)
    }
  `;
  
  const data = await graphqlRequest(mutation, { id });
  return data.deleteBook;
}




export async function getBooksByGenre(genre: string, limit = 10, offset = 0): Promise<Book[]> {
  const query = `
    query GetBooksByGenre($genre: String!, $limit: Int, $offset: Int) {
      booksByGenre(genre: $genre, limit: $limit, offset: $offset) {
        id
        title
        author
        publishedYear
        genre
        createdBy {
          id
          username
        }
        createdAt
        updatedAt
      }
    }
  `;
  
  const data = await graphqlRequest(query, { genre, limit, offset });
  return data.booksByGenre;
}




export async function getBooksByAuthor(author: string, limit = 10, offset = 0): Promise<Book[]> {
  const query = `
    query GetBooksByAuthor($author: String!, $limit: Int, $offset: Int) {
      booksByAuthor(author: $author, limit: $limit, offset: $offset) {
        id
        title
        author
        publishedYear
        genre
        createdBy {
          id
          username
        }
        createdAt
        updatedAt
      }
    }
  `;
  
  const data = await graphqlRequest(query, { author, limit, offset });
  return data.booksByAuthor;
}
