import { useState, useEffect } from "react";
import bookService from "../services/book.service";

const useBooks = (query = "") => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    bookService
      .getBooks(query)
      .then((data) => setBooks(data))
      .finally(() => setLoading(false));
  }, [query]);

  return { books, loading };
};

export default useBooks;
