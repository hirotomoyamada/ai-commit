<div align="center">

# AI Commit

[![NPM Minizip](https://img.shields.io/bundlephobia/minzip/@hirotomoyamada/ai-commit)](https://www.npmjs.com/package/@hirotomoyamada/ai-commit)
![NPM Downloads](https://img.shields.io/npm/dm/@hirotomoyamada/ai-commit.svg?style=flat)
[![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/Redocly/repo-file-sync-action/blob/main/LICENSE)
![Github Stars](https://img.shields.io/github/stars/hirotomoyamada/ai-commit)

AIがあなたに代わってgitのコミットメッセージを生成します。

</div>

<p align='center'>
<a href='./README.md'>English</a> | 日本語
</p>

## 目次

- [セットアップ](#セットアップ)
- [アップデート](#アップデート)
- [使い方](#使い方)
- [コンフィグ](#コンフィグ)
- [プロンプト](#プロンプト)

## セットアップ

1. インストール

   ```sh
   pnpm add -g @hirotomoyamada/ai-commit
   ```

2. [OpenAI](https://platform.openai.com/account/api-keys)から、あなたのAPIキーを取得します。

3. `ai-commit`にAPIキーを設定します。

   ```sh
   ai-commit config set apiKey=<your token>
   ```

## アップデート

インストールされているバージョンは、次にように確認します。

```sh
ai-commit --version
```

[最新バージョン](https://github.com/hirotomoyamada/ai-commit/releases)をインストールするには、次のように実行します。

```sh
pnpm up -g aicommit --latest
```

## 使い方

コミットメッセージを生成するには、次にように実行します。

```sh
ai-commit
```

> [!TIP]
>
> `ai-commit`は、省略したエイリアスの`aic`を提供しています。

`ai-commit`を実行すると、2つの条件分岐が発生します。

1. ステージ上のファイルが存在している場合

   - ステージ上のファイルをAIが差分を検出し、コミットメッセージを生成します。
   - 生成されたコミットメッセージを確認し、承認するとコミットされます。

2. ステージ上にない変更されたファイルが存在している場合

   - 変更されたファイルの一覧が表示されます。
   - 一覧のファイルからステージ上に追加するファイルを選択します。
   - 先ほど、ステージ上に追加したファイルをAIが差分を検出し、コミットメッセージを生成します。
   - 生成されたコミットメッセージを確認し、承認するとコミットされます。

> [!TIP]
>
> 現在のステージ上にない変更されたファイルをすべてステージ上に追加する(`git add .`)場合は、`--all`または`-a`を設定します。

### コミットメッセージの候補を変更する

コミットメッセージの候補を変更する場合は、オプションに`--generate <i>`または`-g <i>`を設定します。デフォルトは、`1`が設定されています。

```sh
ai-commit --generate 5
```

> [!NOTE]
>
> 候補は、最大`5`まで設定することができます。

### [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)を適応する

プロジェクトの多くは、[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)のコミットメッセージのルールを設けているでしょう。もし、このルールを適応する場合は、`--type`または`-t`に`conventional`を設定します。

```sh
ai-commit --type conventional
```

> [!NOTE]
>
> コンフィグ上で設定することで、常に[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)のコミットメッセージのルールを適応することができます。

## コンフィグ

コンフィグを取得するには、次のように実行します。

```sh
ai-commit config get
```

特定の項目だけ取得する場合は、次のように実行します。

```sh
ai-commit config get generate locale
```

コンフィグに値を設定するには、次のように実行します。

```sh
ai-commit config set generate=5 type=conventional
```

コンフィグの値をリセットするには、次のように実行します。

```sh
ai-commit config reset
```

| 項目        | デフォルト  | 説明                                                                                             |
| ----------- | ----------- | ------------------------------------------------------------------------------------------------ |
| `apiKey`    | `undefined` | [OpenAI](https://platform.openai.com/account/api-keys)で生成したAPIキー                          |
| `generate`  | `1`         | 生成するコミットメッセージの数                                                                   |
| `locale`    | `en`        | コミットメッセージの生成で使用する[ロケール](https://wikipedia.org/wiki/List_of_ISO_639-1_codes) |
| `timeout`   | `10000`     | `OpenAI`へのネットワークリクエストのタイムアウト(ミリ秒)                                         |
| `type`      | `undefined` | 生成するコミットメッセージのタイプ                                                               |
| `model`     | `gpt-4`     | コミットメッセージの生成で使用する`OpenAI`の[モデル](https://platform.openai.com/docs/models)    |
| `maxLength` | `50`        | 生成されるコミットメッセージの最大文字数                                                         |

## プロンプト

プロンプトを取得するには、次のように実行します。

```sh
ai-commit prompt get
```

デフォルトのプロンプトは、下記の通りです。

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
> `{{ locale }}`や`{{ maxLength }}`は、コンフィグで設定した値が挿入されます。

プロンプトを更新するには、次のように実行します。

```sh
ai-commit prompt set
```

プロンプトをリセットするには、次のように実行します。

```sh
ai-commit prompt reset
```

## ライセンス

MIT © [Hirotomo Yamada](https://github.com/hirotomoyamada)
