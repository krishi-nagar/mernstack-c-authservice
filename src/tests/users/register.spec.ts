import request from 'supertest';
import app from "./../../app";
import { User } from '../../entity/User';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { truncateTables } from '../utils';

describe("POST/auth/register",()=>{

    let connection : DataSource;

    beforeAll(async()=>{
        connection = await AppDataSource.initialize();
    })
    
    beforeEach(async()=>{
        //Database truncate
        await truncateTables(connection);
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
                password : "secret",
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
                password : "secret",
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
                password : "secret",
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
                expect(users[0].password).toBe(userData.password);

        })
/*
        it("should return an id of the created user", async () => {
            // Arrange
            const userData = {
                firstName : "Kinjal",
                lastName : "Nagar",
                email : "knagar@gmail.com",
                password : "secret",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            console.log(response.body);
            expect(response.body).toHaveProperty("id");
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect((response.body as Record<string, string>).id).toBe(
                users[0].id,
            );
        });*/
    })
    describe("Fields are missing ",()=>{});
})