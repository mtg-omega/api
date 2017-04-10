import fs from 'fs';
import path from 'path';
import { GraphQLObjectType, GraphQLSchema } from 'graphql';

const queryFields = {};
const mutations = {};

const dirname = 'models';
const dirpath = path.join(__dirname, dirname);

fs.readdirSync(dirpath)
  .filter(filename => filename.substr(-3) === '.js' && filename !== 'index.js')
  .forEach((filename) => {
    const tmpFields = require(`./${dirname}/${filename}`); // eslint-disable-line global-require, import/no-dynamic-require

    Object.assign(queryFields, tmpFields.queryFields || {});
    Object.assign(mutations, tmpFields.mutations || {});
  });

const Query = new GraphQLObjectType({
  name: 'MtgOmegaSchema',
  description: 'The root of the Mtg Omega schema',
  fields: queryFields,
});

const Mutation = new GraphQLObjectType({
  name: 'MtgOmegaMutation',
  description: 'The mutations for the Mth Omega schema',
  fields: mutations,
});

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

export default Schema;
