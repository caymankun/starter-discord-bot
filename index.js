const express = require('express');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');
require('dotenv').config();
const APPLICATION_ID = process.env.APPLICATION_ID;
const TOKEN = process.env.TOKEN;
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set';
const GUILD_ID = process.env.GUILD_ID;
const axios = require('axios');
const { google } = require('googleapis');
const textToSpeech = google.texttospeech('v1');

const app = express();

app.use(express.json());

const discord_api = axios.create({
  baseURL: 'https://discord.com/api/',
  timeout: 3000,
  headers: {
    "Authorization": `Bot ${TOKEN}`
  }
});

app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
  const interaction = req.body;

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    if(interaction.data.name == 'readaloud'){
      const textToRead = interaction.data.options.find(opt => opt.name === 'text').value;
      const voiceChannelId = interaction.member.voice.channel_id;
      
      if (!voiceChannelId) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "You are not in a voice channel!",
          },
        });
      }

      const voiceChannel = req.client.channels.cache.get(voiceChannelId);
      if (!voiceChannel || voiceChannel.type !== 'voice') {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Cannot find your voice channel!",
          },
        });
      }

      try {
        const audioContent = await generateSpeech(textToRead);
        voiceChannel.join().then(async connection => {
          const dispatcher = connection.play(audioContent, { type: 'opus' });
          dispatcher.on('finish', () => {
            voiceChannel.leave();
          });
        });
      } catch (error) {
        console.error('Error:', error);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "An error occurred while processing the text to speech.",
          },
        });
      }

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Text is being read aloud in the voice channel.",
        },
      });
    }
  }
});

app.get('/register_commands', async (req,res) =>{
  let slash_commands = [
    {
      "name": "readaloud",
      "description": "Reads aloud the provided text in the voice channel",
      "options": [
        {
          "name": "text",
          "description": "Text to be read aloud",
          "type": 3,
          "required": true
        }
      ]
    }
  ]
  try
  {
    let discord_response = await discord_api.put(
      `/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`,
      slash_commands
    )
    console.log(discord_response.data)
    return res.send('Commands have been registered')
  }catch(e){
    console.error(e.code)
    console.error(e.response?.data)
    return res.send(`${e.code} error from Discord`)
  }
});

app.get('/', async (req,res) =>{
  return res.send('Follow documentation ')
})

app.listen(8999, () => {
  console.log('Server running on port 8999');
});

async function generateSpeech(text) {
  const request = {
    input: { text: text },
    voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
    audioConfig: { audioEncoding: 'OGG_OPUS' },
  };
  const [response] = await textToSpeech.synthesizeSpeech(request);
  return response.audioContent;
}
