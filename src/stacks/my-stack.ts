import { join } from "node:path";
import { Fn, TerraformStack } from "cdktf";
import type { Construct } from "constructs";
import { DataCloudflareAccounts } from "../../.gen/providers/cloudflare/data-cloudflare-accounts";
import { CloudflareProvider } from "../../.gen/providers/cloudflare/provider";
import { WorkersScript } from "../../.gen/providers/cloudflare/workers-script";
import { WorkersScriptSubdomain } from "../../.gen/providers/cloudflare/workers-script-subdomain";

export class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    //==============================================================================
    // Cloudflare Configuration
    //==============================================================================

    new CloudflareProvider(this, "CloudflareProvider");

    const cfAccounts = new DataCloudflareAccounts(this, "CloudflareAccounts", {
      direction: "asc",
      maxItems: 1,
    });

    const mainAccountId = cfAccounts.result.get(0).id;

    //==============================================================================
    // Cloudflare Workers
    //==============================================================================

    const playwrightWorker = new WorkersScript(this, "PlaywrightWorker", {
      accountId: mainAccountId,
      scriptName: "playwright-worker",
      content: Fn.sensitive(Fn.file(join(__dirname, "../functions/playwright", "index.js"))),
      mainModule: "index.js",
      compatibilityFlags: ["nodejs_compat_v2"],
      compatibilityDate: "2025-06-30",
      bindings: [
        {
          type: "browser",
          name: "MYBROWSER",
        },
      ],
    });

    new WorkersScriptSubdomain(this, "PlaywrightWorkerEnableDevSubdomain", {
      accountId: mainAccountId,
      scriptName: playwrightWorker.scriptName,
      enabled: true,
      previewsEnabled: true,
    });
  }
}
