require('dotenv').config();
const express = require('express');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');
const axios = require('axios');
const { VoiceConnection } = require('@discordjs/voice');
const { Client } = require('discord.js');

const app = express();
const client = new Client();

const APPLICATION_ID = process.env.APPLICATION_ID;
const TOKEN = process.env.TOKEN;
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set';
const GUILD_ID = process.env.GUILD_ID;

const discord_api = axios.create({
  baseURL: 'https://discord.com/api/',
  timeout: 3000,
  headers: {
    "Authorization": `Bot ${TOKEN}`
  }
});

app.use(express.json());

let voiceConnection = null;

// Slashコマンドを登録する関数
async function registerSlashCommands() {
  let slash_commands = [
    {
      "name": "join",
      "description": "ボイスチャンネルに参加します。"
    },
    {
      "name": "bye",
      "description": "ボイスチャンネルから退出します。"
    }
  ];
  
  try {
    let discord_response = await discord_api.put(
      `/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`,
      slash_commands
    );
    console.log(discord_response.data);
    return true;
  } catch(e) {
    console.error(e.code);
    console.error(e.response?.data);
    return false;
  }
}

// Slashコマンドの登録を実行
registerSlashCommands();

app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
  const interaction = req.body;

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    if(interaction.data.name === 'join') {
      // 以前のコードをここに追加
    }

    if(interaction.data.name === 'bye') {
      // 以前のコードをここに追加
    }
  }
});

client.on('messageCreate', async (message) => {
  // 以前のコードをここに追加
});

app.get('/', async (req,res) =>{
  return res.send('ドキュメントに従ってください。');
});

client.login(TOKEN);

app.listen(8999, () => {
  console.log('サーバーがポート8999で実行されています。');
});
