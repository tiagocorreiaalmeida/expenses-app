import { gql } from "apollo-boost";

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

export { signUp, signIn, deleteUser, updateUser, me };
