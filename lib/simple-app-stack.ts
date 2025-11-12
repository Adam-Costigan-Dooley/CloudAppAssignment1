import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as custom from "aws-cdk-lib/custom-resources";
import { generateBatch } from "../shared/util";
import { movies, actors, casts, awards } from "../seed/movies";
import { Construct } from "constructs";

export class SimpleAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const appTable = new dynamodb.Table(this, "AppTable", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "Media", 
    });

    const common = {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      handler: "handler",
      environment: {
        TABLE_NAME: appTable.tableName,
        REGION: cdk.Aws.REGION,
      },
    };

    const getMovieFn = new lambdanode.NodejsFunction(this, "GetMovieFn", {
      ...common,
      entry: `${__dirname}/../lambdas/getMovie.ts`,
    });
    const getMovieActorsFn = new lambdanode.NodejsFunction(
      this,
      "GetMovieActorsFn",
      { ...common, entry: `${__dirname}/../lambdas/getMovieActors.ts` }
    );
    const getMovieCastMemberFn = new lambdanode.NodejsFunction(
      this,
      "GetMovieCastMemberFn",
      { ...common, entry: `${__dirname}/../lambdas/getMovieCastMember.ts` }
    );
    const getAwardsFn = new lambdanode.NodejsFunction(this, "GetAwardsFn", {
      ...common,
      entry: `${__dirname}/../lambdas/getAwards.ts`,
    });
    const addMovieFn = new lambdanode.NodejsFunction(this, "AddMovieFn", {
      ...common,
      entry: `${__dirname}/../lambdas/addMovie.ts`,
    });
    const deleteMovieFn = new lambdanode.NodejsFunction(this, "DeleteMovieFn", {
      ...common,
      entry: `${__dirname}/../lambdas/deleteMovie.ts`,
    });

    appTable.grantReadData(getMovieFn);
    appTable.grantReadData(getMovieActorsFn);
    appTable.grantReadData(getMovieCastMemberFn);
    appTable.grantReadData(getAwardsFn);
    appTable.grantReadWriteData(addMovieFn);
    appTable.grantReadWriteData(deleteMovieFn);

    const api = new apigw.RestApi(this, "MoviesApi", {
      description: "Movies Service",
      deployOptions: { stageName: "prod" },
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
      },
    });

    const adminApiKey = new apigw.ApiKey(this, "AdminApiKey", {
      description: "Administrator key for POST/PUT/DELETE on Movies API",
      enabled: true,
    });

    const adminPlan = new apigw.UsagePlan(this, "AdminUsagePlan", {
      name: "MoviesAdminPlan",
      throttle: { rateLimit: 10, burstLimit: 2 },
      quota: { limit: 10000, period: apigw.Period.DAY },
    });

    adminPlan.addApiKey(adminApiKey);
    adminPlan.addApiStage({
      stage: api.deploymentStage,
    });

    const moviesRes = api.root.addResource("movies");
    const movieIdRes = moviesRes.addResource("{movieId}");
    movieIdRes.addMethod("GET", new apigw.LambdaIntegration(getMovieFn));

    const actorsRes = movieIdRes.addResource("actors");
    actorsRes.addMethod(
      "GET",
      new apigw.LambdaIntegration(getMovieActorsFn)
    );

    const actorIdRes = actorsRes.addResource("{actorId}");
    actorIdRes.addMethod(
      "GET",
      new apigw.LambdaIntegration(getMovieCastMemberFn)
    );

    moviesRes.addMethod("POST", new apigw.LambdaIntegration(addMovieFn), {
      apiKeyRequired: true,
    });
    movieIdRes.addMethod("DELETE", new apigw.LambdaIntegration(deleteMovieFn), {
      apiKeyRequired: true,
    });
    const awardsRes = api.root.addResource("awards");
    awardsRes.addMethod("GET", new apigw.LambdaIntegration(getAwardsFn));

    new custom.AwsCustomResource(this, "SeedAll", {
      onCreate: {
        service: "DynamoDB",
        action: "batchWriteItem",
        parameters: {
          RequestItems: {
            [appTable.tableName]: [
              ...generateBatch(movies),
              ...generateBatch(actors),
              ...generateBatch(casts),
              ...generateBatch(awards),
            ],
          },
        },
        physicalResourceId: custom.PhysicalResourceId.of("seed-all-once"),
      },
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [appTable.tableArn],
      }),
    });
  }
}
