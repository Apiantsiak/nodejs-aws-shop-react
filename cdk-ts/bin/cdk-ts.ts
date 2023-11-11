#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkS3CloudfrontStack } from '../lib/cdk-ts-stack';


const app = new cdk.App();

new CdkS3CloudfrontStack(app, 'CdkS3CloudfrontStack', {
  env: { account: '731771545920', region: 'us-east-1' },
});

app.synth();