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
    GraphQLScalarType,
    GraphQLInterfaceType,
    GraphQLUnionType,
    GraphQLInputObjectType,

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

let userModel = new GraphQLInterfaceType({
    name: 'UserModel',
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
    },
    resolveType: (value) => {
        if (value.employee) {
            return adminUser;
        }
        if (value.leader) {
            return normalUser;
        }
    }
});

let adminUser = new GraphQLObjectType({
    name: "AdminUser",
    interfaces: [userModel],
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
        },
        employee: {
            type: new GraphQLList(GraphQLInt)
        }
    },
    isTypeOf: (obj) => {
        return obj.employee;
    }
});

let normalUser = new GraphQLObjectType({
    name: "NormalUser",
    interfaces: [userModel],
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
        },
        leader: {
            type: GraphQLInt
        }
    },
    isTypeOf: (obj) => {
        return obj.leader;
    }

});

let userUnion = new GraphQLUnionType({
    name: "UserUnion",
    types: [adminUser, normalUser],
    resolveType: (value) => {
        if (value.employee) {
            return adminUser;
        }
        if (value.leader) {
            return normalUser;
        }
    }
});

let userQueryInput = new GraphQLInputObjectType({
    name: "UserQueryInput",
    fields: {
        id: {
            type: GraphQLInt
        },
        name: {
            type: GraphQLString
        }
    }
});

let userQuery = new GraphQLObjectType({
    name: 'UserQuery',
    fields: {
        userList: {
            type: new GraphQLList(userModel),
            args: {
                userQuery: {
                    type: userQueryInput
                }
            },
            resolve: (source, args, context, info) => {
                let result = (_.filter(userData, (x) => {
                    return args.userQuery && args.userQuery.name ? x.name === args.userQuery.name : true
                }));
                return result;
            }
        },
        user: {
            type: userUnion,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLInt)
                }
            },
            resolve: (source, args, context, info) => {
                let result = _.first(_.filter(userData, (x) => { return x.id === args.id }));
                return result;
            }
        }
    }
});

let addUserInput = new GraphQLInputObjectType({
    name: "AddUserInput",
    fields: {
        name: {
            type: new GraphQLNonNull(GraphQLString)
        },
        firstName: {
            type: GraphQLString
        },
        lastName: {
            type: GraphQLString
        },
        roleId: {
            type: new GraphQLNonNull(GraphQLInt)
        }
    }
});

let updateUserInput = new GraphQLInputObjectType({
    name: "UpdateUserInput",
    fields: {
        id: {
            type: new GraphQLNonNull(GraphQLInt)
        },
        name: {
            type: new GraphQLNonNull(GraphQLString)
        }
    }
});

let userMutation = new GraphQLObjectType({
    name: "UserMutation",
    fields: {
        addUser: {
            type: userUnion,
            args: {
                addModel: { type: addUserInput }
            },
            resolve: (source, args, context) => {
                var names = _.split(args.addModel.name, '.');
                let newUser = {
                    id: userData.length + 1,
                    name: args.addModel.name,
                    roleId: args.addModel.roleId,
                    firstName: args.addModel.firstName ? args.addModel.firstName : _.first(names),
                    lastName: args.addModel.lastName ? args.addModel.lastName : _.last(names),
                    createDate: new Date(),
                }
                if (args.addModel.roleId == 1) {
                    newUser.employee = [];
                } else {
                    newUser.leader = 1;
                }
                userData.push(newUser);
                return newUser;
            }
        },
        removeUser: {
            type: GraphQLInt,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLInt)
                }
            },
            resolve: (source, args, context) => {
                userData = _.filter(userData, (x) => { return x.id != args.id });
                return 1;
            }
        },
        updateUserName: {
            type: userUnion,
            args: {
                updateModel: { type: updateUserInput }
            },
            resolve: (source, args, context) => {
                let updateUser = _.first(_.filter(userData, (x) => { return x.id == args.updateModel.id }));
                updateUser.name = args.updateModel.name;
                var names = _.split(args.updateModel.name, '.');
                updateUser.firstName = _.first(names);
                updateUser.lastName = _.last(names);
                return updateUser;
            }
        }
    }
});

module.exports =
    new GraphQLSchema({
        query: userQuery,
        mutation: userMutation
    });