import { NextFunction, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import  { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';
import { TokenService } from '../services/TokenService';


export class AuthController {

    constructor(private userService: UserService,private logger: Logger,private tokenService : TokenService) {
        this.userService = userService;
        this.logger = logger;
        this.tokenService = tokenService;
    }
    async register(req : RegisterUserRequest, res : Response, next:NextFunction) {

        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({errors:result.array()})
        }
        const {firstName, lastName,email, password } = req.body;
        this.logger.debug("New request to register a user",{firstName,lastName,email,password:"****"});
       
        try{
            const user = await this.userService.create({ firstName, lastName, email, password });
            // console.log("User ID:", user.id); // Log the user ID after creation
            this.logger.info("User has been registered",{id:user.id});

            
            const payload :JwtPayload ={
                sub :String(user.id),
                role :user.role,
            }

            //Persits the token 
            const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365 ; //1Y -> (Leap year)
            const refreshtokenRepository =  AppDataSource.getRepository(RefreshToken)
            const newRefreshToken = await refreshtokenRepository.save({
                user : user,
                expiresAt : new Date(Date.now() + (MS_IN_YEAR))
            })
            
            

            const accessToken = this.tokenService.generateAccessToken(payload)
            // const refreshToken = sign(payload,Config.REFRESH_TOKEN_SECRET!,{
            //     algorithm : "HS256",
            //     expiresIn:'1y',
            //     issuer:'auth-service',
            // });

            const refreshToken = this.tokenService.generateRefreshToken({...payload,id:String(newRefreshToken.id)})
            
            res.cookie("accessToken",accessToken,{
                domain : 'localhost',
                sameSite : 'strict',
                maxAge : 1000 * 60 * 60 ,// 1h 
                httpOnly : true, // imp
            })
            
            res.cookie("refreshToken",refreshToken,{
                domain : 'localhost',
                sameSite : 'strict',
                maxAge : 1000 * 60 * 60 * 24 * 365,// 1h 
                httpOnly : true, // imp
            })
            res.status(201).json({ id: user.id });
            return this.register; 
        } catch (err){
            next(err);
            return;
        }

        
      
     }
}