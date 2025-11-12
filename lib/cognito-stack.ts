import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { AuthApi } from "./constructs/auth-api";
import { AppApi } from "./constructs/app-api";

export class CognitoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new UserPool(this, "UserPool", {
      signInAliases: { username: true, email: true },
      selfSignUpEnabled: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const appClient = userPool.addClient("AppClient", {
      authFlows: { userPassword: true },
    });

    new AuthApi(this, "AuthServiceApi", {
      userPoolId: userPool.userPoolId,
      userPoolClientId: appClient.userPoolClientId,
    });

    new AppApi(this, "AppApi", {
      userPoolId: userPool.userPoolId,
      userPoolClientId: appClient.userPoolClientId,
    });
  }
}
