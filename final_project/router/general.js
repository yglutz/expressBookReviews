const express = require("express");
let books = require("./booksdb.js");
const axios = require("axios");
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const newUser = new Object({
    username: req.body.username,
    password: req.body.password,
  });
  if (!newUser.username || !newUser.password) {
    res.status(400).send("Username and password are required");
    return;
  }
  const matchingUser = users.find((user) => user.username === newUser.username);
  if (!matchingUser) {
    users.push(newUser);
    res.status(200).send("User created.");
    return;
  }
  res.status(403).send("User already exists.");
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  console.log(books);
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  res.send(JSON.stringify(books[isbn], null, 4));
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const keys = Object.keys(books);

  let matchingBooks = [];
  keys.forEach((key) => {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      matchingBooks.push(books[key]);
    }
  });
  if (matchingBooks.length > 0) {
    res.send(JSON.stringify(matchingBooks, null, 4));
  } else {
    res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const keys = Object.keys(books);

  let matchingBooks = [];

  keys.forEach((key) => {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      matchingBooks.push(books[key]);
    }
  });
  if (matchingBooks.length > 0) {
    res.send(JSON.stringify(matchingBooks, null, 4));
  } else {
    res.status(404).json({ message: "No book found for this title" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  res.send(JSON.stringify(books[isbn].reviews, null, 4));
});

// async (makes no sense to self call)
public_users.get("/async/books", async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const r = await axios.get(`${baseUrl}/`);
    return res.status(200).send(r);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
});


public_users.get("/async/books/isbn/:isbn", async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const r = await axios.get(`${baseUrl}/isbn/${isbn}`);
    return res.status(200).send(r.data);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
});


public_users.get("/async/books/author/:author", async (req, res) => {
    try {
        const author = req.params.author;
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const r = await axios.get(`${baseUrl}/author/${author}`);
        return res.status(200).send(r.data);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: error.message });
    }
});


public_users.get("/async/books/title/:title", async (req, res) => {
    try {
        const title = req.params.title;
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const r = await axios.get(`${baseUrl}/title/${title}`);
        return res.status(200).send(r.data);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: error.message });
    }
});


module.exports.general = public_users;
