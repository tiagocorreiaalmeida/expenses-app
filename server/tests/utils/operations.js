import { gql } from "apollo-boost";

//USERS
const signUp = gql`
    mutation($data: SignupUserInput!) {
        signUp(data: $data) {
            token
            user {
                id
                name
                email
                password
                createdAt
            }
        }
    }
`;

const signIn = gql`
    mutation($email: String!, $password: String!) {
        signIn(email: $email, password: $password) {
            token
            user {
                id
                name
                email
                password
                createdAt
            }
        }
    }
`;

const updateUser = gql`
    mutation($data: UpdateUserInput!) {
        updateUser(data: $data) {
            id
            name
            email
            password
            createdAt
        }
    }
`;

const deleteUser = gql`
    mutation {
        deleteUser {
            id
            name
            email
            password
            createdAt
        }
    }
`;

const me = gql`
    query {
        me {
            id
            name
            email
            password
            createdAt
            expenses {
                id
            }
        }
    }
`;

//EXPENSES

const createExpense = gql`
    mutation($data: createExpenseInput!) {
        createExpense(data: $data) {
            id
            title
            description
            amount
            date
            owner {
                id
            }
        }
    }
`;

const updateExpense = gql`
    mutation($id: ID!, $data: updateExpenseInput!) {
        updateExpense(id: $id, data: $data) {
            id
            title
            description
            amount
            date
            owner {
                id
            }
        }
    }
`;

const deleteExpense = gql`
    mutation($id: ID!) {
        deleteExpense(id: $id) {
            id
        }
    }
`;

export {
    signUp,
    signIn,
    deleteUser,
    updateUser,
    me,
    createExpense,
    updateExpense,
    deleteExpense
};
