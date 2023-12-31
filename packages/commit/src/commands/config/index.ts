import ListIt from "list-it"
import {
  getConfig,
  onValidConfig,
  onValidConfigKeys,
  setConfig,
} from "../../utils/config"
import { prompts } from "../../utils/prompts"

const list = new ListIt({
  headerColor: "gray",
  headerUnderline: true,
})

const get = async (keys: string[]) => {
  await prompts(async (p, s) => {
    s.start(`Getting the configure`)

    const config = await getConfig()

    onValidConfigKeys(keys)

    s.stop(`Got the configure`)

    const table = Object.entries(config)
      .map(([key, value]) => {
        if (keys.length && !keys.includes(key)) return

        return {
          key: `${key}          `,
          value: `${value}          `,
        }
      })
      .filter(Boolean)

    const message = list.d(table).toString()

    p.note(message, `Configure`)

    p.complete("Done")
  })
}

const set = async (parameters: string[]) => {
  await prompts(async (p, s) => {
    s.start(`Setting the configure`)

    const data = parameters.reduce<Record<string, any>>((prev, parameter) => {
      const [key, value] = parameter.split("=")

      if (!key) throw new Error(`Invalid config key: ${key}`)
      if (!value) throw new Error(`Invalid config value: ${value}`)

      prev[key] = value

      return prev
    }, {})

    const config = await setConfig(onValidConfig(data))

    s.stop(`Set the configure`)

    const table = Object.entries(config).map(([key, value]) => ({
      key: `${key}          `,
      value: `${value}          `,
    }))

    const message = list.d(table).toString()

    p.note(message, `Configure`)

    p.complete(`Successfully updated`)
  })
}

export const config = { get, set }
