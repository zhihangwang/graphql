const express = require('express');
const expressGraphql = require('express-graphql');
const graphql = require("graphql");

const app = express();

const schema = require('./graphql/schema');
app.use('/graphql', expressGraphql({
    schema,
    graphiql: true
}));

app.get('/', (req, res) => res.end('index'));

app.listen(8000, (err) => {
    if (err) { throw new Error(err); }
    console.log('8000 server started.');
});