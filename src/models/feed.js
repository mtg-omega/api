import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';
import ulid from 'ulid';
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

export const queryFields = {
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

export const mutations = {
  createFeed: {
    type: Feed,
    description: 'Create a new feed',
    args: {
      title: { type: new GraphQLNonNull(GraphQLString) },
      description: { type: GraphQLString },
      link: { type: GraphQLString },
      url: { type: GraphQLString },
      mostRecentUpdateAt: { type: GraphQLString },
      publishedAt: { type: GraphQLString },
      author: { type: GraphQLString },
      language: { type: GraphQLString },
      image: { type: GraphQLString },
      favicon: { type: GraphQLString },
      copyright: { type: GraphQLString },
      generator: { type: GraphQLString },
      categories: { type: GraphQLString },
    },
    resolve(_, feed) {
      feed.id = ulid(); // eslint-disable-line no-param-reassign

      return docClient
        .put({
          TableName: feedTable,
          Item: feed,
        })
        .promise()
        .then(() => feed);
    },
  },
};
