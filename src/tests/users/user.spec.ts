import { DataSource, Repository } from "typeorm";
import request from "supertest";
import createJWTMock from "mock-jwks";
import app from "../../../src/app";
import { AppDataSource } from "../../config/data-source";
import createJWKSMock from "mock-jwks";
import { User } from "../../entity/User";
import { Roles } from "../../constants";

describe("POST /auth/login", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should return the 200 status code", async () => {
      const accessToken = jwks.token({ sub: "1", role: Roles.CUSTOMER });
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();
      expect(response.statusCode).toBe(200);
    });
    it("should return the user data", async () => {
      //Register User
      const userData = {
        firstName: "Kinjal",
        lastName: "Nagar",
        email: "knagar@gmail.com",
        password: "password",
      };
      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });
      //GenerATE token
      const accessToken = jwks.token({ sub: String(data.id), role: data.role });
      //Add token to cookie
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();
      //Assert
      //Check if user id matches with registered user
      expect(response.body.id).toBe(data.id);
    });
    it("should not return the password field", async () => {
      // Register user
      const userData = {
        firstName: "Kinjal",
        lastName: "Nagar",
        email: "knagar@gmail.com",
        password: "password",
      };
      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });
      // Generate token
      const accessToken = jwks.token({
        sub: String(data.id),
        role: data.role,
      });

      // Add token to cookie
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();
      // Assert
      // Check if user id matches with registered user
      expect(response.body as Record<string, string>).not.toHaveProperty(
        "password",
      );
    });
    it("should return 401 status code if token does not exists", async () => {
      // Register user
      const userData = {
        firstName: "Kinjal",
        lastName: "Nagar",
        email: "knagar@gmail.com",
        password: "password",
      };
      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });
      // Generate token
      const accessToken = jwks.token({
        sub: String(data.id),
        role: data.role,
      });

      // Add token to cookie
      const response = await request(app)
        .get("/auth/self")
        .send();
      // Assert
      // Check if user id matches with registered user
      expect(response.statusCode).toBe(401);
    });
  });
});
