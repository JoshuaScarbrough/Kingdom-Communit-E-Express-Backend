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

// The route for registering a user
router.post("/register", async function (req, res, next){

    try{
    const {user} = req.body

    // Check if "user" object is provided
    if (!user) {
      return res.status(400).json({ message: "Missing user data in request body" });
    }

    

        const username = user.username
        const password = user.userPassword
        const address = user.userAddress

        if(!username){
            // Checks if there is a username
            console.log("Register request body:", req.body);
            return res.status(400).json({message: "Please enter a Username"})
        }else if(!password){
            // Checks if there is a password
            console.log("Register request body:", req.body);
            return res.status(400).json({message: "Please enter a Password"})
        }else{

            // Checks to make sure the address is valid
            const coordinates = await LatLon.checkAddress(address)

            if(coordinates){

                // Registers the user
                const newUser = await User.register(username, password, address);

                    // This makes sure that a user doesn't register with someone elses Username
                    if(!newUser){
                        console.log("Register request body:", req.body);
                        return res.status(400).json({message: `The username ${username} has already been taken. Sorry try again!!`})
                    }

                    // const extractedValues = newUser.row.replace(/[()]/g, "").split(',');
                
                    // let registeredUser = await db.query(
                    //     `SELECT id, username FROM users WHERE username = $1`,
                    //     [extractedValues[0]]
                    // )
                
                    // registeredUser = registeredUser.rows[0]

                    const registeredUser = newUser;
        
                    // Token for User
                    const token = createToken(registeredUser)
                    console.log("Register request body:", req.body);
                    res.status(201).json({message: 'User registered successfully', registeredUser, token});

            }else{
                console.log("Register request body:", req.body);
                return res.status(400).json({message: "Please enter a valid Address"})
            }

        }


    }catch (e){
        return next(e)
    }

})

// The route for a user to Login / Recieve their JWT Token
router.post("/login", async function (req, res, next){

    // Gets the data from the body
    const {loginUser} = req.body;
    const username = loginUser.username;
    const password = loginUser.userPassword;

    try{
        const user = await User.authenticate(username, password);


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