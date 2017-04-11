import config from 'config';

import { docClient } from '../aws';

export const table = `${config.get('dynamo.tables.feed')}-${config.get('dynamo.environment')}`;

export function get(id) {
  return docClient
    .get({
      TableName: table,
      Key: { id },
    })
    .promise()
    .then(data => data.Item);
}

export function scan() {
  return docClient
    .scan({
      TableName: table,
    })
    .promise()
    .then(data => data.Items);
}

export function put(feed) {
  return docClient
    .put({
      TableName: table,
      Item: feed,
    })
    .promise()
    .then(() => feed);
}

export function update(id, feed) {
  const ExpressionAttributeValues = {};

  const updates = Object.keys(feed)
    .map((key) => {
      ExpressionAttributeValues[`:${key}`] = feed[key];

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
