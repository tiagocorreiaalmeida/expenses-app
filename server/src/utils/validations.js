import { UserNotFoundError } from "./errorsList";

const userExists = async (userId, prisma) => {
    const userExists = await prisma.exists.User({
        id: userId
    });

    if (!userExists) throw new UserNotFoundError();
};

export { userExists };
