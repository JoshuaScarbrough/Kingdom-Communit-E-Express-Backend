const db = require('../db.js');
const User = require("./user.js");
const Event = require("./events.js");
const UrgentPost = require("./urgentPosts.js");


/**
 * This is the Post model that handles all the post related functionality
 * It includes functions to get a post, set the number of comments and likes, like and unlike a post, add comments, get comments, get full posts with comments, and get all posts from a user or all users.
 */
class Post {

    // Function to get a post from the Posts table
    static async getPost(post_id){
        let selectedPost = await db.query(
            `SELECT * FROM posts WHERE id = $1`,
            [post_id]
        )
        selectedPost = selectedPost.rows[0]
        return selectedPost
    }

    // Function to set the number of comments for a post in the Posts table
    // Accepts the post_id as a parameter
    static async setNumComments(post_id){

        // Selects the post 
        const post = await Post.getPost(post_id);

        let postNumComments = post.numcomments

        // Checks to see if their are comments in the database already for the comment
        let commentCheck = await db.query(
            `SELECT * FROM comments WHERE post_id = $1`, 
            [post_id]
        )
        commentCheck = commentCheck.rows

        // If statement that checks to see if the number of comments that the post has inside of the posts table is equal to the number of comments in the comments table with the post Id
        // If there is a difference in the numbers then its time to get the two numbers to match
        if(postNumComments !== commentCheck.length){

            // For loop that loops through the comments and adds one to the postNumComments variable
            for(let i=0; i< commentCheck.length; i++){
                postNumComments ++
            }
    
            // Updates the posts table with the new number of comments
            const setNumComments = await db.query(
                `Update posts 
                SET numComments = $1
                WHERE id = $2
                RETURNING numComments`,
                [postNumComments, post_id]
    
            )
        }

        return(postNumComments) 
    }

    // Function to set the number of likes for a post in the Posts table. Similar to setting the number of comments.
    // Accepts the post_id as a parameter
    static async setNumLikes(post_id){

        // Selects the post 
        const post = await Post.getPost(post_id);

        let postNumLikes = post.numlikes

        // Checks to see if their are likes in the database already for the post
        let likesCheck = await db.query(
            `SELECT * FROM postsLiked WHERE post_id = $1`, 
            [post_id]
        )
        likesCheck = likesCheck.rows

        // If statement that checks to see if the number of likes that the post has inside of the posts table is equal to the number of likes in the postsLiked table with the post Id
        // If there is a difference in the numbers then its time to get the two numbers to match
        if(postNumLikes !== likesCheck.length){

            // For loop that loops through the likes and adds one to the postNumLikes variable
            for(let i=0; i< likesCheck.length; i++){
                postNumLikes ++
            }
    
            // Updates the posts table with the new number of likes
            const setNumLikes = await db.query(
                `Update posts 
                SET numLikes = $1
                WHERE id = $2
                RETURNING numComments`,
                [postNumLikes, post_id]
    
            )
        }

        return(postNumLikes)
    }

    // Function to like a post from the Posts table
    static async likePost(user_id, post_id){

        // Selects user
        let user = await db.query(`SELECT * FROM users WHERE id = $1`, [user_id])
        user = user.rows[0]

        // Selects the post
        const post = await Post.getPost(post_id);

        // Selects post numLikes
        let numLikes = await Post.setNumLikes(post_id)

        // Likes the post
        const like = await db.query(
            `INSERT iNTO postsLiked (user_id, post_id)
            VALUES ($1, $2) `,
            [user_id, post_id]
        )

        // If the like was successful, it updates the number of likes on the post
        if(like){

            numLikes = numLikes + 1;
 
            const updateLikes = await db.query(
                `UPDATE posts SET numlikes = $1 WHERE id = $2`,
                [numLikes, post_id]
            )
            updateLikes;

            return ({message: `${user.username}, has liked a post`, post: post})
        }


    } 

    // Function to unlike a post from the Posts table
    static async unlikePost(user_id, post_id){

        // Selects user
        let user = await db.query(`SELECT * FROM users WHERE id = $1`, [user_id])
        user = user.rows[0]

        // Selects the post
        const post = await Post.getPost(post_id);

        // Selects post numLikes
        let postLikes = post.numlikes

        // Deletes from the postLiked table which removes the like
        let unlike = await db.query(
            `DELETE FROM postsLiked WHERE user_id = $1 AND post_id = $2`,
            [user.id, post.id]
        )
        unlike;

        // If the unlike was successful, it updates the number of likes on the post
        if(unlike){
            postLikes = postLikes - 1;

            const updateLikes = await db.query(
                `UPDATE posts SET numlikes = $1 WHERE id = $2`,
                [postLikes, post.id]
            )
            updateLikes;

            return({message: "Post Unliked"})

        }

    }

        // Function to comment on a post in the Posts table
        static async addComment(user_id, post_id, comment){

            // Selects user
            let user = await db.query(`SELECT * FROM users WHERE id = $1`, [user_id])
            user = user.rows[0]
    
            // Selects the post
            const post = await Post.getPost(post_id);

            // Sets post numComments
            let numComments = await Post.setNumComments(post_id)
    
            // Creates a comment
            let insertComment = await db.query(
                `INSERT INTO comments(user_id, post_id, comment)
                VALUES($1, $2, $3)
                RETURNING comment`,
                [user.id, post.id, comment]
    
            )
            insertComment = insertComment.rows[0]
    
            // If there is a comment it updates the number of comments on the post table
            if(insertComment){
                numComments = numComments + 1;
    
                const updateNumComments = await db.query(
                    `UPDATE posts SET numcomments = $1 WHERE id = $2 RETURNING numcomments`, 
                    [numComments, post.id]
                )
    
                return({message: "Post has been commented on"})
    
            }
        }

    // Function to see all the comments for a given post in the Posts table
    static async getComments(post_id){

        // Selects the post
        const post = await Post.getPost(post_id);

        const numComments = await Post.setNumComments(post_id)

        // Views post comments
        const comments = await db.query(
            `SELECT id, user_id, comment, dateposted, timeposted  
            FROM comments 
            WHERE post_id = $1`,
            [post_id]
        )

        const allComments = comments.rows

        return ({comments: allComments})
    }

     // Function to get a specific post from the user and its comments from the Posts table
     static async getFullPost(post_id){

        const post = await Post.getPost(post_id)

        const comments = await Post.getComments(post_id)
        const allComments = comments.comments

        // Creates an object that contains the post and its comments
        if(post){
            const postsAndComments = {
                post: post,
                comments: allComments
            }

            return (postsAndComments)
        }
    }


    // Get all post and their comments from the posts table 
    static async getAllFullPosts(user_id){

        let user = await db.query(
            `SELECT * FROM users WHERE id = $1`,
            [user_id]
        )
        user = user.rows[0]

        let allPosts = await db.query(
            `SELECT id FROM posts WHERE user_id = $1`,
            [user_id]
        )
        allPosts = allPosts.rows

        // This variable will hold all of the ids from the post of a user inside of an array
        const ids = allPosts.map(post => post.id)

        // Maps over the array of ids and runs the function to ger the full post and its comments for each id.
        // This is then put inside of an array which is the variable fullPost
        const fullPost = await Promise.all(ids.map(async (id) => await Post.getFullPost(id)))

        return fullPost
    }

    // Need to be able to get all posts and comments from every user
    static async getAllFeedPosts(){

        // Loop through all the Posts and pull out their ids
        let allPostIds = await db.query(
            `SELECT id FROM posts`
        )
        allPostIds = allPostIds.rows

        // Loop through all the Posts and pull out their ids
        let allEventIds = await db.query(
            `SELECT id FROM events`
        )
        allEventIds = allEventIds.rows

        // Loop through all the Posts and pull out their ids
        let allUrgentPostIds = await db.query(
            `SELECT id FROM urgentPosts`
        )
        allUrgentPostIds = allUrgentPostIds.rows

        // Array of all ids for their respetive post type
        const post_ids = allPostIds.map(post => post.id)
        const event_ids = allEventIds.map(event => event.id)
        const urgentPost_ids = allUrgentPostIds.map(urgentPost => urgentPost.id)

        // Getting back the entire Post of all the respective post types 
        const fullPost = await Promise.all(post_ids.map(async (id) => await Post.getFullPost(id)))
        const fullEvent = await Promise.all(event_ids.map(async (id) => await Event.getFullEvent(id)))
        const fullUrgentPost = await Promise.all(urgentPost_ids.map(async (id) => await UrgentPost.getAllFullUrgentPosts(id)))

        
        const feed = {
            fullPost: fullPost,
            fullEvent: fullEvent,
            fullUrgentPost: fullUrgentPost
        }

        return feed
    }

    static async getAllFollowingFeedPosts(user_id){

        // Gets user from the database 
        let user = await db.query(
            `SELECT * FROM users WHERE id = $1`,
            [user_id]
        )
        user = user.rows[0]

        // Query string to select all the users a user is following
        const results = await db.query(
            `SELECT users.id 
            FROM users 
            JOIN followers ON users.id = followers.following_id
            WHERE followers.follower_id = $1`,
            [user.id]
        )

        const following = results.rows

        const user_ids = following.map(user => user.id)

        const fullPost = await Promise.all(user_ids.map(async (id) => await Post.getAllFullPosts(id)))
        const fullEvent = await Promise.all(user_ids.map(async (id) => await Event.getAllFullEvents(id)))
        const fullUrgentPost = await Promise.all(user_ids.map(async (id) => await UrgentPost.getAllFullUrgentPosts(id)))

        const followingPosts = {
            following_posts: fullPost,
            following_events: fullEvent,
            following_urgent_posts: fullUrgentPost
        }
        return followingPosts


    }

}

module.exports = Post