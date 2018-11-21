import getUserId from "../../utils/getUserId";
import { userExists } from "../../utils/validations";

const me = async (parent, args, { prisma, req }, info) => {
    const userId = getUserId(req);
    await userExists(userId, prisma);

    return prisma.query.user(
        {
            where: {
                id: userId
            }
        },
        info
    );
};

export { me };
