var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

// 使用 GraphQL schema language 构造一个 schema
var schema = buildSchema(`
  type OutVm{
    dice:Int
    sides:Int
    }
  type Query {
    rollDice(numDice: Int!, numSides: Int):OutVm
    quoteOfTheDay: String
    random: Float!
    rollThreeDice: [Int]
  }
`);

// root 为每个端点入口 API 提供一个解析器
var root = {
    rollDice: function({ numDice, numSides }) {
        return { dice: numDice, sides: numSides };
    },
    quoteOfTheDay: () => {
        return Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within';
    },
    random: () => {
        return Math.random();
    },
    rollThreeDice: () => {
        return [1, 2, 3].map(_ => 1 + Math.floor(Math.random() * 6));
    }
};

var app = express();
app.use(express.static('static'));
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');