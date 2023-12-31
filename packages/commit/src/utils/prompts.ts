import * as p from "@clack/prompts"
import c from "chalk"

export type PromptOptions = { label: string; value: string }[]

type CustomCommands = {
  done: (message: string) => void
  complete: (message: string) => void
}

export type Prompts = typeof p & CustomCommands

export type Spinner = ReturnType<typeof p.spinner>

export const prompts = async (
  callback: (p: Prompts, s: Spinner) => Promise<void> | void,
) => {
  console.log("")

  p.intro(c.green(`AI Commit`))

  const s = p.spinner()

  try {
    const commands: CustomCommands = {
      done: (message) => p.outro(c.dim(message)),
      complete: (message) => p.outro(c.green(message)),
    }

    await callback({ ...p, ...commands }, s)
  } catch (e) {
    console.log(e)

    s.stop(`An error occurred`, 500)

    p.cancel(c.red(e instanceof Error ? e.message : "Message is missing"))
  }
}
