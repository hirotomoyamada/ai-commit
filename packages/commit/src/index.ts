import { program } from "commander"
import { commit } from "./commands/commit"
import { config } from "./commands/config"
import { help } from "./commands/help"
import { hook } from "./commands/hook"

export const run = async () => {
  program
    .option("-g, --generate <generate>", ``)
    .option("-a, --all", ``)
    .action(commit)

  program
    .command("hook")
    .addCommand(program.command("install", ``).action(hook.install))
    .addCommand(program.command("uninstall", ``).action(hook.uninstall))

  program
    .command("config")
    .addCommand(program.command("get [keys...]", ``).action(config.get))
    .addCommand(program.command("set [parameters...]", ``).action(config.set))

  program.on("-h, --help", help)

  program.parse()
}
