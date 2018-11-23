import { expect, assert } from "chai";

import server from "../src/index";
import getClient from "./utils/getClient";
import prisma from "../src/prisma";
import usersData from "./data/user";
import expensesData from "./data/expense";
import {
    createExpense,
    updateExpense,
    deleteExpense
} from "./utils/operations";
import { createUser } from "./utils/user";
import { createExpense as createExpenseUtil } from "./utils/expense";

const client = getClient();

describe("#Expense", function() {
    this.timeout(20000);
    before(async () => {
        await prisma.mutation.deleteManyExpenses();
        await prisma.mutation.deleteManyUsers();
    });

    describe("Mutation", () => {
        describe("createExpense", () => {
            let user, token, clientWithJwt;
            before(async () => {
                await prisma.mutation.deleteManyExpenses();
                await prisma.mutation.deleteManyUsers();

                const userResponse = await createUser(client, usersData[0]);
                token = userResponse.token;
                user = userResponse.user;

                clientWithJwt = getClient(token);
            });

            it("should should refuse a user not authenticated", async () => {
                let response;
                const variables = {
                    data: {
                        ...expensesData[0]
                    }
                };

                try {
                    response = await client.mutate({
                        mutation: createExpense,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal("You need to login first!");
                }
            });

            it("should refuse an invalid title", async () => {
                let response;
                const variables = {
                    data: {
                        ...expensesData[0]
                    }
                };

                variables.data.title = "a";

                try {
                    response = await clientWithJwt.mutate({
                        mutation: createExpense,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal(
                        "Please provide a expense title with at least 2 characters."
                    );
                }
            });

            it("should refuse an invalid date", async () => {
                let response;
                const variables = {
                    data: {
                        ...expensesData[0]
                    }
                };

                variables.data.date = "14/22/131";

                try {
                    response = await clientWithJwt.mutate({
                        mutation: createExpense,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal("Please provide a valid date.");
                }
            });

            it("should create an expense and return the requested info", async () => {
                let response;
                const variables = {
                    data: {
                        ...expensesData[0]
                    }
                };

                try {
                    response = await clientWithJwt.mutate({
                        mutation: createExpense,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response.data.createExpense).to.be.a("object");

                    const { createExpense } = response.data;
                    expect(createExpense).to.have.a.property("id");
                    expect(createExpense).to.have.a.property("title");
                    expect(createExpense).to.have.a.property("description");
                    expect(createExpense).to.have.a.property("amount");
                    expect(createExpense).to.have.a.property("date");
                    expect(createExpense).to.have.property("owner");

                    const {
                        title,
                        description,
                        amount,
                        date,
                        owner
                    } = createExpense;
                    expect(title).to.equal(variables.data.title);
                    expect(description).to.equal(variables.data.description);
                    expect(amount).to.equal(variables.data.amount);
                    assert.deepEqual(new Date(date), variables.data.date);
                    expect(owner).to.be.a("object");
                    expect(owner).to.have.a.property("id");
                    expect(owner.id).to.equal(user.id);
                }
            });

            it("should refuse a duplicated expense title", async () => {
                let response;
                const variables = {
                    data: {
                        ...expensesData[0]
                    }
                };

                try {
                    response = await clientWithJwt.mutate({
                        mutation: createExpense,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal(
                        "You already have an expense with the same title."
                    );
                }
            });
        });

        describe("updateExpense", () => {
            let user,
                token,
                clientWithJwt,
                expense,
                expenseTwo,
                expenseNotOwned;
            const updates = {
                title: "New expense title",
                description: "Updated expense title",
                date: new Date()
            };

            before(async () => {
                await prisma.mutation.deleteManyExpenses();
                await prisma.mutation.deleteManyUsers();

                const userResponse = await createUser(client, usersData[0]);
                const userResponseTwo = await createUser(client, usersData[1]);
                token = userResponse.token;
                user = userResponse.user;

                clientWithJwt = getClient(token);
                const clientTempWithJwt = getClient(userResponseTwo.token);

                expense = await createExpenseUtil(
                    clientWithJwt,
                    expensesData[0]
                );

                expenseTwo = await createExpenseUtil(
                    clientWithJwt,
                    expensesData[1]
                );

                expenseNotOwned = await createExpenseUtil(
                    clientTempWithJwt,
                    expensesData[1]
                );
            });

            it("should should refuse a user not authenticated", async () => {
                let response;
                const variables = {
                    id: expense.id,
                    data: { ...updates }
                };

                try {
                    response = await client.mutate({
                        mutation: updateExpense,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal("You need to login first!");
                }
            });

            it("should refuse a non existent expense", async () => {
                let response;
                const variables = {
                    id: expenseNotOwned.id,
                    data: { ...updates }
                };

                try {
                    response = await clientWithJwt.mutate({
                        mutation: updateExpense,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal("Expense not found.");
                }
            });

            it("should refuse an invalid title", async () => {
                let response;
                const variables = {
                    id: expense.id,
                    data: { ...updates }
                };

                variables.data.title = "1";

                try {
                    response = await clientWithJwt.mutate({
                        mutation: updateExpense,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal(
                        "Please provide a expense title with at least 2 characters."
                    );
                }
            });

            it("should refuse a duplicated expense title", async () => {
                let response;
                const variables = {
                    id: expense.id,
                    data: { ...updates }
                };

                variables.data.title = expenseTwo.title;

                try {
                    response = await clientWithJwt.mutate({
                        mutation: updateExpense,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal(
                        "You already have an expense with the same title."
                    );
                }
            });

            it("should refuse an invalid date", async () => {
                let response;
                const variables = {
                    id: expense.id,
                    data: { ...updates }
                };

                variables.data.date = "13-13-78213";

                try {
                    response = await clientWithJwt.mutate({
                        mutation: updateExpense,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal("Please provide a valid date.");
                }
            });

            it("should update the expense and return the new data", async () => {
                let response;
                const variables = {
                    id: expense.id,
                    data: { ...updates }
                };

                try {
                    response = await clientWithJwt.mutate({
                        mutation: updateExpense,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response.data.updateExpense).to.be.a("object");

                    const { updateExpense } = response.data;
                    expect(updateExpense).to.have.a.property("id");
                    expect(updateExpense).to.have.a.property("title");
                    expect(updateExpense).to.have.a.property("description");
                    expect(updateExpense).to.have.a.property("amount");
                    expect(updateExpense).to.have.a.property("date");
                    expect(updateExpense).to.have.property("owner");

                    const {
                        id,
                        title,
                        description,
                        amount,
                        date,
                        owner
                    } = updateExpense;

                    expect(id).to.equal(expense.id);
                    expect(title).to.equal(variables.data.title);
                    expect(description).to.equal(variables.data.description);
                    expect(amount).to.equal(expense.amount);
                    assert.deepEqual(new Date(date), variables.data.date);
                    expect(owner).to.be.a("object");
                    expect(owner).to.have.a.property("id");
                    expect(owner.id).to.equal(user.id);
                }
            });
        });
        describe("deleteExpense", () => {
            let token, expense, user, clientWithJwt, expenseNotOwned;
            before(async () => {
                await prisma.mutation.deleteManyExpenses();
                await prisma.mutation.deleteManyUsers();

                const userResponse = await createUser(client, usersData[0]);
                const userResponseTwo = await createUser(client, usersData[1]);

                token = userResponse.token;
                user = userResponse.user;

                clientWithJwt = getClient(token);
                const clientTempWithJwt = getClient(userResponseTwo.token);

                expense = await createExpenseUtil(
                    clientWithJwt,
                    expensesData[0]
                );

                expenseNotOwned = await createExpenseUtil(
                    clientTempWithJwt,
                    expensesData[1]
                );
            });

            it("should should refuse a user not authenticated", async () => {
                let response;
                const variables = {
                    id: expense.id
                };

                try {
                    response = await client.mutate({
                        mutation: deleteExpense,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal("You need to login first!");
                }
            });

            it("should refuse a non existent expense", async () => {
                let response;
                const variables = {
                    id: expenseNotOwned.id
                };

                try {
                    response = await clientWithJwt.mutate({
                        mutation: deleteExpense,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response).to.be.a("string");
                    expect(response).to.equal("Expense not found.");
                }
            });

            it("should delete the expense", async () => {
                let response;
                const variables = {
                    id: expense.id
                };

                try {
                    response = await clientWithJwt.mutate({
                        mutation: deleteExpense,
                        variables
                    });
                } catch (e) {
                    response = e.graphQLErrors[0].message;
                } finally {
                    expect(response.data.deleteExpense).to.be.a("object");

                    const { deleteExpense } = response.data;
                    expect(deleteExpense).to.have.a.property("id");

                    const { id } = deleteExpense;
                    expect(id).to.equal(expense.id);

                    const expenseExists = await prisma.exists.Expense({ id });
                    expect(expenseExists).to.be.false;
                }
            });
        });
    });

    describe("Query", () => {
        describe("expense", () => {
            before(async () => {
                await prisma.mutation.deleteManyExpenses();
                await prisma.mutation.deleteManyUsers();
            });

            it("should should refuse a user not authenticated", () => {});
            it("should refuse a non existent expense", () => {});
            it("should return the requested expense data", () => {});
        });
        describe("expenses", () => {
            it("should should refuse a user not authenticated", () => {});
            //tests for skip limits filters
        });
    });
});
