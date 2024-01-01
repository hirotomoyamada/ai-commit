import { existsSync } from "fs"
import { mkdir, readFile, writeFile } from "fs/promises"
import os from "os"
import path from "path"
import { pickObject } from "./object"

export type CommitType = (typeof COMMIT_TYPE_MAP)[number]
export type ConfigKey = (typeof CONFIG_KEY_MAP)[number]
export type Config = { [key in ConfigKey]?: string }

export const CONFIG_PATH = path.join(os.homedir(), ".ai-commit")
export const COMMIT_TYPE_MAP = ["conventional"] as const
export const CONFIG_KEY_MAP = [
  "apiKey",
  "generate",
  "locale",
  "timeout",
  "type",
  "model",
  "maxLength",
  "prompt",
] as const
export const DEFAULT_CONFIG: Config = {
  apiKey: undefined,
  generate: "1",
  locale: "en",
  timeout: "10000",
  type: undefined,
  model: "gpt-4",
  maxLength: "50",
}

export const onValidConfigKeys = (keys: string[]) => {
  keys.forEach((key) => {
    if (!CONFIG_KEY_MAP.includes(key as ConfigKey))
      throw new Error(`Invalid config property: ${key}`)
  })
}

export const onValidateProperty = (
  name: ConfigKey,
  condition: boolean,
  message: string,
) => {
  if (!condition) throw new Error(`Invalid config property ${name}: ${message}`)
}

export const onValidConfig = (obj: Record<string, any>) => {
  Object.entries(obj).forEach(([key, value]) => {
    if (!CONFIG_KEY_MAP.includes(key as ConfigKey))
      throw new Error(`Invalid config property: ${key}`)

    switch (key) {
      case "apiKey": {
        onValidateProperty(key, !!value, "Cannot be empty")
        onValidateProperty(
          key,
          value.startsWith("sk-"),
          "Must start with `sk-`",
        )

        break
      }

      case "generate": {
        onValidateProperty(key, /^\d+$/.test(value), "Must be an integer")

        const parsedValue = Number(value)

        onValidateProperty(key, parsedValue > 0, "Must be greater than 0")
        onValidateProperty(key, parsedValue <= 5, "Must be less or equal to 5")

        break
      }

      case "locale": {
        onValidateProperty(key, !!value, "Cannot be empty")
        onValidateProperty(
          key,
          /^[a-z-]+$/i.test(value),
          "Must be a valid locale (letters and dashes/underscores). You can consult the list of codes in: https://wikipedia.org/wiki/List_of_ISO_639-1_codes",
        )

        break
      }

      case "timeout": {
        onValidateProperty(key, /^\d+$/.test(value), "Must be an integer")

        const parsedValue = Number(value)

        onValidateProperty(
          key,
          parsedValue >= 500,
          "Must be greater than 500ms",
        )

        break
      }

      case "type":
        if (value)
          onValidateProperty(
            key,
            COMMIT_TYPE_MAP.includes(value),
            "Invalid commit type",
          )

        break

      case "model":
        onValidateProperty(key, !!value, "Cannot be empty")

        break

      case "maxLength": {
        onValidateProperty(key, /^\d+$/.test(value), "Must be an integer")

        const parsedValue = Number(value)

        onValidateProperty(
          key,
          parsedValue >= 20,
          "Must be greater than 20 characters",
        )

        break
      }

      default:
        break
    }
  })

  return obj as Config
}

export const getConfig = async () => {
  const isExists = existsSync(path.join(CONFIG_PATH, "config"))

  if (!isExists) return DEFAULT_CONFIG

  const data = await readFile(path.join(CONFIG_PATH, "config"), "utf-8")

  const config = JSON.parse(data) as Config

  return { ...DEFAULT_CONFIG, ...pickObject(config, [...CONFIG_KEY_MAP]) }
}

const writeConfig = async (config: Config) => {
  const data = JSON.stringify(config, null, 2)

  try {
    await writeFile(path.join(CONFIG_PATH, "config"), data, "utf-8")
  } catch (e) {
    if (e instanceof Error) {
      if ("code" in e && e.code === "ENOENT") {
        await mkdir(CONFIG_PATH, { recursive: true })

        await writeFile(path.join(CONFIG_PATH, "config"), data, "utf-8")
      } else {
        throw new Error(e.message)
      }
    }
  }
}

export const setConfig = async (nextConfig: Config) => {
  const prevConfig = await getConfig()

  const config = { ...prevConfig, ...nextConfig }

  await writeConfig(config)

  return config
}

export const resetConfig = async (keys: string[] = []) => {
  const prevConfig = await getConfig()

  const config = {
    ...prevConfig,
    ...pickObject(DEFAULT_CONFIG, keys as ConfigKey[]),
  }

  await writeConfig(config)

  return config
}
