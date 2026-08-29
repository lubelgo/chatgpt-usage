# ChatGPT Usage for Hermes Desktop

A unified Hermes plugin that shows the remaining OpenAI Codex / ChatGPT allowance in Hermes Desktop.

## What it includes

- A gateway-side read-only API at `/api/plugins/chatgpt-usage/usage`.
- A Hermes Desktop pane with each Codex usage window and its reset time.
- A status-bar indicator with the remaining percentage.

OAuth credentials stay on the gateway. The Desktop plugin only receives the usage snapshot.

## Install on a new Hermes Desktop client

1. Connect Hermes Desktop to the gateway where the agent half of this plugin is enabled.
2. Open the installation link for this repository in Hermes Desktop:

   `hermes://plugin/install?repo=<owner>/chatgpt-usage&enable=1`

3. Review and confirm the installation dialog.
4. Enable **ChatGPT Usage** in **Settings → Plugins** if the Desktop UI is not enabled already.

Desktop plugins are deliberately confirmed locally; a remote gateway cannot silently install code on a new computer.
