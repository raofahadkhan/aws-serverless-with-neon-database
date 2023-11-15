#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AwsServerlessWithNeonStack } from "../lib/aws-serverless-with-neon-stack";

const app = new cdk.App();
const service = "aws-serverless-with-neon";
let stage;

stage = "m";
new AwsServerlessWithNeonStack(app, `${service}-${stage}`, {
  tags: {
    service,
    stage,
  },
});

stage = "d";
new AwsServerlessWithNeonStack(app, `${service}-${stage}`, {
  tags: {
    service,
    stage,
  },
});
