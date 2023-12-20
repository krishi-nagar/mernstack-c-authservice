const { config } = require('dotenv');

// Load environment variables from .env file
config();

// Log the value of PORT
console.log("PORT", process.env.PORT);
