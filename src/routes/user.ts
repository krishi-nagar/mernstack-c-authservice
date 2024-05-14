import express, { NextFunction, RequestHandler, Response } from "express";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { CreateUserRequest } from "../types";
import logger from "../config/logger";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);

router.post(
  "/",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req: CreateUserRequest, res: Response, next: NextFunction) =>
    userController.create(req, res, next) as unknown as RequestHandler,
);
export default router;
