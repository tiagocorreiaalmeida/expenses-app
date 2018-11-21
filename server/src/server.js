import "@babel/polyfill/noConflict";
import { GraphQLServer, formatError } from "graphql-yoga";

import prisma from "./prisma";
import { resolvers, fragmentReplacements } from "./resolvers/index";

const server = new GraphQLServer({
    typeDefs: "./src/schema.graphql",
    resolvers,
    context: req => {
        return {
            prisma,
            req
        };
    },
    fragmentReplacements
});

export const serverOptions = {
    formatError
};

export default server;
