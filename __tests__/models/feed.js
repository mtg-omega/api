import {
  graphql,
  GraphQLObjectType,
} from 'graphql';

import Schema from '../../src/schema';
import { docClient } from '../../src/aws';
import { feedTable, Feed } from '../../src/models/feed';

describe('Feed', () => {
  it('should have a valid table', () => {
    expect(feedTable).toBe('mtg-omega-feed-test');
  });

  it('should be a model', () => {
    expect(Feed).toBeInstanceOf(GraphQLObjectType);
  });

  describe('Model', () => {
    it('should have the "Feed" type', () => graphql(Schema, '{ __type(name: "Feed") { name fields { name } } }')
      .then(({ data, errors }) => {
        expect(errors).not.toBeDefined();
        expect(data).toBeDefined();

        const type = data.__type; // eslint-disable-line no-underscore-dangle

        expect(type).toBeDefined();
        expect(type.name).toBe('Feed');
        expect(type.fields).toHaveLength(14);

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
      }));

    it('should have the "FeedInput" type', () => graphql(Schema, '{ __type(name: "FeedInput") { name fields { name } } }')
      .then(({ data, errors }) => {
        expect(errors).not.toBeDefined();
        expect(data).toBeDefined();

        const type = data.__type; // eslint-disable-line no-underscore-dangle

        expect(type).toBeDefined();
        expect(type.name).toBe('FeedInput');
      }));
  });

  describe('Instance', () => {
    const id = 'abcdefg-abcd-abcd-acd-abcdefg';
    const title = 'title-1';

    beforeEach(() => docClient.put({
      TableName: feedTable,
      Item: {
        id,
        title,
      },
    }).promise());

    afterEach(() => docClient.delete({
      TableName: feedTable,
      Key: {
        id,
      },
    }).promise());

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
  });

  describe('Mutations', () => {
    const titleNew = 'title new';

    const query1 = 'mutation ($feed: FeedInput!) { createFeed(feed: $feed) { id title } }';
    it('should create a feed', () => graphql(Schema, query1, null, null, {
      feed: {
        title: titleNew,
      },
    })
      .then(({ data, errors }) => {
        expect(errors).not.toBeDefined();
        expect(data).toBeDefined();

        const { createFeed: feed } = data;
        expect(feed.id).toBeDefined();
        expect(feed.title).toBe(titleNew);

        return feed.id;
      })
      .then(id => docClient.delete({
        TableName: feedTable,
        Key: {
          id,
        },
      }).promise()));
  });
});
