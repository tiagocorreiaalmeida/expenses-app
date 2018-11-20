import validator from "validator";
import bcrypt from "bcrypt";

import hashPassword from "../../utils/hashPassword";
import generateToken from "../../utils/generateToken";
import getUserId from "../../utils/getUserId";
import {
    InvalidEmailError,
    EmailInUseError,
    InvalidCredentialsError
} from "../../utils/errorsList";

const signUp = async (parent, args, { prisma }, info) => {
    const { name, email, password } = args.data;
    if (!validator.isEmail(email)) throw new InvalidEmailError();

    const emailInUse = await prisma.exists.User({ email });
    if (emailInUse) throw new EmailInUseError();

    const user = await prisma.mutation.createUser(
        {
            data: {
                name,
                email,
                password: hashPassword(password)
            }
        },
        info
    );

    return {
        user,
        token: generateToken(user.id)
    };
};

const signIn = async (parent, args, { prisma }, info) => {
    const { email, password } = args;
    const user = await prisma.query.user(
        {
            where: {
                email
            }
        },
        info
    );

    if (!bcrypt.compareSync(password, user.password))
        throw new InvalidCredentialsError();

    return {
        user,
        token: generateToken(user.id)
    };
};

const updateUser = async (parent, args, { prisma, req }, info) => {
    const userId = getUserId(req);
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

    const user = await prisma.mutation.updateUser(
        {
            data,
            where: {
                id: userId
            }
        },
        info
    );

    return user;
};

const deleteUser = async (parent, args, { prisma, req }, info) => {
    const userId = getUserId(req);
    return prisma.mutation.deleteUser({ where: { id: userId } }, info);
};

export { signUp, signIn, updateUser, deleteUser };
