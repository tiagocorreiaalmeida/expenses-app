import { createError } from "apollo-errors";

const InternalError = createError("Internal Error", {
    message: "Something went wrong, please try again later"
});

const InvalidEmailError = createError("InvalidEmail", {
    message: "Please provide a valid email."
});

const EmailInUseError = createError("EmailInUse", {
    message: "The email provided is already in use."
});

const InvalidPasswordError = createError("InvalidPassword", {
    message: "Please provide a password with at least 8 characters."
});

const InvalidCredentialsError = createError("InvalidCredentials", {
    message: "Invalid credentials provided."
});

export {
    InvalidEmailError,
    EmailInUseError,
    InternalError,
    InvalidPasswordError,
    InvalidCredentialsError
};
