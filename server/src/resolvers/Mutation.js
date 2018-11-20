import errorHandlerWrapper from "../utils/errorHandlerWrapper";
import { signUp, signIn, updateUser, deleteUser } from "./mutations/user";

const Mutation = {
    signUp: errorHandlerWrapper(signUp),
    signIn: errorHandlerWrapper(signIn),
    updateUser: errorHandlerWrapper(updateUser),
    deleteUser: errorHandlerWrapper(deleteUser)
};

export default Mutation;
