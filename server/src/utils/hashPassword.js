import bcrypt from "bcrypt";

import { InvalidPasswordError } from "../utils/errorsList";

const hashPassword = password => {
    password = password.trim();
    if (password.length < 8) throw new InvalidPasswordError();

    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

export default hashPassword;
