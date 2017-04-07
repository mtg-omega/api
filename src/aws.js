import AWS from 'aws-sdk';
import config from 'config';

export default AWS;

export const docClient = new AWS.DynamoDB.DocumentClient(config.get('aws'));
