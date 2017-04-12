import {
  graphql,
  GraphQLObjectType,
  GraphQLInputObjectType,
} from 'graphql';

import Schema from '../../src/schema';
import { Article, AddArticleInput, EditArticleInput } from '../../src/graphs/article';
import { table, put, destroy } from '../../src/dynamo/article';

describe('Article', () => {
  const id = 'abcdefg-abcd-abcd-acd-abcdefg';
  const feedId = 'tuvwxyz-wxyz-wxyz-tuvwxyz';
  const title = 'title-1';

  it('should have a valid table', () => {
    expect(table).toBe('mtg-omega-article-test');
  });

  it('should be a model', () => {
    expect(Article).toBeInstanceOf(GraphQLObjectType);
  });

  it('should be input models', () => {
    expect(AddArticleInput).toBeInstanceOf(GraphQLInputObjectType);
    expect(EditArticleInput).toBeInstanceOf(GraphQLInputObjectType);
  });

  describe('Model', () => {
    it('should have the "Article" type', () => graphql(Schema, '{ __type(name: "Article") { name fields { name } } }')
      .then(({ data, errors }) => {
        expect(errors).not.toBeDefined();
        expect(data).toBeDefined();

        const type = data.__type; // eslint-disable-line no-underscore-dangle

        expect(type).toBeDefined();
        expect(type.name).toBe('Article');
        expect(type.fields).toHaveLength(15);

        expect(type.fields).toContainEqual({ name: 'id' });
        expect(type.fields).toContainEqual({ name: 'feedId' });
        expect(type.fields).toContainEqual({ name: 'title' });
        expect(type.fields).toContainEqual({ name: 'description' });
        expect(type.fields).toContainEqual({ name: 'summary' });
        expect(type.fields).toContainEqual({ name: 'link' });
        expect(type.fields).toContainEqual({ name: 'originalLink' });
        expect(type.fields).toContainEqual({ name: 'permalink' });
        expect(type.fields).toContainEqual({ name: 'articleUpdatedAt' });
        expect(type.fields).toContainEqual({ name: 'articlePublishedAt' });
        expect(type.fields).toContainEqual({ name: 'author' });
        expect(type.fields).toContainEqual({ name: 'guid' });
        expect(type.fields).toContainEqual({ name: 'comments' });
        expect(type.fields).toContainEqual({ name: 'image' });
        expect(type.fields).toContainEqual({ name: 'categories' });
      }));

    it('should have the "AddArticleInput" type', () => graphql(Schema, '{ __type(name: "AddArticleInput") { name fields { name } } }')
      .then(({ data, errors }) => {
        expect(errors).not.toBeDefined();
        expect(data).toBeDefined();

        const type = data.__type; // eslint-disable-line no-underscore-dangle

        expect(type).toBeDefined();
        expect(type.name).toBe('AddArticleInput');
      }));

    it('should have the "EditArticleInput" type', () => graphql(Schema, '{ __type(name: "EditArticleInput") { name fields { name } } }')
      .then(({ data, errors }) => {
        expect(errors).not.toBeDefined();
        expect(data).toBeDefined();

        const type = data.__type; // eslint-disable-line no-underscore-dangle

        expect(type).toBeDefined();
        expect(type.name).toBe('EditArticleInput');
      }));
  });

  describe('Instance', () => {
    beforeEach(() => put({ id, feedId, title }));
    afterEach(() => destroy(id));

    it('should find an article', () => graphql(Schema, `{ article(id: "${id}") { feedId title } }`)
      .then(({ data, errors }) => {
        expect(errors).not.toBeDefined();
        expect(data).toBeDefined();

        const { article } = data;
        expect(article).toBeDefined();
        expect(article.feedId).toBe(feedId);
        expect(article.title).toBe(title);
      }));

    it('should not find an article', () => graphql(Schema, `{ article(id: "${id}a") { title } }`)
      .then(({ data, errors }) => {
        expect(errors).not.toBeDefined();
        expect(data).toBeDefined();

        const { article } = data;
        expect(article).toBeNull();
      }));

    it('should find all the articles (1)', () => graphql(Schema, '{ articles { title } }')
      .then(({ data, errors }) => {
        expect(errors).not.toBeDefined();
        expect(data).toBeDefined();

        const { articles } = data;
        expect(articles).toHaveLength(1);

        const [article] = articles;
        expect(article.title).toBe(title);
      }));

    describe('Mutations', () => {
      const titleNew = 'title new';

      const query1 = 'mutation ($article: AddArticleInput!) { addArticle(article: $article) { id feedId title } }';
      it('should create an article', () => graphql(Schema, query1, null, null, {
        article: {
          feedId,
          title: titleNew,
        },
      })
        .then(({ data, errors }) => {
          expect(errors).not.toBeDefined();
          expect(data).toBeDefined();

          const { addArticle: article } = data;
          expect(article.id).toBeDefined();
          expect(article.feedId).toBe(feedId);
          expect(article.title).toBe(titleNew);

          return article.id;
        })
        .then(articleId => destroy(articleId)));

      const query2 = 'mutation ($article: EditArticleInput!) { editArticle(article: $article) { id feedId title } }';
      it('should edit an existing feed', () => graphql(Schema, query2, null, null, {
        article: {
          id,
          title: titleNew,
        },
      })
        .then(({ data, errors }) => {
          expect(errors).not.toBeDefined();
          expect(data).toBeDefined();

          const { editArticle: article } = data;
          expect(article.id).toBe(id);
          expect(article.feedId).toBe(feedId);
          expect(article.title).toBe(titleNew);
        }));
    });
  });
});
