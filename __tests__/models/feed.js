import {
  graphql,
  GraphQLObjectType,
  GraphQLInputObjectType,
} from 'graphql';

import Schema from '../../src/schema';
import { Feed, AddFeedInput, EditFeedInput } from '../../src/graphs/feed';
import { table, put, destroy } from '../../src/dynamo/feed';
import { put as putArticle, destroy as destroyArticle } from '../../src/dynamo/article';

describe('Feed', () => {
  const id = 'abcdefg-abcd-abcd-acd-abcdefg';
  const title = 'title-1';

  it('should have a valid table', () => {
    expect(table).toBe('mtg-omega-feed-test');
  });

  it('should be a model', () => {
    expect(Feed).toBeInstanceOf(GraphQLObjectType);
  });

  it('should be input models', () => {
    expect(AddFeedInput).toBeInstanceOf(GraphQLInputObjectType);
    expect(EditFeedInput).toBeInstanceOf(GraphQLInputObjectType);
  });

  describe('Model', () => {
    it('should have the "Feed" type', () => graphql(Schema, '{ __type(name: "Feed") { name fields { name } } }')
      .then(({ data, errors }) => {
        expect(errors).not.toBeDefined();
        expect(data).toBeDefined();

        const type = data.__type; // eslint-disable-line no-underscore-dangle

        expect(type).toBeDefined();
        expect(type.name).toBe('Feed');
        expect(type.fields).toHaveLength(15);

        expect(type.fields).toContainEqual({ name: 'id' });
        expect(type.fields).toContainEqual({ name: 'title' });
        expect(type.fields).toContainEqual({ name: 'description' });
        expect(type.fields).toContainEqual({ name: 'link' });
        expect(type.fields).toContainEqual({ name: 'url' });
        expect(type.fields).toContainEqual({ name: 'mostRecentUpdateAt' });
        expect(type.fields).toContainEqual({ name: 'publishedAt' });
        expect(type.fields).toContainEqual({ name: 'author' });
        expect(type.fields).toContainEqual({ name: 'language' });
        expect(type.fields).toContainEqual({ name: 'image' });
        expect(type.fields).toContainEqual({ name: 'favicon' });
        expect(type.fields).toContainEqual({ name: 'copyright' });
        expect(type.fields).toContainEqual({ name: 'generator' });
        expect(type.fields).toContainEqual({ name: 'categories' });
        expect(type.fields).toContainEqual({ name: 'articles' });
      }));

    it('should have the "FeedInput" type', () => graphql(Schema, '{ __type(name: "AddFeedInput") { name fields { name } } }')
      .then(({ data, errors }) => {
        expect(errors).not.toBeDefined();
        expect(data).toBeDefined();

        const type = data.__type; // eslint-disable-line no-underscore-dangle

        expect(type).toBeDefined();
        expect(type.name).toBe('AddFeedInput');
      }));

    it('should have the "FeedInput" type', () => graphql(Schema, '{ __type(name: "EditFeedInput") { name fields { name } } }')
      .then(({ data, errors }) => {
        expect(errors).not.toBeDefined();
        expect(data).toBeDefined();

        const type = data.__type; // eslint-disable-line no-underscore-dangle

        expect(type).toBeDefined();
        expect(type.name).toBe('EditFeedInput');
      }));
  });

  describe('Instance', () => {
    beforeEach(() => put({ id, title }));
    afterEach(() => destroy(id));

    it('should find a feed', () => graphql(Schema, `{ feed(id: "${id}") { title } }`)
      .then(({ data, errors }) => {
        expect(errors).not.toBeDefined();
        expect(data).toBeDefined();

        const { feed } = data;
        expect(feed).toBeDefined();
        expect(feed.title).toBe(title);
      }));

    it('should not find a feed', () => graphql(Schema, `{ feed(id: "${id}a") { title } }`)
      .then(({ data, errors }) => {
        expect(errors).not.toBeDefined();
        expect(data).toBeDefined();

        const { feed } = data;
        expect(feed).toBeNull();
      }));

    it('should find all the feeds (1)', () => graphql(Schema, '{ feeds { title } }')
      .then(({ data, errors }) => {
        expect(errors).not.toBeDefined();
        expect(data).toBeDefined();

        const { feeds } = data;
        expect(feeds).toHaveLength(1);

        const [feed] = feeds;
        expect(feed.title).toBe(title);
      }));

    describe('Articles', () => {
      const articleId = 'qwerty';
      const articleTitle = 'article';

      beforeEach(() => putArticle({
        id: articleId,
        feedId: id,
        title: articleTitle,
      }));
      afterEach(() => destroyArticle(articleId));

      it('should find the articles of a feed', () => graphql(Schema, `{ feed(id: "${id}") { articles { id title } } }`)
        .then(({ data, errors }) => {
          expect(errors).not.toBeDefined();
          expect(data).toBeDefined();

          const { feed } = data;
          expect(feed).toBeDefined();
          expect(feed.articles).toBeDefined();

          const { articles } = feed;
          expect(articles).toHaveLength(1);

          const [article] = articles;
          expect(article.title).toBe(articleTitle);
        }));
    });

    describe('Mutations', () => {
      const titleNew = 'title new';

      const query1 = 'mutation ($feed: AddFeedInput!) { addFeed(feed: $feed) { id title } }';
      it('should create a feed', () => graphql(Schema, query1, null, null, {
        feed: {
          title: titleNew,
        },
      })
        .then(({ data, errors }) => {
          expect(errors).not.toBeDefined();
          expect(data).toBeDefined();

          const { addFeed: feed } = data;
          expect(feed.id).toBeDefined();
          expect(feed.title).toBe(titleNew);

          return feed.id;
        })
        .then(feedId => destroy(feedId)));

      const query2 = 'mutation ($feed: EditFeedInput!) { editFeed(feed: $feed) { id title } }';
      it('should edit an existing feed', () => graphql(Schema, query2, null, null, {
        feed: {
          id,
          title: titleNew,
        },
      })
        .then(({ data, errors }) => {
          expect(errors).not.toBeDefined();
          expect(data).toBeDefined();

          const { editFeed: feed } = data;
          expect(feed.id).toBe(id);
          expect(feed.title).toBe(titleNew);
        }));
    });
  });
});
