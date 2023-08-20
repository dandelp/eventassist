import { EventFunction } from './types'

export const createLambdaCode = ({
    functionName,
    returnType,
    filePath,
}: {
    functionName: string
    returnType: string
    filePath: string
}) => {
    return `
    const AWSXRay = require('aws-xray-sdk');
    const AWS = AWSXRay.captureAWS(require('aws-sdk'));
    import {${functionName}} from '${filePath}'
const eventBridge = new AWS.EventBridge();

exports.handler = async (event) => {

    const result = await ${functionName}(event.detail);
    if(!result) return
  try {
    const params = {
      Source: '${functionName}',
      DetailType: '${returnType}',
      Detail: JSON.stringify(result),
    };

    await eventBridge.putEvents({ Entries: [params] }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify('Event sent successfully'),
    };
  } catch (error) {
    console.error('Error sending event:', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Error sending event'),
    };
  }
};
`
}
