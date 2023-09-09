export const parseColon = (filterString: string): [string, string] => {
  if (filterString.includes(":")) {
    const splitIndex = filterString.indexOf(":");
    const leftPart = filterString.substring(0, splitIndex);
    const rightPart = filterString.substring(splitIndex + 1);

    return [leftPart, rightPart];
  }
  return ["eq", filterString];
};
