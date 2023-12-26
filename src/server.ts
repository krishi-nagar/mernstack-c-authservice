import {Config } from "./config";
import app from "./app";

const startServer =  () => {
 
    try {
        const PORT = Config.PORT
    app.listen(PORT,()=> console.log(`Listening on port ${PORT}`));
    } catch (error) {
        console.error(error);
        process.exit(1);
    }

}

startServer();

console.log(Config.PORT)