export function getLineFromPosition(source: string, position: number) {
  const tmpStr = source.substring(0, position);
  const lines = tmpStr.split('\n');
  return lines.length;
}
