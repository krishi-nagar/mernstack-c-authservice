
// // import dotenv from "dotenv";
// const dotenv = require('dotenv');
// dotenv.config();

// const {PORT, NODE_ENV} = process.env;

// // console.log("aaaaaaaaa",PORT,NODE_ENV);

// export const Config = {
//     PORT,
//     NODE_ENV
// };
import {config} from 'dotenv';
import path from "path";

config ({ path:path.join(__dirname,`../../.env.${process.env.NODE_ENV}`)});
const {PORT,NODE_ENV,DB_HOST,DB_PORT,DB_USER,DB_PASSWORD,DB_NAME,REFRESH_TOKEN_SECRET,JWKS_URI} = process.env;

export const Config = {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
};