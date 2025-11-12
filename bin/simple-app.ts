#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SimpleAppStack } from '../lib/simple-app-stack';

const app = new cdk.App();
new SimpleAppStack(app, 'SimpleAppStack', {
  env: { account: '978045176797', region: 'eu-west-1' },
});