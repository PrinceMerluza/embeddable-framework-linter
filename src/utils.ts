export function getLineFromPosition(source: string, position: number) {
  const tmpStr = source.substring(0, position);
  const lines = tmpStr.split('\n');
  return lines.length;
}

/**
 * Cleans the property key if somehow it still has quotes
 * @param source string
 * @returns string
 */
export function cleanKeyText(source: string): string {
  let ret = source;
  ret = ret.replaceAll('"', '');
  ret = ret.replaceAll('\'', '');
  return ret
}
