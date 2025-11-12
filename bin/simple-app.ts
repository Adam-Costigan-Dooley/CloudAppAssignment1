#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SimpleAppStack } from '../lib/simple-app-stack';
import { CognitoStack } from '../lib/cognito-stack';
const app = new cdk.App();
new SimpleAppStack(app, 'SimpleAppStack', {
  env: { account: '978045176797', region: 'eu-west-1' },
});
new CognitoStack(app, 'CognitoStack', {
  env: { account: '978045176797', region: 'eu-west-1' },
});
