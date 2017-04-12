import config from 'config';

import { docClient } from '../aws';

export const table = `${config.get('dynamo.tables.article')}-${config.get('dynamo.environment')}`;

export function get(id) {
  return docClient
    .get({
      TableName: table,
      Key: { id },
    })
    .promise()
    .then(data => data.Item);
}

export function getByFeed(feedId) {
  return docClient
    .get({
      TableName: table,
      Key: { feedId },
    })
    .promise()
    .then(data => data.Items);
}

export function scan() {
  return docClient
    .scan({
      TableName: table,
    })
    .promise()
    .then(data => data.Items);
}

export function put(article) {
  return docClient
    .put({
      TableName: table,
      Item: article,
    })
    .promise()
    .then(() => article);
}

export function update(id, article) {
  const ExpressionAttributeValues = {};

  const updates = Object.keys(article)
    .map((key) => {
      ExpressionAttributeValues[`:${key}`] = article[key];

      return `${key} = :${key}`;
    });
  const UpdateExpression = `SET ${updates.join(', ')}`;

  return docClient
    .update({
      TableName: table,
      Key: { id },
      UpdateExpression,
      ExpressionAttributeValues,
    })
    .promise()
    .then(() => get(id));
}

export function destroy(id) {
  return docClient
    .delete({
      TableName: table,
      Key: { id },
    })
    .promise();
}
