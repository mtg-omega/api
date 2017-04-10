import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
} from 'graphql';
import config from 'config';

import { docClient } from '../aws';

export const feedTable = `${config.get('dynamo.tables.feed')}-${config.get('dynamo.environment')}`;
export const Feed = new GraphQLObjectType({
  name: 'feed',
  description: 'A feed with many articles',
  fields: () => ({
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    link: { type: GraphQLString }, // url
    url: { type: GraphQLString }, // url
    mostRecentUpdateAt: { type: GraphQLString }, // date
    publishedAt: { type: GraphQLString }, // date
    author: { type: GraphQLString },
    language: { type: GraphQLString },
    image: { type: GraphQLString }, // url
    favicon: { type: GraphQLString }, // url
    copyright: { type: GraphQLString },
    generator: { type: GraphQLString },
    categories: { type: new GraphQLList(GraphQLString) }, // string[]
  }),
});

export default {
  feeds: {
    type: new GraphQLList(Feed),
    resolve() {
      return docClient
        .scan({
          TableName: feedTable,
        })
        .promise()
        .then(data => data.Items);
    },
  },

  feed: {
    type: Feed,
    args: {
      id: { type: GraphQLString },
    },
    resolve(_, { id }) {
      return docClient
        .get({
          TableName: feedTable,
          Key: { id },
        })
        .promise()
        .then(data => data.Item);
    },
  },
};
