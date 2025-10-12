import type { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import serverless from 'serverless-http';
import app from '../../src/api';

// Create the serverless handler
const serverlessHandler = serverless(app);

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Use serverless-http to handle the Express app
    const result = await serverlessHandler(event, context);
    return result as HandlerResponse;
  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
