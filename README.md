# chatgpt-discord

## Install

Create a `.env` file with the following values:

```ini
DISCORD_BOT_TOKEN="your_token_here"
DISCORD_BOT_ID="your_id_here"
CHATGPT_TOKEN="your_session_token_here"
```

## Usage

Type `>` followed by your prompt in any channel. Your conversation history is saved by your User ID.

Example:

```
>What's Discord?
```

You can clear your history at any time by sending `>!`. History is only saved to the bot host's memory, meaning if the bot goes offline for anything the history is cleared.