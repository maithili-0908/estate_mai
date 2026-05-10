const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const User = require("../src/models/User");
const {
  getJwtSecret,
  optionalAuth,
  protect,
  requireRole,
  signToken,
} = require("../src/middleware/auth");

function makeRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function makeReq(token) {
  return {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  };
}

async function run() {
  const originalJwtSecret = process.env.JWT_SECRET;
  const originalFindOne = User.findOne;

  try {
    delete process.env.JWT_SECRET;
    assert.throws(() => getJwtSecret(), /JWT_SECRET is required/);
    assert.throws(
      () => signToken({ id: "u1", role: "user", email: "user@test.com" }),
      /JWT_SECRET is required/
    );

    process.env.JWT_SECRET = "unit_test_secret";

    const token = signToken({ id: "u-sign", role: "user", email: "sign@test.com" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    assert.equal(decoded.id, "u-sign");
    assert.equal(decoded.role, "user");
    assert.equal(decoded.email, "sign@test.com");

    User.findOne = ({ id }) => ({
      select: async () => {
        if (id === "u-missing") return null;
        if (id === "u-suspended") {
          return { id, role: "agent", status: "Suspended" };
        }
        return { id, role: "agent", status: "Active" };
      },
    });

    const validToken = jwt.sign(
      { id: "u-active", role: "agent", email: "agent@test.com" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const reqOptional = makeReq(validToken);
    let optionalNextCalled = false;
    await optionalAuth(reqOptional, makeRes(), () => {
      optionalNextCalled = true;
    });
    assert.equal(optionalNextCalled, true);
    assert.equal(reqOptional.user.id, "u-active");

    const reqNoToken = makeReq(null);
    await optionalAuth(reqNoToken, makeRes(), () => {});
    assert.equal(reqNoToken.user, null);

    const reqInvalid = makeReq("bad.token.value");
    const resInvalid = makeRes();
    let invalidNextCalled = false;
    await protect(reqInvalid, resInvalid, () => {
      invalidNextCalled = true;
    });
    assert.equal(invalidNextCalled, false);
    assert.equal(resInvalid.statusCode, 401);
    assert.deepEqual(resInvalid.body, { message: "Unauthorized" });

    const tokenMissingUser = jwt.sign(
      { id: "u-missing", role: "agent", email: "missing@test.com" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const reqMissing = makeReq(tokenMissingUser);
    const resMissing = makeRes();
    await protect(reqMissing, resMissing, () => {});
    assert.equal(resMissing.statusCode, 401);
    assert.deepEqual(resMissing.body, { message: "Unauthorized" });

    const tokenSuspended = jwt.sign(
      { id: "u-suspended", role: "agent", email: "suspended@test.com" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const reqSuspended = makeReq(tokenSuspended);
    const resSuspended = makeRes();
    await protect(reqSuspended, resSuspended, () => {});
    assert.equal(resSuspended.statusCode, 403);
    assert.deepEqual(resSuspended.body, { message: "Account is suspended" });

    const reqProtected = makeReq(validToken);
    const resProtected = makeRes();
    let protectedNextCalled = false;
    await protect(reqProtected, resProtected, () => {
      protectedNextCalled = true;
    });
    assert.equal(protectedNextCalled, true);
    assert.equal(reqProtected.user.id, "u-active");

    const roleGuard = requireRole("admin");
    const reqWrongRole = { user: { id: "u-active", role: "agent" } };
    const resWrongRole = makeRes();
    let wrongRoleNextCalled = false;
    roleGuard(reqWrongRole, resWrongRole, () => {
      wrongRoleNextCalled = true;
    });
    assert.equal(wrongRoleNextCalled, false);
    assert.equal(resWrongRole.statusCode, 403);
    assert.deepEqual(resWrongRole.body, { message: "Forbidden" });

    const reqAdmin = { user: { id: "u-admin", role: "admin" } };
    let adminNextCalled = false;
    roleGuard(reqAdmin, makeRes(), () => {
      adminNextCalled = true;
    });
    assert.equal(adminNextCalled, true);

    console.log("auth middleware tests passed");
  } finally {
    User.findOne = originalFindOne;
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  }
}

run().catch((err) => {
  console.error("auth middleware tests failed");
  console.error(err);
  process.exit(1);
});
