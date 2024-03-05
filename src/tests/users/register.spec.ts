import request from 'supertest';
import app from "./../../app";
import { User } from '../../entity/User';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { truncateTables } from '../utils';
import { Roles } from '../../constants';

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