<div align="center">

# AI Commit

[![NPM Minizip](https://img.shields.io/bundlephobia/minzip/@hirotomoyamada/ai-commit)](https://www.npmjs.com/package/@hirotomoyamada/ai-commit)
![NPM Downloads](https://img.shields.io/npm/dm/@hirotomoyamada/ai-commit.svg?style=flat)
[![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/Redocly/repo-file-sync-action/blob/main/LICENSE)
![Github Stars](https://img.shields.io/github/stars/hirotomoyamada/ai-commit)

AI generates git commit messages on your behalf.

</div>

## Table of Contents

- [Setup](#setup)
- [Upgrading](#upgrading)
- [Usage](#usage)
- [Configuration](#configuration)
- [Prompt](#prompt)

## Setup

1. Install

   ```sh
   pnpm add -g @hirotomoyamada/ai-commit
   ```

2. Obtain your API key from [OpenAI](https://platform.openai.com/account/api-keys).

3. Set your API key in `ai-commit`.

   ```sh
   ai-commit config set apiKey=<your token>
   ```

## Upgrading

To check the installed version, run the following:

```sh
ai-commit --version
```

To install the [latest version](https://github.com/hirotomoyamada/ai-commit/releases), run the following:

```sh
pnpm up -g aicommit --latest
```

## Usage

To generate a commit message, run the following:

```sh
ai-commit
```

> [!TIP]
>
> `ai-commit` provides a shortened alias `aic`.

When you run `ai-commit`, two scenarios may occur:

1. If there are files staged:

   - AI detects the differences in the staged files and generates a commit message.
   - Once you review and approve the generated commit message, it will be committed.

2. If there are changed files not yet staged:

   - A list of changed files will be displayed.
   - You select the files to add to the stage from the list.
   - AI detects the differences in the newly staged files and generates a commit message.
   - Once you review and approve the generated commit message, it will be committed.

> [!TIP]
>
> To add all changed files not currently staged to the stage (with `git add .`), set the `--all` or `-a` option.

### Changing the Commit Message Suggestions

To change the commit message suggestions, set the `--generate <i>` or `-g <i>` option. The default is set to `1`.

```sh
ai-commit --generate 5
```

> [!NOTE]
>
> You can set up to a maximum of `5` suggestions.

### Applying [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

Many projects have rules for commit messages based on [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). If you want to apply these rules, set `conventional` with the `--type` or `-t` option.

```sh
ai-commit --type conventional
```

> [!NOTE]
>
> By setting it in the configuration, you can always apply the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) commit message rules.

## Configuration

To get the configuration, run the following:

```sh
ai-commit config get
```

To get specific items only, run the following:

```sh
ai-commit config get generate locale
```

To set values in the configuration, run the following:

```sh
ai-commit config set generate=5 type=conventional
```

To reset the configuration values, run the following:

```sh
ai-commit config reset
```

| Item        | Default     | Description                                                                                      |
| ----------- | ----------- | ------------------------------------------------------------------------------------------------ |
| `apiKey`    | `undefined` | API key generated from [OpenAI](https://platform.openai.com/account/api-keys)                    |
| `generate`  | `1`         | Number of commit messages to generate                                                            |
| `locale`    | `en`        | [Locale](https://wikipedia.org/wiki/List_of_ISO_639-1_codes) used for generating commit messages |
| `timeout`   | `10000`     | Timeout for network requests to `OpenAI` (milliseconds)                                          |
| `type`      | `undefined` | Type of commit message to generate                                                               |
| `model`     | `gpt-4`     | `OpenAI` [model](https://platform.openai.com/docs/models) used for generating commit messages    |
| `maxLength` | `50`        | Maximum character length of the generated commit message                                         |

## Prompt

To get the prompt, run the following:

```sh
ai-commit prompt get
```

The default prompt is as follows:

```md
Generate a concise git commit message written in present tense for the following code diff with the given specifications below:
Message language: {{ locale }}
Commit message must be a maximum of {{ maxLength }} characters.
Exclude anything unnecessary such as translation. Your entire response will be passed directly into git commit.
{{ commitType }}
The output response must be in format:
{{ commitRule }}
```

> [!NOTE]
>
> `{{ locale }}` and `{{ maxLength }}` will be replaced with the values set in the configuration.

To update the prompt, run the following:

```sh
ai-commit prompt set
```

To reset the prompt, run the following:

```sh
ai-commit prompt reset
```

## License

MIT © [Hirotomo Yamada](https://github.com/hirotomoyamada)
