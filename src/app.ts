import express from 'express';
//npm i -D @types/express
// npm i -D ts-node nodemon
const app = express();

app.get('/',(req,res)=>{
   res.send("Welcome to Auth Service");
})

export default app;