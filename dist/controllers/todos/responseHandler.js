"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const Effect = __importStar(require("@effect/io/Effect"));
const effect_1 = require("effect");
const respondWithError = (response, status, message, additionalInfo) => (0, effect_1.pipe)(Effect.succeed(response.status(status).json({
    message: `Fail: ${message}`,
    info: additionalInfo,
})));
function sendResponse({ getDataEffect, response, successStatus, }) {
    return (0, effect_1.pipe)(Effect.matchCauseEffect(getDataEffect, {
        onFailure: (cause) => {
            switch (cause._tag) {
                case "Fail":
                    if (cause.error._tag === "ItemNotFoundError") {
                        return respondWithError(response, 404, cause.error._tag, cause.error.message);
                    }
                    if (cause.error._tag === "ParameterError") {
                        return respondWithError(response, 400, cause.error._tag, cause.error.message);
                    }
                    return respondWithError(response, 500, cause.error._tag);
                case "Die":
                case "Interrupt":
                    respondWithError(response, 500, "Internal server error");
            }
            return Effect.succeed(response.status(500).json("Internal Server error"));
        },
        onSuccess: (todos) => Effect.succeed(response.status(successStatus).json(todos)),
    }), Effect.runPromise);
}
exports.sendResponse = sendResponse;
