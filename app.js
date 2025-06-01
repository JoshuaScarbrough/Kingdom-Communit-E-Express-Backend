const express = require('express'); // Express framework for Node.js
const app = express();
const cors = require("cors"); // CORS middleware for handling cross-origin requests. What allows the frontend to interact with an API hosted on a different domain.

// Cors configuration
app.set('trust proxy', 1);
const corsOptions = {
  origin: 'https://kingdom-communit-e-frontend.onrender.com' // Your deployed frontend
  // methods: ['GET', 'POST', 'PATCH', 'DELETE']
  // credentials: true, // Needed to support cookies/authorization headers
  // allowedHeaders: ['Content-Type', 'Authorization'],
  // exposedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Parse requests bodies for JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importing routes
const userRoutes = require('./routes/users');
const userAuth = require('./routes/auth');
const posts = require('./routes/posts');
const urgentPosts = require('./routes/urgentPosts');
const events = require('./routes/events');
const followerFollowing = require('./routes/follower_following');
const likedPosts = require('./routes/likedPosts');
const likedEvents = require('./routes/likedEvents');
const userFeed = require('./routes/usersFeed');
const messaging = require('./routes/message');

// The paths that are going to be used to access the routes
app.use('/users', userRoutes);
app.use('/auth', userAuth);
app.use('/posts', posts);
app.use('/urgentPosts', urgentPosts);
app.use('/events', events);
app.use('/follow', followerFollowing);
app.use('/likedPosts', likedPosts);
app.use('/likedEvents', likedEvents);
app.use('/feed', userFeed);
app.use('/messaging', messaging);

// get request using the get verb. Making sure the server is running
app.get('/', (req, res) => {
    console.log('Joshua Scarbrough')
    return res.send('Kingdom Communit-E Homepage!!')
})

// If the environment is not test, start the server
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, function () {
    console.log(`Server running on port ${PORT}`);
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging

  const status = err.status || 500;
  const message = err.message || 'Something went wrong';

  res.status(status).json({
    error: {
      message,
      status
    }
  });
});

module.exports = app;