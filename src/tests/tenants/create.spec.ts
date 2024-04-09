import { DataSource } from "typeorm";
import request from "supertest";
import { AppDataSource } from "../../config/data-source";
import app from "../../app";
import { Tenant } from "../../entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../constants";

describe("POST /tenants", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
    jwks.start();

    adminToken = jwks.token({
      sub: "1",
      role: Roles.ADMIN,
    });
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should return a 201 status code", async () => {
      const tenantData = {
        name: "Tenant name",
        address: "Tenant address",
      };
      const response = await request(app)
        .post("/tenants")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(tenantData);

      expect(response.statusCode).toBe(201);
    });
    it("should create a tenants in database", async () => {
      const tenantData = {
        name: "Tenant name",
        address: "Tenant address",
      };
      const response = await request(app)
        .post("/tenants")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(tenantData);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      expect(tenants).toHaveLength(1);
      expect(tenants[0].name).toBe(tenantData.name);
    });

    it("should return 401 if user is not authenticated", async () => {
      const tenantData = {
        name: "Tenant name",
        address: "Tenant address",
      };
      const response = await request(app).post("/tenants").send(tenantData);
      expect(response.statusCode).toBe(401);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      expect(tenants).toHaveLength(0);
    });
  });
});
