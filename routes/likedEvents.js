const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");
const Event = require('../models/events');
const { getFullPost } = require('../models/posts');

router.get('/', async function (req, res, next){
    res.send("The liked Events route is working")
})

router.post('/:id', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

            let user = await db.query(
                `SELECT * FROM users WHERE id = $1`,
                [data.id]
            )
            user = user.rows[0]
            if(!user){
                return res.status(404).send({message: "User not found"})
            }

            let likedEventIds = await db.query(
                `SELECT id from events 
                JOIN eventsLiked ON events.id = eventsLiked.event_id
                WHERE eventsLiked.user_id = $1`,
                [user.id]
            )
            likedEventIds = likedEventIds.rows

            const ids = likedEventIds.map(post => post.id)
            const fullPost = await Promise.all(ids.map(async (id) => await Event.getFullEvent(id)))

            res.status(200).send({message: "All liked Events", posts: fullPost  })
        }

    }catch(e){
        next(e)
    }

})

module.exports = router