import request from 'supertest';
import app from "./../../app";

describe("POST/auth/register",()=>{

    describe("Given All Fields" ,()=>{

        it("should return the 201 status code",async()=>{
            //AAA => Arange ,Act ,Assert
            // Arange
            const userData = {
                firstname : "Kinjal",
                lastname : "Nagar",
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
                firstname : "Kinjal",
                lastname : "Nagar",
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
                firstname : "Kinjal",
                lastname : "Nagar",
                email : "knagar@gmail.com",
                password : "secret",
            };
 
             await request(app)
                .post("/auth/register")
                .send(userData);

        })
    })
    describe("Fields are missing ",()=>{});
})