
// import dotenv from "dotenv";
const dotenv = require('dotenv');
dotenv.config();

const {PORT, NODE_ENV} = process.env;

// console.log("aaaaaaaaa",PORT,NODE_ENV);

export const Config = {
    PORT,
    NODE_ENV
};
