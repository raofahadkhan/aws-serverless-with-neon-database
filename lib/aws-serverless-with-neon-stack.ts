import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigwv2 from "@aws-cdk/aws-apigatewayv2-alpha";
import * as apigwv2_integrations from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class AwsServerlessWithNeonStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { service, stage } = props?.tags!;

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

    const createTableLambda = new lambda.Function(
      this,
      `${service}-${stage}-create-user-table-lambda`,
      {
        functionName: `${service}-${stage}-create-user-table-lambda`,
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "CreateTable.handler",
        code: lambda.Code.fromAsset("lambda"),
        environment: {
          DATABASE_URL:
            "postgresql://raofahadkhan:LQ8rFzmvusw2@ep-empty-cell-32655077.us-east-1.aws.neon.tech/usersdb?sslmode=require",
        },
      }
    );

    const createUserLambda = new lambda.Function(this, `${service}-${stage}-create-user-lambda`, {
      functionName: `${service}-${stage}-create-user-lambda`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "CreateUser.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        DATABASE_URL:
          "postgresql://raofahadkhan:LQ8rFzmvusw2@ep-empty-cell-32655077.us-east-1.aws.neon.tech/usersdb?sslmode=require",
      },
    });

    const getUsersLambda = new lambda.Function(this, `${service}-${stage}-get-users-lambda`, {
      functionName: `${service}-${stage}-get-users-lambda`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "GetUsers.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        DATABASE_URL:
          "postgresql://raofahadkhan:LQ8rFzmvusw2@ep-empty-cell-32655077.us-east-1.aws.neon.tech/usersdb?sslmode=require",
      },
    });

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

    crudUserApi.addRoutes({
      path: "/create-table",
      methods: [apigwv2.HttpMethod.POST],
      integration: createTableLambdaIntegration,
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

    new cdk.CfnOutput(this, `${service}-${stage}-user-api-url`, {
      value: crudUserApi.url!,
    });
  }
}
