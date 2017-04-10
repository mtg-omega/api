require('babel-polyfill');

/* eslint-disable import/first */
import { graphql } from 'graphql';
import { log } from 'zweer-utils';

import Schema from './schema';
/* eslint-enable import/first */

function createResponse(statusCode, body) {
  log.debug(`statusCode: ${statusCode}`);
  log.debug(body);

  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS
    },
    body: JSON.stringify(body),
  };
}

// eslint-disable-next-line import/prefer-default-export
export async function handler(event, context, done) {
  log.debug(event);

  const body = JSON.parse(event.body);

  try {
    const result = await graphql(Schema, body.query);

    log.info('Finished successfully');

    done(null, createResponse(200, result));
  } catch (err) {
    log.error('Finished with errors');
    log.debug(err);

    done(null, createResponse(err.responseStatusCode || 500, { message: err.message || 'Internal server error' }));
  }
}
