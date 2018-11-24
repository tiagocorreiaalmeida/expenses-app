import { expect, assert } from "chai";

import server from "../src/index";
import getClient from "./utils/getClient";
import prisma from "../src/prisma";
import usersData from "./data/user";
import { signIn, signUp, deleteUser, updateUser, me } from "./utils/operations";
import { createUser } from "./utils/user";
import expensesData from "./data/expense";
import { createExpense } from "./utils/expense";

const client = getClient();

describe("#User", function() {
    this.timeout(20000);

    before(async () => {
        await prisma.mutation.deleteManyExpenses();
        await prisma.mutation.deleteManyUsers();
    });

    describe("Mutation", () => {
        describe("signUp", () => {
            it("should refuse an invalid email", async () => {
                const variables = {
                    data: {
                        ...usersData[0],
                        email: "invalidemail.com"
                    }
                };

                let response = "";

                try {
                    response = await client.mutate({
                        mutation: signUp,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal("Please provide a valid email.");
                }
            });

            it("should refuse an invalid password", async () => {
                const variables = {
                    data: {
                        ...usersData[0],
                        password: "123"
                    }
                };

                let response = "";

                try {
                    response = await client.mutate({
                        mutation: signUp,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal(
                        "Please provide a password with at least 8 characters."
                    );
                }
            });

            it("should signUp an user and return its info and a token", async () => {
                const user = usersData[0];
                const variables = {
                    data: user
                };

                let response = "";

                try {
                    response = await client.mutate({
                        mutation: signUp,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response.data.signUp).to.be.a("object");

                    const { signUp } = response.data;
                    expect(signUp).to.have.a.property("token");
                    expect(signUp.token).to.be.a("string");
                    expect(signUp).to.have.a.property("user");
                    expect(signUp.user).to.be.a("object");
                    expect(signUp.user).to.have.a.property("id");
                    expect(signUp.user).to.have.a.property("name");
                    expect(signUp.user).to.have.a.property("email");
                    expect(signUp.user).to.have.a.property("password");
                    expect(signUp.user).to.have.a.property("createdAt");

                    const { name, email, password } = signUp.user;
                    expect(name).to.equal(user.name);
                    expect(email).to.equal(user.email);
                    expect(password).to.be.null;
                }
            });
            it("should refuse an email already in use", async () => {
                const variables = {
                    data: usersData[0]
                };

                let response = "";

                try {
                    response = await client.mutate({
                        mutation: signUp,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal(
                        "The email provided is already in use."
                    );
                }
            });

            after(async () => {
                await prisma.mutation.deleteManyUsers();
            });
        });

        describe("signIn", () => {
            let user = usersData[0];
            before(async () => {
                await createUser(client, user);
            });

            it("should refuse an non existent user", async () => {
                const variables = {
                    email: usersData[1].email,
                    password: usersData[1].password
                };
                let response;

                try {
                    response = await client.mutate({
                        mutation: signIn,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal("Account not found.");
                }
            });

            it("should refuse invalid credentials", async () => {
                const variables = {
                    email: user.email,
                    password: "9999999999"
                };

                let response;

                try {
                    response = await client.mutate({
                        mutation: signIn,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal("Invalid credentials provided.");
                }
            });

            it("should signIn an user and return its info and a token", async () => {
                const variables = {
                    email: user.email,
                    password: user.password
                };

                let response = "";

                try {
                    response = await client.mutate({
                        mutation: signIn,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response.data.signIn).to.be.a("object");

                    const { signIn } = response.data;
                    expect(signIn).to.have.a.property("token");
                    expect(signIn.token).to.be.a("string");
                    expect(signIn).to.have.a.property("user");
                    expect(signIn.user).to.be.a("object");
                    expect(signIn.user).to.have.a.property("id");
                    expect(signIn.user).to.have.a.property("name");
                    expect(signIn.user).to.have.a.property("email");
                    expect(signIn.user).to.have.a.property("password");
                    expect(signIn.user).to.have.a.property("createdAt");

                    const { name, email, password } = signIn.user;
                    expect(name).to.equal(user.name);
                    expect(email).to.equal(user.email);
                    expect(password).to.be.null;
                }
            });

            after(async () => {
                await prisma.mutation.deleteManyUsers();
            });
        });

        describe("updateUser", () => {
            let user, token, response, clientWithJwt;
            before(async () => {
                const userResponseOne = await createUser(client, usersData[0]);
                const userResponseTwo = await createUser(client, usersData[1]);

                token = userResponseOne.token;
                user = userResponseOne.user;
                clientWithJwt = getClient(token);
            });

            it("should should refuse a user not authenticated", async () => {
                const variables = {
                    data: {
                        name: "new user name",
                        email: "abc@gmail.com",
                        password: "12345678"
                    }
                };

                try {
                    response = await client.mutate({
                        mutation: updateUser,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal("You need to login first!");
                }
            });

            it("should refuse an invalid email", async () => {
                const variables = {
                    data: {
                        name: "new user name",
                        email: "abcgmail.com",
                        password: "12345678"
                    }
                };

                try {
                    response = await clientWithJwt.mutate({
                        mutation: updateUser,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal("Please provide a valid email.");
                }
            });

            it("should refuse an invalid password", async () => {
                const variables = {
                    data: {
                        name: "new user name",
                        email: "abc@gmail.com",
                        password: "123"
                    }
                };

                try {
                    response = await clientWithJwt.mutate({
                        mutation: updateUser,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal(
                        "Please provide a password with at least 8 characters."
                    );
                }
            });

            it("should refuse an duplicated email", async () => {
                const variables = {
                    data: {
                        name: "new user name",
                        email: usersData[1].email,
                        password: "12345678"
                    }
                };

                try {
                    response = await clientWithJwt.mutate({
                        mutation: updateUser,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal(
                        "The email provided is already in use."
                    );
                }
            });

            it("should update the user and return the requested data", async () => {
                const variables = {
                    data: {
                        name: "new user name",
                        email: "abc@gmail.com",
                        password: "123999999"
                    }
                };

                try {
                    response = await clientWithJwt.mutate({
                        mutation: updateUser,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response.data.updateUser).to.be.a("object");

                    const { updateUser } = response.data;
                    expect(updateUser).to.have.a.property("id");
                    expect(updateUser).to.have.a.property("name");
                    expect(updateUser).to.have.a.property("email");
                    expect(updateUser).to.have.a.property("password");
                    expect(updateUser).to.have.a.property("createdAt");

                    const { name, email, password, id } = updateUser;
                    expect(id).to.equal(user.id);
                    expect(name).to.equal(variables.data.name);
                    expect(email).to.equal(variables.data.email);
                    expect(password).to.be.null;
                }
            });

            //account deleted but token stills valid
            it("should refuse a non existent user", async () => {
                let response;
                const variables = {
                    data: {
                        name: "new user name",
                        email: "abc@gmail.com",
                        password: "123999999"
                    }
                };

                await prisma.mutation.deleteUser({
                    where: {
                        id: user.id
                    }
                });

                try {
                    response = await clientWithJwt.mutate({
                        mutation: updateUser,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal("Account not found.");
                }
            });

            after(async () => {
                await prisma.mutation.deleteManyUsers();
            });
        });

        describe("deleteUser", () => {
            let user, token, clientWithJwt;
            before(async () => {
                const response = await createUser(client, usersData[0]);
                token = response.token;
                user = response.user;
                clientWithJwt = getClient(token);

                await createExpense(clientWithJwt, expensesData[0]);
                await createExpense(clientWithJwt, expensesData[1]);
            });

            it("should should refuse a user not authenticated", async () => {
                let response;

                try {
                    response = await client.mutate({
                        mutation: deleteUser
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal("You need to login first!");
                }
            });

            it("should delete the user", async () => {
                let response;

                try {
                    response = await clientWithJwt.mutate({
                        mutation: deleteUser
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response.data.deleteUser).to.be.a("object");

                    const { deleteUser } = response.data;
                    expect(deleteUser).to.have.a.property("id");
                    expect(deleteUser).to.have.a.property("name");
                    expect(deleteUser).to.have.a.property("email");
                    expect(deleteUser).to.have.a.property("password");
                    expect(deleteUser).to.have.a.property("createdAt");

                    const { name, email, password } = deleteUser;
                    expect(name).to.equal(user.name);
                    expect(email).to.equal(user.email);
                    expect(password).to.be.null;
                }
            });

            it("should delete all the user related expenses", async () => {
                const userHasExpenses = await prisma.exists.Expense({
                    owner: {
                        id: user.id
                    }
                });

                expect(userHasExpenses).to.be.false;
            });

            //account deleted but token stills valid
            it("should refuse a non existent user", async () => {
                let response;

                try {
                    response = await clientWithJwt.mutate({
                        mutation: deleteUser
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal("Account not found.");
                }
            });

            after(async () => {
                await prisma.mutation.deleteManyUsers();
            });
        });
    });

    describe("Query", () => {
        before(async () => {
            await prisma.mutation.deleteManyUsers();
        });

        describe("me", () => {
            let token, user, clientWithJwt, clientWithJwtCacheWorkAround;
            before(async () => {
                const userResponse = await createUser(client, usersData[0]);
                token = userResponse.token;
                user = userResponse.user;

                clientWithJwt = await getClient(token);
                clientWithJwtCacheWorkAround = await getClient(token);
            });

            it("should should refuse a user not authenticated", async () => {
                let response;

                try {
                    response = await client.query({
                        query: me
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal("You need to login first!");
                }
            });

            it("should return the user info with protected fields as null", async () => {
                let response;

                try {
                    response = await clientWithJwt.query({
                        query: me
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response.data.me).to.be.a("object");

                    const { me } = response.data;
                    expect(me).to.have.a.property("id");
                    expect(me).to.have.a.property("name");
                    expect(me).to.have.a.property("email");
                    expect(me).to.have.a.property("password");
                    expect(me).to.have.a.property("createdAt");
                    expect(me).to.have.a.property("expenses");

                    const { name, email, password, id, expenses } = me;
                    expect(id).to.equal(user.id);
                    expect(name).to.equal(user.name);
                    expect(email).to.equal(user.email);
                    expect(password).to.be.null;
                    assert.deepEqual(expenses, []);
                }
            });

            //account deleted but token stills valid
            it("should decline a non existent user", async () => {
                let response;

                await prisma.mutation.deleteUser({
                    where: {
                        id: user.id
                    }
                });

                try {
                    //apollo seems to be caching the request
                    response = await clientWithJwtCacheWorkAround.query({
                        query: me
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal("Account not found.");
                }
            });
        });

        after(async () => {
            await prisma.mutation.deleteManyUsers();
        });
    });
});
