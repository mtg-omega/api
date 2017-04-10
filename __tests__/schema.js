import Schema from '../src/schema';

describe('Schema', () => {
  it('should be a GraphQL schema', () => {
    expect(Schema).toBeDefined();

    expect(Schema._queryType).toBeDefined(); // eslint-disable-line no-underscore-dangle
    expect(Schema._directives).toBeDefined(); // eslint-disable-line no-underscore-dangle
    expect(Schema._typeMap).toBeDefined(); // eslint-disable-line no-underscore-dangle
  });
});
