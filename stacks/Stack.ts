import { Api, Config, StackContext, Table } from "sst/constructs";

export function Stack({ stack }: StackContext) {
  const table = new Table(stack, "Links", {
    fields: { shortLink: "string", targetLink: "string" },
    primaryIndex: { partitionKey: "shortLink" },
  });
  const SECRET = new Config.Secret(stack, "SECRET");
  const api = new Api(stack, "Api", {
    customDomain: stack.stage === "prod" ? "icssc.link" : `staging-${stack.stage}.icssc.link`,
    defaults: { function: { bind: [table, SECRET] } },
    routes: {
      "GET /{proxy+}": "packages/functions/src/get.main",
      "POST /": "packages/functions/src/post.main",
    },
  });
  stack.addOutputs({ ApiEndpoint: api.customDomainUrl || api.url });
}
