import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { UserData } from "../types";
import { Repository } from "typeorm";
import { Roles } from "../constants";
export class UserService {
  // constructor using for the dependency injection process
  constructor(private userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password }: UserData) {
    const user = await this.userRepository.findOne({ where: { email: email } });
    if (user) {
      const err = createHttpError(400, "Email is already exists");
      throw err;
    }

    //Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      });
    } catch (err) {
      const error = createHttpError(500, "Failed to store data in database");

      throw error;
    }
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email: email } });
  }
  async findById(id: number) {
    return await this.userRepository.findOne({ where: { id } });
  }
}
