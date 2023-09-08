import { SSTConfig } from "sst";
import { Stack } from "./stacks/Stack";

export default {
  config(_input) {
    return {
      name: "icssc-link",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(Stack);
    if (app.stage !== "prod") {
      app.setDefaultRemovalPolicy("destroy");
    }
  },
} satisfies SSTConfig;
