import OpenAI, { APIError } from "openai"
import type { ChatCompletionMessageParam } from "openai/resources"
import type { CommitType, Config } from "./config"

const COMMIT_RULES: Record<CommitType, string> = {
  conventional: "<type>(<optional scope>): <commit message>",
}

const COMMIT_TYPES: Record<CommitType, string> = {
  conventional: [
    `Choose a type from the type-to-description JSON below that best describes the git diff:`,
    JSON.stringify(
      {
        docs: "Documentation only changes",
        style:
          "Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)",
        refactor: "A code change that neither fixes a bug nor adds a feature",
        perf: "A code change that improves performance",
        test: "Adding missing tests or correcting existing tests",
        build: "Changes that affect the build system or external dependencies",
        ci: "Changes to our CI configuration files and scripts",
        chore: "Other changes that don't modify src or test files",
        revert: "Reverts a previous commit",
        feat: "A new feature",
        fix: "A bug fix",
      },
      null,
      2,
    ),
  ].join("\n"),
}

const generatePrompt = ({ locale, type = "", maxLength }: Config) =>
  [
    "Generate a concise git commit message written in present tense for the following code diff with the given specifications below:",
    `Message language: ${locale}`,
    `Commit message must be a maximum of ${maxLength} characters.`,
    "Exclude anything unnecessary such as translation. Your entire response will be passed directly into git commit.",
    COMMIT_TYPES[type as CommitType],
    "The output response must be in format:",
    COMMIT_RULES[type as CommitType] ?? "<commit message>",
    "The beginning of <commit message> must be in lowercase.",
    "<commit message> must always be in the past tense.",
  ]
    .filter(Boolean)
    .join("\n")

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
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: generatePrompt({ locale, type, maxLength }),
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
