import * as p from "@clack/prompts"
import c from "chalk"

export type PromptOptions = { label: string; value: string }[]

export type Prompts = typeof p

export type Spinner = ReturnType<typeof p.spinner>

export const prompts = async (
  callback: (p: Prompts, s: Spinner) => Promise<string | void> | string | void,
) => {
  p.intro(c.green(`AI Commit`))

  const s = p.spinner()

  try {
    const message = await callback(p, s)

    p.outro(c.green(`${message ?? "Done"}\n`))
  } catch (e) {
    s.stop(`An error occurred`, 500)

    p.cancel(c.red(e instanceof Error ? e.message : "Message is missing"))
  }
}
