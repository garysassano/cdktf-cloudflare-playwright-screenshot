import { App } from "cdktf";
import { MyStack } from "./stacks/my-stack";

const app = new App();

new MyStack(app, "cdktf-cloudflare-playwright-screenshot-dev");

app.synth();
