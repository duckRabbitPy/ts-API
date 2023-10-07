"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyMiddleware = void 0;
const Function_1 = require("@effect/data/Function");
const parseHelpers_1 = require("../controllers/utils/parseHelpers");
const effect_1 = require("effect");
const customErrors_1 = require("../controllers/customErrors");
const validateApiKey = (apiKey) => {
    return apiKey === process.env.API_KEY;
};
// Middleware to check API key in headers
const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers["x-api-key"];
    return (0, Function_1.pipe)(apiKey, parseHelpers_1.safeParseNonEmptyString, effect_1.Effect.orElseFail(() => new customErrors_1.AuthorisationError({ message: "No API key provided" })), effect_1.Effect.flatMap((apiKey) => {
        if (!validateApiKey(apiKey)) {
            return effect_1.Effect.fail(new customErrors_1.AuthorisationError({ message: "Invalid API key" }));
        }
        return effect_1.Effect.succeed(next());
    }), effect_1.Effect.matchCauseEffect({
        onFailure: (cause) => {
            if (cause._tag === "Fail") {
                return effect_1.Effect.succeed(res.status(401).json({ message: cause.error._tag }));
            }
            return effect_1.Effect.succeed(res.status(500).json({ message: "Internal server error" }));
        },
        onSuccess: () => effect_1.Effect.unit,
    }), effect_1.Effect.runSync);
};
exports.apiKeyMiddleware = apiKeyMiddleware;
