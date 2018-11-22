import { signIn, signUp } from "./operations";

const createUser = async (client, userData) => {
    const user = await client.mutate({
        mutation: signUp,
        variables: {
            data: userData
        }
    });

    return user.data.signUp;
};

export { createUser };
