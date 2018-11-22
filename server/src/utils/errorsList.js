import { createError } from "apollo-errors";

const InternalError = createError("Internal Error", {
    message: "Something went wrong, please try again later."
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

const InvalidExpenseTitleError = createError("InvalidExpenseTitle", {
    message: "Please provide a expense title with at least 2 characters."
});

const DuplicatedExpenseTitleError = createError("DuplicatedExpenseTitle", {
    message: "You already have an expense with the same title."
});

const InvalidDateError = createError("InvalidDate", {
    message: "Please provide a valid date."
});

const ExpenseNotFoundError = createError("ExpenseNotFound", {
    message: "Expense not found."
});

const UserNotFoundError = createError("UserNotFound", {
    message: "Account not found."
});

export {
    InvalidEmailError,
    EmailInUseError,
    InternalError,
    InvalidPasswordError,
    InvalidCredentialsError,
    InvalidExpenseTitleError,
    DuplicatedExpenseTitleError,
    InvalidDateError,
    ExpenseNotFoundError,
    UserNotFoundError
};
