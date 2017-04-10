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
    it('should have the "feed" type', () => graphql(Schema, '{ __type(name: "feed") { name fields { name } } }')
      .then(({ data, errors }) => {
        expect(errors).not.toBeDefined();
        expect(data).toBeDefined();

        const type = data.__type; // eslint-disable-line no-underscore-dangle

        expect(type).toBeDefined();
        expect(type.name).toBe('feed');
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
        expect(data).toBeDefined();
        expect(errors).not.toBeDefined();

        const { feed } = data;
        expect(feed).toBeDefined();
        expect(feed.title).toBe(title);
      }));
  });
});