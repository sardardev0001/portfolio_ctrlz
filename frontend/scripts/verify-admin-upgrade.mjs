import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const cwd = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const container = process.env.QA_CONTAINER;
if (!container || !process.env.BASE_URL) throw new Error("Set QA_CONTAINER and BASE_URL for an isolated QA environment.");
const name = `qa-admin-${randomBytes(5).toString("hex")}`;
const password = randomBytes(32).toString("base64url");
const setup = "import os,sys,json;os.environ.setdefault('DJANGO_SETTINGS_MODULE','config.settings');import django;django.setup();from domains.accounts.models import User;d=json.load(sys.stdin);User.objects.create_user(username=d['name'],password=d['password'],role='owner',is_staff=True)";
const created = spawnSync("docker", ["exec", "-i", container, "python", "-c", setup], { input: JSON.stringify({ name, password }), encoding: "utf8" });
if (created.status !== 0) throw new Error(created.stderr || "Could not create temporary QA account.");
let status = 1;
try {
  const result = spawnSync(process.execPath, ["node_modules/@playwright/test/cli.js", "test", "admin-upgrade.spec.ts", "--reporter=line", ...process.argv.slice(2)], {
    cwd, stdio: "inherit",
    env: { ...process.env, E2E_ADMIN_USERNAME: name, E2E_ADMIN_PASSWORD: password, CTRLZ_QA_WRITE_TESTS: "true" },
  });
  status = result.status ?? 1;
} finally {
  const cleanup = "import os,sys;os.environ.setdefault('DJANGO_SETTINGS_MODULE','config.settings');import django;django.setup();from domains.accounts.models import User;User.objects.filter(username=sys.stdin.read()).delete()";
  const cleaned = spawnSync("docker", ["exec", "-i", container, "python", "-c", cleanup], { input: name, encoding: "utf8" });
  if (cleaned.status !== 0) { process.stderr.write("Temporary QA account cleanup failed.\n"); status = 1; }
}
process.exitCode = status;
