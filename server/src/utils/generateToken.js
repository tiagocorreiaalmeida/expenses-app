import jwt from "jsonwebtoken";
const secret = process.env.JWT_SECRET;

const generateToken = userId =>
    jwt.sign({ userId: userId }, secret, {
        expiresIn: "3 hours"
    });

export default generateToken;
