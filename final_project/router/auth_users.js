const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const secretKey = "fakeSecret";
const verifyUser = (req, res, next) => {
  const sessionStore = req.session.authorization;

  if (sessionStore) {
    jwt.verify(sessionStore.accessToken, secretKey, (err, data) => {
      if (!err) {
        req.user = data.sub;
        console.log(req.user);
        next();
      } else {
        return res.status(403).send("User not authenticated.");
      }
    });
  }
  next();
};

const authenticatedUser = (username, password) => {
  //returns boolean
  const matchedUser = users.find(
    (u) => u.username === username && u.password === password,
  );
  return !!matchedUser;
};

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user,
    },
    secretKey,
    { expiresIn: "1d" },
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const user = new Object({
    username: req.body.username,
    password: req.body.password,
  });
  if (!user.username || !user.password) {
    res.status(400).send("Username and password are required");
    return;
  }
  if (authenticatedUser(user.username, user.password)) {
    const accessToken = generateAccessToken(user.username);
    req.session.authorization = {
      accessToken,
    };
    res.status(200).send("User logged in.");
  } else {
    res.status(404).send("Credentials incorrect or user does not exist.");
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const user = req.user;
  const review = req.body.review;
  const book = books[isbn];
  if (!review) {
    res.status(400).send("Review is required");
  }
  if (!book) {
    res.status(404).send("Book not found");
  } else {
    book.reviews = book.reviews || {};
    book.reviews[user] = review;

    res.status(200).json({
      message: "Review saved.",
      reviews: book.reviews,
    });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const user = req.user;
  const book = books[isbn];
  if (!book) {
    res.status(400).send("ISBN not found");
  } else {
    book.reviews = book.reviews || {};
    if (book.reviews[user]) {
      delete book.reviews[user];
      res.status(200).json({
        message: "Review deleted successfully.",
      });
    } else {
      res.status(404).send("Review not found");
    }
  }
});

module.exports.authenticated = regd_users;
module.exports.users = users;
module.exports.verifyUser = verifyUser;
module.exports.secretKey = secretKey;
