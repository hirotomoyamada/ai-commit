import { existsSync } from "fs"
import { readFile, writeFile } from "fs/promises"
import os from "os"
import path from "path"

export const CONFIG_KEYS = [
  "OPENAI_KEY",
  "generate",
  "locale",
  "timeout",
  "type",
  "model",
  "max-length",
] as const

export type Config = {
  [key in (typeof CONFIG_KEYS)[number]]?: string
}

export const CONFIG_PATH = path.join(os.homedir(), ".aicommit")

export const DEFAULT_CONFIG: Config = {
  OPENAI_KEY: undefined,
  generate: "1",
  locale: "en",
  timeout: "10000",
  type: undefined,
  model: "gpt-4",
  "max-length": "50",
}

export const onValidConfigKeys = (keys: string[]) => {
  keys.forEach((key) => {
    if (!CONFIG_KEYS.includes(key as keyof Config))
      throw new Error(`Invalid config property: ${key}`)
  })
}

export const onValidConfig = (obj: Record<string, any>) => {
  Object.keys(obj).forEach((key) => {
    if (!CONFIG_KEYS.includes(key as keyof Config))
      throw new Error(`Invalid config property: ${key}`)
  })

  return obj as Config
}

export const getConfig = async () => {
  const isExists = existsSync(CONFIG_PATH)

  if (!isExists) return DEFAULT_CONFIG

  const data = await readFile(CONFIG_PATH, "utf-8")

  const config = JSON.parse(data) as Config

  return { ...DEFAULT_CONFIG, ...config }
}

export const setConfig = async (nextConfig: Config) => {
  const prevConfig = await getConfig()

  const config = { ...prevConfig, ...nextConfig }

  const data = JSON.stringify(config, null, 2)

  await writeFile(CONFIG_PATH, data, "utf-8")

  return config
}
