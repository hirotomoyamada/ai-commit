import { existsSync } from "fs"
import { readFile, writeFile } from "fs/promises"
import os from "os"
import path from "path"
import { pickObject } from "./object"

export type CommitType = (typeof COMMIT_TYPES)[number]
export type ConfigKey = (typeof CONFIG_KEYS)[number]

export type Config = {
  [key in (typeof CONFIG_KEYS)[number]]?: string
}

export const CONFIG_PATH = path.join(os.homedir(), ".aicommit")
export const COMMIT_TYPES = ["conventional"] as const
export const CONFIG_KEYS = [
  "apiKey",
  "generate",
  "locale",
  "timeout",
  "type",
  "model",
  "maxLength",
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
    if (!CONFIG_KEYS.includes(key as ConfigKey))
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
    if (!CONFIG_KEYS.includes(key as ConfigKey))
      throw new Error(`Invalid config property: ${key}`)

    switch (key) {
      case "apiKey": {
        onValidateProperty(key, !!value, "Cannot be empty")
        onValidateProperty(
          key,
          value.startsWith("sk-"),
          'Must start with "sk-"',
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
            COMMIT_TYPES.includes(value),
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
  const isExists = existsSync(CONFIG_PATH)

  if (!isExists) return DEFAULT_CONFIG

  const data = await readFile(CONFIG_PATH, "utf-8")

  const config = JSON.parse(data) as Config

  return { ...DEFAULT_CONFIG, ...pickObject(config, [...CONFIG_KEYS]) }
}

export const setConfig = async (nextConfig: Config) => {
  const prevConfig = await getConfig()

  const config = { ...prevConfig, ...nextConfig }

  const data = JSON.stringify(config, null, 2)

  await writeFile(CONFIG_PATH, data, "utf-8")

  return config
}

export const resetConfig = async () => {
  const data = JSON.stringify(DEFAULT_CONFIG, null, 2)

  await writeFile(CONFIG_PATH, data, "utf-8")

  return DEFAULT_CONFIG
}
