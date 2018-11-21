import getUserId from "../../utils/getUserId";
import {
    expenseTitleSanitize,
    expenseDateSanitize
} from "../../utils/sanitizeData";
import {
    DuplicatedExpenseTitleError,
    ExpenseNotFoundError
} from "../../utils/errorsList";

const createExpense = async (parent, { data }, { prisma, req }, info) => {
    const userId = getUserId(req);
    const { title, description, amount, date } = data;

    const expenseData = {
        title: expenseTitleSanitize(title),
        description: description.trim(),
        amount,
        date: expenseDateSanitize(date),
        owner: {
            connect: {
                id: userId
            }
        }
    };

    const titleInUse = await prisma.exists.Expense({
        title,
        owner: {
            id: userId
        }
    });

    if (titleInUse) throw new DuplicatedExpenseTitleError();

    return prisma.mutation.createExpense(
        {
            data: expenseData
        },
        info
    );
};

const updateExpense = async (parent, { data, id }, { prisma, req }, info) => {
    const userId = getUserId(req);

    const expenseExists = await prisma.exists.Expense({
        id,
        owner: {
            id: userId
        }
    });

    if (!expenseExists) throw new ExpenseNotFoundError();

    if (typeof data.title === "string") {
        data.title = expenseTitleSanitize(data.title);

        const titleInUse = await prisma.exists.Expense({
            title: data.title,
            owner: {
                id: userId
            }
        });

        if (titleInUse) throw new DuplicatedExpenseTitleError();
    }

    if (typeof data.date === "string")
        data.date = expenseDateSanitize(data.date);

    return prisma.mutation.updateExpense(
        {
            where: {
                id
            },
            data
        },
        info
    );
};

const deleteExpense = async (parent, { id }, { prisma, req }, info) => {
    const userId = getUserId(req);

    const expenseExists = await prisma.exists.Expense({
        id,
        owner: {
            id: userId
        }
    });

    if (!expenseExists) throw new ExpenseNotFoundError();

    return prisma.mutation.deleteExpense(
        {
            where: {
                id
            }
        },
        info
    );
};

export { createExpense, updateExpense, deleteExpense };
