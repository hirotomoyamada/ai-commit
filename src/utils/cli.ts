import checkNode from "cli-check-node"
import unhandledError from "cli-handle-unhandled"
import updateNotifier from "update-notifier"
import JSON from "../../package.json"

export const initCLI = async () => {
  checkNode("12")

  await unhandledError()

  updateNotifier({
    pkg: JSON,
    shouldNotifyInNpmScript: true,
    updateCheckInterval: 1000 * 60 * 60 * 24 * 3,
  }).notify({ isGlobal: true })
}
