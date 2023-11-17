import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigwv2 from "@aws-cdk/aws-apigatewayv2-alpha";
import * as apigwv2_integrations from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as authorizers from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class AwsServerlessWithNeonStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { service, stage } = props?.tags!;

    // =========================================
    // Create http api for crud Operations
    // =========================================

    const crudUserApi = new apigwv2.HttpApi(this, `${service}-${stage}-users-api`, {
      apiName: `${service}-${stage}`,
      description: "This api is responsible for crud operation of users table",
      corsPreflight: {
        allowHeaders: ["Content-Type"],
        allowMethods: [apigwv2.CorsHttpMethod.POST],
        allowCredentials: false,
        allowOrigins: ["*"],
      },
    });

    // ==========================================================
    // Created Lambda Authorizer Function For Create Table Lambda
    // ==========================================================

    const createTableLambdaAuthorizer = new lambda.Function(
      this,
      `${service}-${stage}-create-table-lambda-authorizer`,
      {
        functionName: `${service}-${stage}-create-table-lambda-authorizer`,
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "LambdaAuthorizer.handler",
        code: lambda.Code.fromAsset("lambda"),
      }
    );

    // ========================================================
    // Created Lambda Functions for Crud Operations
    // ========================================================

    const createTableLambda = new lambda.Function(
      this,
      `${service}-${stage}-create-user-table-lambda`,
      {
        functionName: `${service}-${stage}-create-user-table-lambda`,
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "CreateUsersTable.handler",
        code: lambda.Code.fromAsset("lambda"),
        environment: {
          DATABASE_URL: "your-database-url",
        },
      }
    );

    const createUserLambda = new lambda.Function(this, `${service}-${stage}-create-user-lambda`, {
      functionName: `${service}-${stage}-create-user-lambda`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "CreateUser.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        DATABASE_URL: "your-database-url",
      },
    });

    const getUsersLambda = new lambda.Function(this, `${service}-${stage}-get-users-lambda`, {
      functionName: `${service}-${stage}-get-users-lambda`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "GetUsers.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        DATABASE_URL: "your-database-url",
      },
    });

    // =================================================
    // Created Lambda Authorizer for Create Table Lambda
    // =================================================

    const lambdaAuthorizer = new authorizers.HttpLambdaAuthorizer(
      `${service}-${stage}-lambda-authorizer`,
      createTableLambdaAuthorizer,
      { responseTypes: [authorizers.HttpLambdaResponseType.SIMPLE] }
    );
    // ===========================================================
    // Created Lambda Function Integrations With Api Gateway Alpha
    // ===========================================================

    const createTableLambdaIntegration = new apigwv2_integrations.HttpLambdaIntegration(
      `${service}-${stage}-create-user-table-lambda-integration`,
      createTableLambda
    );

    const createUserLambdaIntegration = new apigwv2_integrations.HttpLambdaIntegration(
      `${service}-${stage}-create-user-lambda-integration`,
      createUserLambda
    );

    const getUsersLambdaIntegration = new apigwv2_integrations.HttpLambdaIntegration(
      `${service}-${stage}-get-users-lambda-integration`,
      getUsersLambda
    );
    // ==================================================================
    // Created Routes For Lambda Funtions By Which they will be Triggered
    // ==================================================================

    crudUserApi.addRoutes({
      path: "/create-table",
      methods: [apigwv2.HttpMethod.POST],
      integration: createTableLambdaIntegration,
      authorizer: lambdaAuthorizer,
    });

    crudUserApi.addRoutes({
      path: "/create-user",
      methods: [apigwv2.HttpMethod.POST],
      integration: createUserLambdaIntegration,
    });

    crudUserApi.addRoutes({
      path: "/get-users",
      methods: [apigwv2.HttpMethod.POST],
      integration: getUsersLambdaIntegration,
    });

    // =============================================================
    // Output Statement for Printing the Api Gateway Url On Terminal
    // =============================================================

    new cdk.CfnOutput(this, `${service}-${stage}-user-api-url`, {
      value: crudUserApi.url!,
    });
  }
}
