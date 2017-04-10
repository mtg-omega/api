import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';
import ulid from 'ulid';
import config from 'config';

import { docClient } from '../aws';

const feedFieldsId = {
  id: { type: new GraphQLNonNull(GraphQLString) },
};
const feedFields = {
  title: { type: new GraphQLNonNull(GraphQLString) },
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
};

export const feedTable = `${config.get('dynamo.tables.feed')}-${config.get('dynamo.environment')}`;

export const Feed = new GraphQLObjectType({
  name: 'Feed',
  description: 'A feed with many articles',
  fields: {
    ...feedFieldsId,
    ...feedFields,
  },
});

export const FeedInput = new GraphQLInputObjectType({
  name: 'FeedInput',
  description: 'The input type for feeds',
  fields: {
    ...feedFields,
  },
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
      feed: { type: FeedInput },
    },
    resolve(_, { feed }) {
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
