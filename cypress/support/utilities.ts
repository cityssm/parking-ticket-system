export function randomString(): string {
  return Math.ceil(Math.random() * 100_000).toString()
}
