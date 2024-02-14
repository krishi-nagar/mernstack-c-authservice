import { NextFunction, Response } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
// import { Logger } from 'winston';
import winston, { Logger } from 'winston';


export class AuthController {

    constructor(private userService: UserService,private logger: Logger) {
        this.userService = userService;
        this.logger = logger;
    }
    async register(req : RegisterUserRequest, res : Response, next:NextFunction) {

        const {firstName, lastName,email, password } = req.body;
        this.logger.debug("New request to register a user",{firstName,lastName,email,password:"****"});
       
        try{
            const user = await this.userService.create({ firstName, lastName, email, password });
            console.log("User ID:", user.id); // Log the user ID after creation
            this.logger.info("User has been registered",{id:user.id});
            res.status(201).json({ id: user.id });
            return this.register; 
        } catch (err){
            next(err);
            return;
        }

        
      
     }
}