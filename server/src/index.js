import server, { serverOptions } from "./server";

const port = process.env.PORT || 4000;

server.start(serverOptions, ({ port }) =>
    console.log(`Server running on port, ${port}`)
);
