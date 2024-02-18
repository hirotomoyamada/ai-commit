import { execa } from "execa"

const EXCLUDE_FILES = ["package-lock.json", "pnpm-lock.yaml", "*.lock"]

const transformExclude = (path: string) => `:(exclude)${path}`

const getExcludeFileCommands =
  (excludeFiles: string[] = []) =>
  (includes: boolean = true) => [
    ...(includes ? EXCLUDE_FILES.map(transformExclude) : []),
    ...excludeFiles.map(transformExclude),
  ]

const getDiffCommands =
  (options: string[] = [], excludeFiles: string[] = []) =>
  (includes: boolean = true) => [
    "diff",
    ...options,
    ...getExcludeFileCommands(excludeFiles)(includes),
  ]

export const getDiff = async (excludeFiles: string[] = []) => {
  const commands = getDiffCommands(
    ["--cached", "--diff-algorithm=minimal"],
    excludeFiles,
  )(true)

  const { stdout } = await execa("git", commands)

  return stdout
}

export const getStagedFiles = async (excludeFiles: string[] = []) => {
  const { stdout } = await execa(
    "git",
    getDiffCommands(["--cached", "--name-only"], excludeFiles)(false),
  )

  if (!stdout) return {}

  const files = stdout.split("\n")

  const diff = await getDiff(excludeFiles)

  return { files, diff }
}

export const getNotStagedFiles = async (excludeFiles: string[] = []) => {
  const { stdout } = await execa(
    "git",
    getDiffCommands(["--name-only"], excludeFiles)(false),
  )

  if (!stdout) return []

  return stdout.split("\n")
}

export const getUntrackedFiles = async (excludeFiles: string[] = []) => {
  const { stdout } = await execa("git", [
    "ls-files",
    "--others",
    "--exclude-standard",
    ...getExcludeFileCommands(excludeFiles)(false),
  ])

  if (!stdout) return []

  return stdout.split("\n")
}
