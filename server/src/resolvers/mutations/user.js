import validator from "validator";
import bcrypt from "bcrypt";

import hashPassword from "../../utils/hashPassword";
import generateToken from "../../utils/generateToken";
import getUserId from "../../utils/getUserId";
import {
    InvalidEmailError,
    EmailInUseError,
    InvalidCredentialsError,
    UserNotFoundError
} from "../../utils/errorsList";
import { userExists } from "../../utils/validations";

const signUp = async (parent, args, { prisma }, info) => {
    const { name, email, password } = args.data;
    if (!validator.isEmail(email)) throw new InvalidEmailError();

    const emailInUse = await prisma.exists.User({ email });
    if (emailInUse) throw new EmailInUseError();

    const user = await prisma.mutation.createUser({
        data: {
            name: name.trim(),
            email,
            password: hashPassword(password)
        }
    });

    return {
        user,
        token: generateToken(user.id)
    };
};

const signIn = async (parent, args, { prisma }, info) => {
    const { email, password } = args;
    const user = await prisma.query.user({
        where: {
            email
        }
    });

    if (!user) throw new UserNotFoundError();

    if (!bcrypt.compareSync(password, user.password))
        throw new InvalidCredentialsError();

    return {
        user,
        token: generateToken(user.id)
    };
};

const updateUser = async (parent, args, { prisma, req }, info) => {
    const userId = getUserId(req);
    await userExists(userId, prisma);

    const { data } = args;

    if (typeof data.email === "string") {
        if (!validator.isEmail(data.email)) throw new InvalidEmailError();

        const emailInUse = await prisma.exists.User({
            email: data.email,
            id_not: userId
        });

        if (emailInUse) throw new EmailInUseError();
    }

    if (typeof data.password === "string")
        data.password = hashPassword(data.password);

    if (typeof data.name === "string") data.name = data.name.trim();

    return prisma.mutation.updateUser(
        {
            data,
            where: {
                id: userId
            }
        },
        info
    );
};

const deleteUser = async (parent, args, { prisma, req }, info) => {
    const userId = getUserId(req);
    await userExists(userId, prisma);

    return prisma.mutation.deleteUser({ where: { id: userId } }, info);
};

export { signUp, signIn, updateUser, deleteUser };
