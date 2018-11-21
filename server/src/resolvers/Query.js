import errorHandlerWrapper from "../utils/errorHandlerWrapper";
import { me } from "./queries/user";
import { expense, expenses } from "./queries/expense";

const Query = {
    me: errorHandlerWrapper(me),
    expense: errorHandlerWrapper(expense),
    expenses: errorHandlerWrapper(expenses)
};

export default Query;
