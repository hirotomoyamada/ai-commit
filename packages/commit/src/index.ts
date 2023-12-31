import { program } from "commander"
import packageJSON from "../package.json"
import commitAction from "./commands/commit"
import configAction from "./commands/config"
import helpAction from "./commands/help"
// import hookAction from "./commands/hook"

export const run = async () => {
  program.version(packageJSON.version, "-v, --version")

  program
    .option("-g, --generate [generate]", `Number of messages to generate`)
    .option(
      "-a, --all",
      `Automatically stage tracked and untracked file changes for the commit`,
    )
    .option("-t, --type <type>", `Type of commit message to generate`)
    .option("-e, --excludes [files...]", `Files to exclude from AI analysis`)
    .action(commitAction)

  // const hook = program.command("hook")

  // hook
  //   .command("install", "", { isDefault: true })
  //   .description("Install git hooks")
  //   .action(hookAction.install)
  // hook
  //   .command("uninstall")
  //   .description(`Uninstall git hooks`)
  //   .action(hookAction.uninstall)

  const config = program.command("config")

  config
    .command("get [keys...]", "", { isDefault: true })
    .description(`Get the configure`)
    .action(configAction.get)
  config
    .command("reset [keys...]")
    .description(`Reset the configure`)
    .action(configAction.reset)
  config
    .command("set [parameters...]")
    .description(`Set the configure`)
    .action(configAction.set)

  program.on("-h, --help", helpAction)

  program.parse()
}
