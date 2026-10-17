import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { APIXIS_ENTER_CLIENTS, enterApixisUrl } from "../lib/apixis-world.ts";

test("world helper keeps aidaroosholding and the 1,000 starter Ixis", () => {
  assert.ok(APIXIS_ENTER_CLIENTS.includes("aidaroosholding"));
  assert.ok(APIXIS_ENTER_CLIENTS.includes("pinixis"));
  assert.equal(enterApixisUrl("aidaroosholding"), "https://www.apixis.dev/enter?from=aidaroosholding");
  assert.equal(enterApixisUrl("not-a-client"), "https://www.apixis.dev/enter");
  const source = readFileSync(new URL("../lib/apixis-world.ts", import.meta.url), "utf8");
  assert.match(source, /1,000 starter Ixis/);
  assert.doesNotMatch(source, /200 starter Ixis/);
});
