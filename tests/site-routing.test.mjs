import test from "node:test";
import assert from "node:assert/strict";
import { parseSiteRoute } from "../site/assets/route-map.js";

test("root and Home layouts resolve to the Home page", () => {
  assert.deepEqual(parseSiteRoute("/3btechhub/"), { view:"home", layout:"overview" });
  assert.deepEqual(parseSiteRoute("/3btechhub/home/"), { view:"home", layout:"overview" });
  assert.deepEqual(parseSiteRoute("/3btechhub/home/overview/"), { view:"home", layout:"overview" });
  assert.deepEqual(parseSiteRoute("/3btechhub/home/list-view/services/"), { view:"home", layout:"list-view", recordSlug:"services" });
  assert.deepEqual(parseSiteRoute("/3btechhub/home/detail-view/tv-repair/"), { view:"home", layout:"detail-view", recordSlug:"tv-repair" });
});

test("Account layouts resolve to their named auth states", () => {
  assert.equal(parseSiteRoute("/3btechhub/account/login/").authMode, "login");
  assert.equal(parseSiteRoute("/3btechhub/account/create-account/").authMode, "signup");
  assert.equal(parseSiteRoute("/3btechhub/account/reset-password/").authMode, "recovery-start");
  assert.equal(parseSiteRoute("/3btechhub/account/verify/").authMode, "recovery-verify");
  assert.equal(parseSiteRoute("/3btechhub/account/new-password/").authMode, "recovery-new-password");
  assert.equal(parseSiteRoute("/3btechhub/account/profile/").authMode, "profile");
});

test("Dashboard layout slugs select the matching tab keys", () => {
  assert.equal(parseSiteRoute("/3btechhub/dashboard/").dashboardTab, "overview");
  assert.equal(parseSiteRoute("/3btechhub/dashboard/info/").dashboardTab, "info");
  assert.equal(parseSiteRoute("/3btechhub/dashboard/user/").dashboardTab, "users");
  assert.equal(parseSiteRoute("/3btechhub/dashboard/permission/").dashboardTab, "permissions");
  assert.equal(parseSiteRoute("/3btechhub/dashboard/setting/").dashboardTab, "setting");
});

test("unknown and malformed routes use the fallback instead of silently opening Home", () => {
  assert.deepEqual(parseSiteRoute("/3btechhub/unlisted/"), { view:"fallback" });
  assert.deepEqual(parseSiteRoute("/3btechhub/home/unlisted/"), { view:"fallback" });
  assert.deepEqual(parseSiteRoute("/3btechhub/account/unknown/"), { view:"fallback" });
  assert.deepEqual(parseSiteRoute("/3btechhub/dashboard/info/extra/"), { view:"fallback" });
  assert.equal(parseSiteRoute("/outside/home/"), null);
});
