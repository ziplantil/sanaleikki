
export function mapValues<V>(obj: {[key: string]: V}, fn: (value: V, key: string) => any) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => fn(v, k)))
}
