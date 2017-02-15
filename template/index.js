import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { createServer } from 'http';
import bodyParser from 'body-parser';
import { makeExecutableSchema } from 'graphql-tools';
import { MongoClient } from 'mongodb';
import cors from 'cors';

import typeDefs from './schema';
import resolvers from './resolvers';
import addModelsToContext from './model';

const schema = makeExecutableSchema({ typeDefs, resolvers });

const {
  PORT = 3000,
  MONGO_URL = `mongodb://localhost:27017/database`,
} = process.env;

async function startServer() {
  const db = await MongoClient.connect(MONGO_URL);
  const context = addModelsToContext({ db });

  const app = express().use('*', cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use('/graphql', graphqlExpress((req) => {
    const query = req.query.query || req.body.query;
    if (query && query.length > 2000) {
      // None of our app's queries are this long
      // Probably indicates someone trying to send an overly expensive query
      throw new Error('Query too large.');
    }

    return {
      schema,
      context: Object.assign({}, context),
      debug: true,
      formatError(e) { console.log(e) },
    };
  }));

  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
  }));

  app.listen(PORT, () => console.log(
    `GraphQL server launched, visit http://localhost:${PORT}/graphiql`
  ));
}

startServer()
  .then(() => {
    console.log('All systems go');
  })
  .catch((e) => {
    console.error('Uncaught error in startup');
    console.error(e);
    console.trace(e);
  });
