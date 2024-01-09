import {Config } from "./config";
import app from "./app";
import logger from "./config/logger";

// docker test

const startServer =  () => {
    const PORT = Config.PORT
 
    try {
        
        app.listen(PORT,()=> logger.info(`Listening on port ${PORT}`));
    } catch (err : unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
        }
        setTimeout(()=>{
            process.exit(1);
        },1000);
        
    }

}

startServer();

console.log(Config.PORT)