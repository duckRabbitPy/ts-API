"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitOperatorAndValue = void 0;
const splitOperatorAndValue = (filterString) => {
    if (filterString.includes(":")) {
        const splitIndex = filterString.indexOf(":");
        const leftPart = filterString.substring(0, splitIndex);
        const rightPart = filterString.substring(splitIndex + 1);
        return [leftPart, rightPart];
    }
    return ["eq", filterString];
};
exports.splitOperatorAndValue = splitOperatorAndValue;
