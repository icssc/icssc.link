import { Api, StackContext, Table } from "sst/constructs";

export function Stack({ stack }: StackContext) {
  const table = new Table(stack, "Links", {
    fields: { shortLink: "string", targetLink: "string" },
    primaryIndex: { partitionKey: "shortLink" },
  });
  const api = new Api(stack, "Api", {
    customDomain: stack.stage === "prod" ? "icssc.link" : `staging-${stack.stage}.icssc.link`,
    defaults: { function: { bind: [table] } },
    routes: { "GET /{proxy+}": "packages/functions/src/lambda.main" },
  });
  stack.addOutputs({ ApiEndpoint: api.customDomainUrl || api.url });
}
