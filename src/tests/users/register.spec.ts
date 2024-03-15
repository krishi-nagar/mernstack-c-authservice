import request from 'supertest';
import app from "./../../app";
import { User } from '../../entity/User';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { isJWT, truncateTables } from '../utils';
import { Roles } from '../../constants';
import { RefreshToken } from '../../entity/RefreshToken';

describe("POST/auth/register",()=>{

    let connection : DataSource;

    beforeAll(async()=>{
        connection = await AppDataSource.initialize();
    })
    
    beforeEach(async()=>{
        //Database truncate
        // await truncateTables(connection);
        await connection.dropDatabase();
        await connection.synchronize();
    })

    afterAll(async()=>{
        await connection.destroy();
    })
    describe("Given All Fields" ,()=>{

        it("should return the 201 status code",async()=>{
            //AAA => Arange ,Act ,Assert
            // Arange
            const userData = {
                firstName : "Kinjal",
                lastName : "Nagar",
                email : "knagar@gmail.com",
                password : "Kinj@l2611",
            };

            //Act 
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            //Assert
            expect(response.statusCode).toBe(201);
        })

        it("should return valid JSON response",async()=>{
            
            const userData = {
                firstName : "Kinjal",
                lastName : "Nagar",
                email : "knagar@gmail.com",
                password : "Kinj@l2611",
            };
 
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
        
                expect((response.headers as Record<string, string>)['content-type']).toEqual(expect.stringContaining("json"));
        })

        it("should persist the user in the database",async()=>{

            const userData = {
                firstName : "Kinjal",
                lastName : "Nagar",
                email : "knagar@gmail.com",
                password : "Kinj@l2611",
            };
 
             await request(app)
                .post("/auth/register")
                .send(userData);

                //Assert
                const userRepository = connection.getRepository(User)
                const users = await userRepository.find();
                expect(users).toHaveLength(1);              
                expect(users[0].firstName).toBe(userData.firstName);
                expect(users[0].lastName).toBe(userData.lastName);
                expect(users[0].email).toBe(userData.email);
               // expect(users[0].password).toBe(userData.password);

        })

        it("should assign a customer role", async () => {
           // Arange
           const userData = {
            firstName : "Kinjal",
            lastName : "Nagar",
            email : "knagar@gmail.com",
            password : "Kinj@l2611",
        };

        //Act 
        const response = await request(app)
            .post("/auth/register")
            .send(userData);

        //Assert
        const userRepository = connection.getRepository(User)
        const users = await userRepository.find();
        expect (users[0]).toHaveProperty("role");
        expect(users[0].role).toBe(Roles.CUSTOMER); 
        });

        it("should store the hash password in the database",async()=>{
           // Arange
           const userData = {
            firstName : "Kinjal",
            lastName : "Nagar",
            email : "knagar@gmail.com",
            password : "Kinj@l2611",
        };

        //Act 
        const response = await request(app)
            .post("/auth/register")
            .send(userData);

        //Assert 
        const userRepository = connection.getRepository(User)
        const users = await userRepository.find();
        expect(users[0].password).not.toBe(userData.password)
        expect(users[0].password).toHaveLength(60);
        expect(users[0].password).toMatch(/^\$2b\$\d+\$/)
        })
       it("should return the access token and refresh token inside a cookie", async() => {
        // Arange
        const userData = {
            firstName : "Kinjal",
            lastName : "Nagar",
            email : "knagar@gmail.com",
            password : "Kinj@l2611",
        };

         // Act
         const response = await request(app)
         .post("/auth/register")
         .send(userData);

        interface Headers {
            [index: string]: string | string[];
            ["set-cookie"]: string[];
        }
        // Assert
        let accessToken = null;
        let refreshToken = null;

        const cookies = (response.headers as Headers)["set-cookie"] || [];
        // accessToken=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjkzOTA5Mjc2LCJleHAiOjE2OTM5MDkzMzYsImlzcyI6Im1lcm5zcGFjZSJ9.KetQMEzY36vxhO6WKwSR-P_feRU1yI-nJtp6RhCEZQTPlQlmVsNTP7mO-qfCdBr0gszxHi9Jd1mqf-hGhfiK8BRA_Zy2CH9xpPTBud_luqLMvfPiz3gYR24jPjDxfZJscdhE_AIL6Uv2fxCKvLba17X0WbefJSy4rtx3ZyLkbnnbelIqu5J5_7lz4aIkHjt-rb_sBaoQ0l8wE5KzyDNy7mGUf7cI_yR8D8VlO7x9llbhvCHF8ts6YSBRBt_e2Mjg5txtfBaDq5auCTXQ2lmnJtMb75t1nAFu8KwQPrDYmwtGZDkHUcpQhlP7R-y3H99YnrWpXbP8Zr_oO67hWnoCSw; Max-Age=43200; Domain=localhost; Path=/; Expires=Tue, 05 Sep 2023 22:21:16 GMT; HttpOnly; SameSite=Strict
        cookies.forEach((cookie) => {
            if (cookie.startsWith("accessToken=")) {
                accessToken = cookie.split(";")[0].split("=")[1];
            }

            if (cookie.startsWith("refreshToken=")) {
                refreshToken = cookie.split(";")[0].split("=")[1];
            }
        });
        // console.log(accessToken);
        expect(accessToken).not.toBeNull();
        expect(refreshToken).not.toBeNull();

        expect(isJWT(accessToken)).toBeTruthy();
        expect(isJWT(refreshToken)).toBeTruthy();

        });

        it("should store the refresh token in the database",async()=>{
            // Arange
        const userData = {
            firstName : "Kinjal",
            lastName : "Nagar",
            email : "knagar@gmail.com",
            password : "Kinj@l2611",
        };

         // Act
         const response = await request(app)
         .post("/auth/register")
         .send(userData);
         
         //Assert
        
         const refreshTokenRepo = connection.getRepository(RefreshToken);
        //  const refreshTokens = await refreshTokenRepo.find()
        //  expect(refreshTokens).toHaveLength(1);

        const tokens = await refreshTokenRepo
        .createQueryBuilder("refreshToken")
        .where("refreshToken.userId = :userId",{
            userId : (response.body as Record<string,string>).id,
        }).getMany();

        expect(tokens ).toHaveLength(1);

        })
  
    
})
describe("Fields are missing ",()=>{
    it("should return 400 status code if email is already exist",async()=>{
        // Arange
        const userData = {
            firstName : "Kinjal",
            lastName : "Nagar",
            email : "knagar@gmail.com",
            password : "Kinj@l2611",
        };
        const userRepository = connection.getRepository(User)
        // Assuming userData is an object or not an iterable
        await userRepository.save({ ...userData, role: Roles.CUSTOMER });


        //Act 
        const response = await request(app)
            .post("/auth/register")
            .send(userData);
        const users = await userRepository.find();

        //Assert 
        expect (response.statusCode).toBe(400);
        expect (users).toHaveLength(1);
        })
        it("should return 400 status code for fields validation",async()=>{
            // Arange
            const userData = {
             firstName : "Kinjal",
             lastName : "Nagar",
             email : "",
             password : "Kinj@l2611",
         };
         
         //Act 
         const response = await request(app)
             .post("/auth/register")
             .send(userData);
         
         //Assert 
         expect (response.statusCode).toBe(400);
         const userRepository = connection.getRepository(User);
         const users = await userRepository.find();
         expect(users).toHaveLength(0)
        
        })
        it("should return 400 status code if firstName is missing", async () => {
            // Arrange
            const userData = {
                firstName: "",
                lastName: "Nagar",
                email: "knagar@gmail.com",
                password: "Kinj@l2611",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it("should return 400 status code if password is missing", async () => {
            // Arrange
            const userData = {
                firstName: "Kinjal",
                lastName: "Nagar",
                email: "knagar@gmail.com",
                password: "",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
    });

    describe("Fields are not in proper format",()=>{
        it("should trim the email field",async()=>{
           // Arange
           const userData = {
            firstName : "Kinjal",
            lastName : "Nagar",
            email : " knagar@gmail.com ",
            password : "Kinj@l2611",
        };
          //Act
          const response = await request(app)
             .post("/auth/register")
             .send(userData)
          //Assert
          const userRepository = connection.getRepository(User)
          const users = await userRepository.find();
          const user  = users[0];
          expect(user.email).toBe("knagar@gmail.com");
        })
        it("should return 400 status code if email is not a valid email", async () => {
            // Arrange
            const userData = {
                firstName: "Kinjal",
                lastName: "Nagar",
                email: "knagar_gmail.com", // Invalid email
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it("should return 400 status code if password length is less than 8 chars", async () => {
            // Arrange
            const userData = {
                firstName: "Kinjal",
                lastName: "Nagar",
                email: "knagar@gmail.com",
                password: "pass", // less than 8 chars
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it("shoud return an array of error messages if email is missing", async () => {
            // Arrange
            const userData = {
                firstName: "Kinjal",
                lastName: "Nagar",
                email: "",
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.body).toHaveProperty("errors");
            expect(
                (response.body as Record<string, string>).errors.length,
            ).toBeGreaterThan(0);
        });
    })
})