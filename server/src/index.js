import server from "./server";
import { formatError } from "graphql-yoga";

const port = process.env.PORT || 4000;

const serverOptions = {
    formatError
};

server.start(serverOptions, ({ port }) =>
    console.log(`Server running on port, ${port}`)
);
