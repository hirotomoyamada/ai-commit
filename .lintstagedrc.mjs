import { ESLint } from "eslint"

const omitIgnoredPaths = async (paths) => {
  const eslint = new ESLint()

  const resolvedPaths = (
    await Promise.all(
      paths.map((path) => (!eslint.isPathIgnored(path) ? path : undefined)),
    )
  ).filter(Boolean)

  return resolvedPaths.join(" ")
}

export default {
  "**/*.{js,ts,md,mdx,yml,json}": ["prettier --write"],
  "**/*.{js,ts}": async (paths) => {
    const resolvedPaths = await omitIgnoredPaths(paths)

    return [`eslint --max-warnings=0 ${resolvedPaths}`]
  },
}
