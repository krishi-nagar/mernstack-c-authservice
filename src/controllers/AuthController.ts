import { NextFunction, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
    private credentialService: CredentialService,
  ) {
    this.userService = userService;
    this.logger = logger;
    this.tokenService = tokenService;
  }
  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { firstName, lastName, email, password } = req.body;
    this.logger.debug("New request to register a user", {
      firstName,
      lastName,
      email,
      password: "****",
    });

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });
      // console.log("User ID:", user.id); // Log the user ID after creation
      this.logger.info("User has been registered", { id: user.id });

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      //Persits the token

      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      const accessToken = this.tokenService.generateAccessToken(payload);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1h
        httpOnly: true, // imp
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1h
        httpOnly: true, // imp
      });
      res.status(201).json({ id: user.id });
      return this.register;
    } catch (err) {
      next(err);
      return;
    }
  }

  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { email, password } = req.body;
    this.logger.debug("New request to login a user", {
      email,
      password: "****",
    });

    //check if username (email) exist in database
    // compare password
    //generate tokens
    //add tokens to cookies
    //return the response(id)

    try {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        const error = createHttpError(400, "Email or Password doesn't match");
        next(error);
        return;
      }
      const passwordMatch = await this.credentialService.comparePassword(
        password,
        user.password,
      );
      if (!passwordMatch) {
        const error = createHttpError(400, "Email or Password doesn't match");
        next(error);
        return;
      }
      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      //Persits the token

      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      const accessToken = this.tokenService.generateAccessToken(payload);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1h
        httpOnly: true, // imp
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1h
        httpOnly: true, // imp
      });
      this.logger.info("User has been logged in", { id: user.id });
      res.json({ id: user.id });
      return this.register;
    } catch (err) {
      next(err);
      return;
    }
  }
}
