import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';
import ulid from 'ulid';

import { get, getByFeed, scan, put, update } from '../dynamo/article';

const articleFieldsId = {
  id: { type: new GraphQLNonNull(GraphQLString) },
};
const articleFieldsFeedId = {
  feedId: { type: GraphQLString },
};
const articleFieldsFeedIdNonNull = {
  feedId: { type: new GraphQLNonNull(GraphQLString) },
};
const articleFieldsTitle = {
  title: { type: GraphQLString },
};
const articleFieldsTitleNonNull = {
  title: { type: new GraphQLNonNull(GraphQLString) },
};
const articleFields = {
  description: { type: GraphQLString },
  summary: { type: GraphQLString },
  link: { type: GraphQLString }, // url
  originalLink: { type: GraphQLString }, // url
  permalink: { type: GraphQLString }, // url
  articleUpdatedAt: { type: GraphQLString }, // date
  articlePublishedAt: { type: GraphQLString }, // date
  author: { type: GraphQLString },
  guid: { type: GraphQLString }, // unique
  comments: { type: GraphQLString }, // url
  image: { type: GraphQLString }, // url
  categories: { type: new GraphQLList(GraphQLString) }, // string[]
};

export const Article = new GraphQLObjectType({
  name: 'Article',
  description: 'An article of a feed',
  fields: {
    ...articleFieldsId,
    ...articleFieldsFeedIdNonNull,
    ...articleFieldsTitleNonNull,
    ...articleFields,
  },
});

export const AddArticleInput = new GraphQLInputObjectType({
  name: 'AddArticleInput',
  description: 'The input type to add a new article',
  fields: {
    ...articleFieldsFeedIdNonNull,
    ...articleFieldsTitleNonNull,
    ...articleFields,
  },
});

export const EditArticleInput = new GraphQLInputObjectType({
  name: 'EditArticleInput',
  description: 'The input type to edit an existing article',
  fields: {
    ...articleFieldsId,
    ...articleFieldsFeedId,
    ...articleFieldsTitle,
    ...articleFields,
  },
});

export const queryFields = {
  articles: {
    type: new GraphQLList(Article),
    args: {
      feedId: { type: GraphQLString },
    },
    resolve(_, { feedId }) {
      if (feedId) {
        return getByFeed(feedId);
      }

      return scan();
    },
  },

  article: {
    type: Article,
    args: {
      id: { type: GraphQLString },
    },
    resolve(_, { id }) {
      return get(id);
    },
  },
};

export const mutations = {
  addArticle: {
    type: Article,
    description: 'Create a new Article',
    args: {
      article: { type: AddArticleInput },
    },
    resolve(_, { article }) {
      article.id = ulid(); // eslint-disable-line no-param-reassign

      return put(article);
    },
  },

  editArticle: {
    type: Article,
    description: 'Edit an existing Article',
    args: {
      article: { type: EditArticleInput },
    },
    resolve(_, { article }) {
      const id = article.id;

      delete article.id; // eslint-disable-line no-param-reassign

      return update(id, article);
    },
  },
};
