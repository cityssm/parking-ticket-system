export const randomString = (): string => {
  return Math.ceil(Math.random() * 100_000).toString()
}
