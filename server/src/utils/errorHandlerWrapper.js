//used to handle uncontrolled errors

import { InternalError } from "./errorsList";

const errorHandlerWrapper = resolver => async (...args) => {
    try {
        return await resolver(...args);
    } catch (err) {
        if (err.path) throw new InternalError();

        throw err;
    }
};

export default errorHandlerWrapper;
