import { execa } from "execa"

const EXCLUDE_FILES = ["package-lock.json", "pnpm-lock.yaml", "*.lock"]

const transformExclude = (path: string) => `:(exclude)${path}`

const getDiffCommands = (
  options: string[] = [],
  excludeFiles: string[] = [],
) => [
  "diff",
  ...options,
  ...EXCLUDE_FILES.map(transformExclude),
  ...excludeFiles.map(transformExclude),
]

export const getDiff = async (excludeFiles: string[] = []) => {
  const commands = getDiffCommands(
    ["--cached", "--diff-algorithm=minimal"],
    excludeFiles,
  )

  const { stdout } = await execa("git", commands)

  return stdout
}

export const getStagedFiles = async (excludeFiles: string[] = []) => {
  const { stdout } = await execa(
    "git",
    getDiffCommands(["--cached", "--name-only"], excludeFiles),
  )

  if (!stdout) return {}

  const files = stdout.split("\n")

  const diff = await getDiff(excludeFiles)

  return { files, diff }
}

export const getWorkedFiles = async (excludeFiles: string[] = []) => {
  const { stdout } = await execa(
    "git",
    getDiffCommands(["--name-only"], excludeFiles),
  )

  if (!stdout) return []

  return stdout.split("\n")
}
