import { existsSync } from "fs"
import { readFile } from "fs/promises"
import path from "path"
import OpenAI, { APIError } from "openai"
import type { ChatCompletionMessageParam } from "openai/resources"
import { COMMIT_RULES, COMMIT_TYPES, DEFAULT_PROMPT } from "../commands/prompt"
import { CONFIG_PATH, type CommitType, type Config } from "./config"

const generatePrompt = (
  prompt: string,
  { locale = "en", type = "", maxLength = "50" }: Config,
) => {
  const replacements: Record<string, string> = {
    locale,
    maxLength,
    commit_type: COMMIT_TYPES[type as CommitType],
    commit_rule: COMMIT_RULES[type as CommitType] ?? "<commit message>",
  }

  return prompt.replace(/{{\s*(\w+)\s*}}/g, (_, key) => replacements[key] || "")
}

export type GenerateCommitMessagesParameters = Config & {
  diff: string
}

export const generateCommitMessages = async ({
  apiKey,
  generate = "1",
  locale,
  timeout = "10000",
  type,
  model = "gpt-4",
  maxLength,
  diff,
}: GenerateCommitMessagesParameters): Promise<string[]> => {
  try {
    const isExists = existsSync(path.join(CONFIG_PATH, "prompt"))

    let prompt: string = DEFAULT_PROMPT

    if (isExists)
      prompt = await readFile(path.join(CONFIG_PATH, "prompt"), "utf-8")

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: generatePrompt(prompt, { locale, type, maxLength }),
      },
      {
        role: "user",
        content: diff,
      },
    ]

    const n = Number(generate)

    const openai = new OpenAI({ apiKey, timeout: Number(timeout) })

    const { choices } = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      n,
      max_tokens: 200,
    })

    let commitMessages = choices
      .map(({ message }) => message.content?.replace(/^"|"$/g, ""))
      .filter(Boolean) as string[]

    commitMessages = Array.from(new Set(commitMessages))

    return commitMessages
  } catch (e) {
    if (e instanceof APIError) {
      if (!e.status || e.status < 200 || e.status > 299)
        throw new Error(`OpenAI API Error: ${e.message}`)

      if (!e.status || e.status >= 500)
        throw new Error("Check the API status: https://status.openai.com")
    } else if (e instanceof Error) {
      throw new Error(e.message)
    }

    return []
  }
}
