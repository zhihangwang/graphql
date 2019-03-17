var userData = require("../data");
var _ = require('lodash');

var {
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLEnumType,
    GraphQLList,
    GraphQLSchema,
    GraphQLNonNull,
    GraphQLScalarType
} = require('graphql');

let GraphQLDate = new GraphQLScalarType({
    name: 'Date',
    serialize: parseDate,
    parseValue: parseDate,
    parseLiteral: (ast) => {
        console.log(ast);
        if (ast) {
            return parseDate(ast);
        }
        return null;
    }
});

function parseDate(ast) {
    return new Date(ast);
}

let Role = new GraphQLEnumType({
    name: 'Role',
    values: {
        "Admin": {
            value: 1
        },
        "Normal": {
            value: 2
        }
    }
});

let userModel = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: {
            type: GraphQLInt
        },
        name: {
            type: GraphQLString
        },
        firstName: {
            type: GraphQLString
        },
        lastName: {
            type: GraphQLString
        },
        roleId: {
            type: Role
        },
        createDate: {
            type: GraphQLDate
        }
    }
});

let userList = new GraphQLObjectType({
    name: 'users',
    fields: {
        userList: {
            type: new GraphQLList(userModel),
            args: {},
            resolve: (source, args, context, info) => {
                return userData;
            }
        },
        user: {
            type: userModel,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLInt)
                }
            },
            resolve: (source, args, context, info) => {
                return _.first(userData, x => x.id == args.id);
            }
        },
        addUser: {
            type: userModel,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
                name: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                roleId: {
                    type: new GraphQLNonNull(GraphQLInt)
                }
            },
            resolve: (args) => {

                userData.push(args);
                return args;
            }
        }
    }
});


module.exports =
    new GraphQLSchema({
        query: userList
    });