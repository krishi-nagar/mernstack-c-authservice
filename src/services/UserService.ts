import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { UserData } from "../types";
import { Repository } from "typeorm";
export class UserService {
    
    // constructor using for the dependency injection process
    constructor(private userRepository: Repository<User>){}
    
    async create({firstName, lastName,email, password}:UserData){
        return await this.userRepository.save({ firstName, lastName,email, password })
    }

}   