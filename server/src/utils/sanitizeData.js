import moment from "moment";

import { InvalidExpenseTitleError, InvalidDateError } from "./errorsList";

//EXPENSES
const expenseTitleSanitize = title => {
    title = title.trim();
    if (title.length < 2) throw new InvalidExpenseTitleError();

    return title;
};

const expenseDateSanitize = date => {
    date = date.trim();
    if (!moment(date).isValid()) throw new InvalidDateError();

    return date;
};

export { expenseTitleSanitize, expenseDateSanitize };
