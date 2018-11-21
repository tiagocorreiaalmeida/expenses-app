import errorHandlerWrapper from "../utils/errorHandlerWrapper";
import { signUp, signIn, updateUser, deleteUser } from "./mutations/user";
import {
    createExpense,
    updateExpense,
    deleteExpense
} from "./mutations/expense";

const Mutation = {
    signUp: errorHandlerWrapper(signUp),
    signIn: errorHandlerWrapper(signIn),
    updateUser: errorHandlerWrapper(updateUser),
    deleteUser: errorHandlerWrapper(deleteUser),
    createExpense: errorHandlerWrapper(createExpense),
    updateExpense: errorHandlerWrapper(updateExpense),
    deleteExpense: errorHandlerWrapper(deleteExpense)
};

export default Mutation;
