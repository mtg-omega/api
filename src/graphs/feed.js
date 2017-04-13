import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';
import ulid from 'ulid';

import { get, scan, put, update } from '../dynamo/feed';
import { getByFeed } from '../dynamo/article';
import { Article } from './article';

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
const feedFieldsArticles = {
  articles: {
    type: new GraphQLList(Article),
    resolve({ id }) {
      return getByFeed(id);
    },
  },
};

export const Feed = new GraphQLObjectType({
  name: 'Feed',
  description: 'A feed with many articles',
  fields: {
    ...feedFieldsId,
    ...feedFieldsTitleNonNull,
    ...feedFields,
    ...feedFieldsArticles,
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
      return scan();
    },
  },

  feed: {
    type: Feed,
    args: {
      id: { type: GraphQLString },
    },
    resolve(_, { id }) {
      return get(id);
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

      return put(feed);
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

      return update(id, feed);
    },
  },
};
