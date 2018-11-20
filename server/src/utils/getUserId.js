import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

const getUserId = (request, requiredAuth = true) => {
    const header = request.request
        ? request.request.headers.authorization
        : request.connection.context.Authorization;

    if (header) {
        const token = header.replace("Bearer ", "");
        const decoded = jwt.verify(token, secret);
        return decoded.userId;
    }

    if (requiredAuth) throw new Error("You need to login first!");

    return null;
};

export default getUserId;
