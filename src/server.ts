import { Config } from "./config";


const PORT = Config.PORT;
const NODE_ENV = Config.NODE_ENV;
// Log the value of PORT
console.log("PORT", PORT,"NODE_ENV", NODE_ENV);


//  npm install -g ts-node
// npm install --save-dev @types/dotenv