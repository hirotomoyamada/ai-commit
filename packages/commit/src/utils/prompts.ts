import * as p from "@clack/prompts"
import c from "chalk"

export type Option = { value: string; label?: string; hint?: string }

type CustomCommands = {
  done: (message: string) => void
  complete: (message: string) => void
  error: (message: string) => void
}

export type Prompts = typeof p & CustomCommands

export type Spinner = ReturnType<typeof p.spinner>

export const prompts = async (
  callback: (p: Prompts, s: Spinner) => Promise<void> | void,
) => {
  console.log("")

  p.intro(c.green(`AI Commit`))

  let isLoading = false
  const s = p.spinner()

  try {
    const commands: CustomCommands = {
      done: (message) => p.outro(c.dim(message)),
      complete: (message) => p.outro(c.green(message)),
      error: (message) => p.cancel(c.red(message)),
    }

    const spinner: Spinner = {
      start: (message) => {
        isLoading = true

        s.start(message)
      },
      message: (message) => s.message(message),
      stop: (message) => {
        isLoading = false

        s.stop(message)
      },
    }

    await callback({ ...p, ...commands }, spinner)
  } catch (e) {
    if (isLoading) s.stop(`An error occurred`, 500)

    p.cancel(c.red(e instanceof Error ? e.message : "Message is missing"))
  }
}
