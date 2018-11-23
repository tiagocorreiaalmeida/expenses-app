import getUserId from "../../utils/getUserId";

import { ExpenseNotFoundError } from "../../utils/errorsList";

const expense = async (parent, { id }, { prisma, req }, info) => {
    const userId = getUserId(req);

    const [expense] = await prisma.query.expenses(
        {
            where: {
                id,
                owner: {
                    id: userId
                }
            }
        },
        info
    );

    if (!expense) throw new ExpenseNotFoundError();

    return expense;
};

const expenses = async (parent, args, { prisma, req }, info) => {
    const userId = getUserId(req);

    const { query, skip, limit, orderBy } = args;
    const optionalArgs = {
        first: limit,
        skip,
        orderBy,
        where: {
            owner: {
                id: userId
            }
        }
    };
    if (query) optionalArgs.where.title_contains = query;

    return prisma.query.expenses(optionalArgs, info);
};

export { expense, expenses };
