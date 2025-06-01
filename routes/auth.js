const express = require('express');
const router = new express.Router();
const db = require('../db.js');
const { createToken } = require("../helpers/tokens.js");

const User = require("../models/user");
const LatLon = require("../models/latLon.js");

// Test route to be sure were locked in
router.get('/', (req, res, next) => {
    res.send("Auth routes are working")
})



// The route for a user to Login / Recieve their JWT Token
router.post("/register", async function (req, res, next) {
    
  try {

    // Grabs the user object data from the request body
    const user = req.body;  

    // Check if user data is present
    if (!user || Object.keys(user).length === 0) {
      return res.status(400).json({ message: "Missing user data in request body" });
    }

    // Destructure user data
    const { username, userPassword: password, userAddress: address } = user;

    // Validate required fields
    if (!username) {
      console.log("Missing username:", req.body);
      return res.status(400).json({ message: "Please enter a Username" });
    }

    if (!password) {
      console.log("Missing password:", req.body);
      return res.status(400).json({ message: "Please enter a Password" });
    }

    // Validate address
    const coordinates = await LatLon.checkAddress(address);

    if (!coordinates) {
      console.log("Invalid address:", req.body);
      return res.status(400).json({ message: "Please enter a valid Address" });
    }

    // If all the data is valid, register the user
    const newUser = await User.register(username, password, address);

    if (!newUser) {
      console.log("Username already taken:", username);
      return res.status(400).json({ message: `The username ${username} has already been taken. Sorry try again!!` });
    }

    // If registration is successful, create a token for the user
    const registeredUser = newUser;
    const token = createToken(registeredUser);

    // Log the registered user and token for debugging
    console.log("User registered:", registeredUser);
    res.status(201).json({ message: "User registered successfully", registeredUser, token });
  } catch (e) {
    return next(e);
  }
});

// The route for a user to Login / Recieve their JWT Token
router.post("/login", async function (req, res, next){

    try {

    // Gets the data from the body. 
    const {loginUser} = req.body;

    // Gets the username and password from the loginUser object
    const username = loginUser.username;
    const password = loginUser.userPassword;

      // Uses the authenticate function from the User model to check if the user exists and the password is correct
      const user = await User.authenticate(username, password);

      // If the user is undefined, it means the username or password is incorrect
      if(user === undefined){
        return res.json({message: 'The username / password is incorrect'})
      }else{
        // Token for User
        const token = createToken(user)
        res.status(200).json({message:'login successful', user, token})
        }
        
    }catch (e){
        console.log("failed")
        return next(e)
    }
})

module.exports = router