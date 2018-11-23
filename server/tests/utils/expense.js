import { createExpense as createExpenseOperaion } from "./operations";

const createExpense = async (client, expenseData) => {
    const response = await client.mutate({
        mutation: createExpenseOperaion,
        variables: {
            data: expenseData
        }
    });

    return response.data.createExpense;
};

export { createExpense };
