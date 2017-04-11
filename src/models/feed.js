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
const feedFieldsTitle = {
  title: { type: GraphQLString },
};
const feedFieldsTitleNonNull = {
  title: { type: new GraphQLNonNull(GraphQLString) },
};
const feedFields = {
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
    ...feedFieldsTitleNonNull,
    ...feedFields,
  },
});

export const AddFeedInput = new GraphQLInputObjectType({
  name: 'AddFeedInput',
  description: 'The input type to add a new feed',
  fields: {
    ...feedFieldsTitleNonNull,
    ...feedFields,
  },
});

export const EditFeedInput = new GraphQLInputObjectType({
  name: 'EditFeedInput',
  description: 'The input type to edit existing feed',
  fields: {
    ...feedFieldsId,
    ...feedFieldsTitle,
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
  addFeed: {
    type: Feed,
    description: 'Create a new feed',
    args: {
      feed: { type: AddFeedInput },
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

  editFeed: {
    type: Feed,
    description: 'Edit an existing feed',
    args: {
      feed: { type: EditFeedInput },
    },
    resolve(_, { feed }) {
      const id = feed.id;

      delete feed.id; // eslint-disable-line no-param-reassign
      const ExpressionAttributeValues = {};

      const updates = Object.keys(feed)
        .map((key) => {
          ExpressionAttributeValues[`:${key}`] = feed[key];

          return `${key} = :${key}`;
        });
      const UpdateExpression = `SET ${updates.join(', ')}`;

      return docClient
        .update({
          TableName: feedTable,
          Key: { id },
          UpdateExpression,
          ExpressionAttributeValues,
        })
        .promise()
        .then(() => docClient
          .get({
            TableName: feedTable,
            Key: { id },
          })
          .promise())
        .then(data => data.Item);
    },
  },
};
