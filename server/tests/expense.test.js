import { expect } from "chai";
import ApolloBoost, { gql } from "apollo-boost";

import server from "../src/index";
const client = new ApolloBoost({
    uri: "http://localhost:4000"
});

describe("#Expense", () => {});
