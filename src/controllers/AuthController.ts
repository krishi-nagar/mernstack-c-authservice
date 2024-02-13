import { NextFunction, Response } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';


export class AuthController {

    constructor(private userService: UserService){
        this.userService = userService;
    }
    async register(req : RegisterUserRequest, res : Response, next:NextFunction) {

        const {firstName, lastName,email, password } = req.body;
       
        try{
            const user = await this.userService.create({ firstName, lastName, email, password });
            console.log("User ID:", user.id); // Log the user ID after creation
            res.status(201).json({ id: user.id });
            return this.register; 
        } catch (err){
            next(err);
            return;
        }

        
      
     }
}