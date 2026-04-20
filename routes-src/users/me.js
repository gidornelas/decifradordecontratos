var http = require("../../lib/http");
var auth = require("../../lib/auth");
var db = require("../../lib/db");
var observability = require("../../lib/observability");

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    return getCurrentUser(req, res);
  }

  if (req.method === "PATCH") {
    return updateCurrentUser(req, res);
  }

  return http.methodNotAllowed(res, ["GET", "PATCH"]);
};

async function getCurrentUser(req, res) {
  var requestContext = observability.logRequestStart(req, res, {
    route: "users.me.get"
  });
  var currentUserId = null;

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      observability.logRequestComplete(req, res, {
        route: "users.me.get",
        statusCode: 401
      });
      return http.unauthorized(res, "Invalid or missing session.");
    }

    currentUserId = authContext.session.user_id;

    observability.logRequestComplete(req, res, {
      route: "users.me.get",
      userId: currentUserId,
      statusCode: 200,
      requestId: requestContext.requestId
    });
    return http.ok(res, {
      user: serializeUser(authContext.session)
    });
  } catch (error) {
    observability.logAppError("users.me.get_failed", error, {
      route: "users.me.get",
      requestId: requestContext.requestId,
      userId: currentUserId
    });
    observability.logRequestComplete(req, res, {
      route: "users.me.get",
      userId: currentUserId,
      statusCode: 500
    });
    return http.internalError(res, error);
  }
}

async function updateCurrentUser(req, res) {
  var requestContext = observability.logRequestStart(req, res, {
    route: "users.me.patch"
  });
  var currentUserId = null;

  try {
    var authContext = await auth.getSessionFromRequest(req);

    if (!authContext) {
      observability.logRequestComplete(req, res, {
        route: "users.me.patch",
        statusCode: 401
      });
      return http.unauthorized(res, "Invalid or missing session.");
    }

    currentUserId = authContext.session.user_id;

    var body = await http.parseJsonBody(req);
    var fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";

    if (!fullName) {
      observability.logRequestComplete(req, res, {
        route: "users.me.patch",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, "fullName is required.");
    }

    if (fullName.length > 120) {
      observability.logRequestComplete(req, res, {
        route: "users.me.patch",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, "fullName must have at most 120 characters.");
    }

    var result = await db.query(
      [
        "update users",
        "set full_name = $2",
        "where id = $1",
        "returning id, email, full_name, plan_code, created_at"
      ].join(" "),
      [authContext.session.user_id, fullName]
    );

    if (!result.rows.length) {
      observability.logRequestComplete(req, res, {
        route: "users.me.patch",
        userId: currentUserId,
        statusCode: 404
      });
      return http.badRequest(res, "User not found.");
    }

    observability.logRequestComplete(req, res, {
      route: "users.me.patch",
      userId: currentUserId,
      statusCode: 200,
      requestId: requestContext.requestId
    });
    return http.ok(res, {
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        fullName: result.rows[0].full_name,
        planCode: result.rows[0].plan_code,
        createdAt: result.rows[0].created_at
      },
      message: "Profile updated successfully."
    });
  } catch (error) {
    if (error && error.message === "Invalid JSON body.") {
      observability.logRequestComplete(req, res, {
        route: "users.me.patch",
        userId: currentUserId,
        statusCode: 400
      });
      return http.badRequest(res, error.message);
    }

    observability.logAppError("users.me.patch_failed", error, {
      route: "users.me.patch",
      requestId: requestContext.requestId,
      userId: currentUserId
    });
    observability.logRequestComplete(req, res, {
      route: "users.me.patch",
      userId: currentUserId,
      statusCode: 500
    });
    return http.internalError(res, error);
  }
}

function serializeUser(session) {
  return {
    id: session.user_id,
    email: session.email,
    fullName: session.full_name,
    planCode: session.plan_code,
    createdAt: session.created_at
  };
}
