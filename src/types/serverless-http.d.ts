declare module 'serverless-http' {
  interface AWSLambdaEvent {
    httpMethod: string;
    path: string;
    headers: { [key: string]: string };
    body?: string;
    queryStringParameters?: { [key: string]: string };
    pathParameters?: { [key: string]: string };
  }

  interface AWSLambdaContext {
    requestId: string;
    functionName: string;
    functionVersion: string;
    invokedFunctionArn: string;
    memoryLimitInMB: string;
    remainingTimeInMillis: number;
    logGroupName: string;
    logStreamName: string;
    getRemainingTimeInMillis(): number;
  }

  interface ExpressApp {
    [key: string]: unknown;
  }

  interface ServerlessHandler {
    (event: AWSLambdaEvent, context: AWSLambdaContext): Promise<{
      statusCode: number;
      headers?: { [key: string]: string };
      body: string;
    }>;
  }
  
  function serverless(app: ExpressApp): ServerlessHandler;
  export = serverless;
}
