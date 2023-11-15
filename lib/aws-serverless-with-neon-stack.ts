import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigwv2 from "@aws-cdk/aws-apigatewayv2-alpha";
import * as apigwv2_integrations from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class AwsServerlessWithNeonStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const createTableLambda = new lambda.Function(this, `create-table-user-into-neon-lambda`, {
      functionName: `create-table-user-into-neon-lambda`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "CreateTable.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        DATABASE_URL:
          "postgresql://raofahadkhan:LQ8rFzmvusw2@ep-empty-cell-32655077.us-east-1.aws.neon.tech/usersdb?sslmode=require",
      },
    });

    const createUserLambda = new lambda.Function(this, `create-user-lambda`, {
      functionName: `create-user-lambda`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "CreateUser.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        DATABASE_URL:
          "postgresql://raofahadkhan:LQ8rFzmvusw2@ep-empty-cell-32655077.us-east-1.aws.neon.tech/usersdb?sslmode=require",
      },
    });

    const getUsersLambda = new lambda.Function(this, `get-users-lambda`, {
      functionName: `get-users-lambda`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "GetUsers.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        DATABASE_URL:
          "postgresql://raofahadkhan:LQ8rFzmvusw2@ep-empty-cell-32655077.us-east-1.aws.neon.tech/usersdb?sslmode=require",
      },
    });
  }
}
