import c from "chalk"
import { execa } from "execa"
import type { Config } from "../../utils/config"
import { getConfig, onValidateProperty } from "../../utils/config"
import {
  getDiff,
  getNotStagedFiles,
  getStagedFiles,
  getUntrackedFiles,
} from "../../utils/git"
import { generateCommitMessages } from "../../utils/openai"
import type { Option, Prompts, Spinner } from "../../utils/prompts"
import { prompts } from "../../utils/prompts"

let config: Config

const detectStagedFiles =
  (all: boolean, excludeFiles: string[]) => async (p: Prompts, s: Spinner) => {
    s.start("Detecting the staged files")

    if (all) await execa("git", ["add", "."])

    const { files, diff } = await getStagedFiles(excludeFiles)

    if (files?.length) {
      s.stop("Detected the staged files")

      const count = files.length.toString()
      const list = files.join("\n")

      p.note(list, `Staged ${count} file${files.length > 1 ? "s" : ""}`)

      return diff
    } else {
      s.message("Detecting the worked files")

      const notStagedFiles = await getNotStagedFiles(excludeFiles)
      const untrackedFiles = await getUntrackedFiles(excludeFiles)

      s.stop("Detected the worked files")

      if (!notStagedFiles.length && !untrackedFiles.length) {
        p.done("No worked files found")

        return
      }

      const options: Option[] = [
        ...notStagedFiles.map((value) => ({ value })),
        ...untrackedFiles.map((value) => ({ value, hint: "Untracked" })),
      ].sort((a, b) => a.value.localeCompare(b.value))

      const selectedFiles = await p.groupMultiselect<Option[], string>({
        message: `Select files to commit: ${c.dim("(Ctrl+c to exit)")}`,
        options: { "Select all": options },
      })

      if (p.isCancel(selectedFiles)) {
        p.done("Commit cancelled")

        return
      }

      await execa("git", ["add", ...selectedFiles])

      const diff = await getDiff(excludeFiles)

      return diff
    }
  }

const commitMessage = (diff: string) => async (p: Prompts, s: Spinner) => {
  s.start("Analyzing your changes with the AI")

  const messages = await generateCommitMessages({ ...config, diff })

  let message: string

  if (!messages.length)
    throw new Error("No commit messages were generated. Try again.")

  s.stop("Analyzed your changes")

  if (messages.length === 1) {
    message = messages[0]

    p.note(message, "Commit message")

    const shouldContinue = await p.confirm({
      message: `Use this commit message?`,
    })

    if (p.isCancel(shouldContinue) || !shouldContinue) {
      p.done("Reset cancelled")

      return
    }
  } else {
    const selectedMessage = await p.select<Option[], string>({
      message: `Pick a commit message to use: ${c.dim("(Ctrl+c to exit)")}`,
      options: messages.map((value) => ({ value })),
    })

    if (p.isCancel(selectedMessage)) {
      p.done("Commit cancelled")

      return
    }

    message = selectedMessage
  }

  await execa("git", ["commit", "-m", message])

  p.complete("Successfully committed")
}

type Options = {
  generate?: string
  all?: boolean
  type?: string
  excludes?: string[]
}

const commit = async ({
  generate,
  all = false,
  type,
  excludes = [],
}: Options) => {
  await prompts(async (p, s) => {
    config = await getConfig()

    onValidateProperty(
      "apiKey",
      !!config.apiKey,
      "Please set your OpenAI API key via `ai-commit config set apiKey=<your token>`",
    )

    if (generate) config.generate = generate
    if (type) config.type = type

    const diff = await detectStagedFiles(all, excludes)(p, s)

    if (diff) await commitMessage(diff)(p, s)
  })
}

export default commit
