import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
import { User } from "../entity/User";
import { LimitedUserData, UserData } from "../types";
import { Repository } from "typeorm";

export class UserService {
  // constructor using for the dependency injection process
  constructor(private userRepository: Repository<User>) {}

  async create({
    firstName,
    lastName,
    email,
    password,
    role,
    tenantId,
  }: UserData) {
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
        role,
        tenant: tenantId ? { id: tenantId } : undefined,
      });
    } catch (err) {
      const error = createHttpError(500, "Failed to store data in database");

      throw error;
    }
  }
  /*
  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email: email } });
  }*/
  async findByEmailWithPassword(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
      select: ["id", "firstName", "lastName", "email", "role", "password"],
    });
  }
  async findById(id: number) {
    return await this.userRepository.findOne({ where: { id } });
  }
  async update(userId: number, { firstName, lastName, role }: LimitedUserData) {
    try {
      return await this.userRepository.update(userId, {
        firstName,
        lastName,
        role,
      });
    } catch (err) {
      const error = createHttpError(
        500,
        "Failed to update the user in the database",
      );
      throw error;
    }
  }

  async getAll() {
    return await this.userRepository.find();
  }

  async deleteById(userId: number) {
    return await this.userRepository.delete(userId);
  }
}
