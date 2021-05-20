require('dotenv').config();
const discord = require('discord.js');
const { google } = require('googleapis');

const credentials = require("./credentials.json");

(async()=>{
  // configure a JWT auth client
  let auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/calendar',
    ],
  );

  //authenticate request
  await new Promise(r => auth.authorize(err => {
    if (err) {
      console.log(err);
      process.exit(e);
    }
    console.log("Successfully connected!");
    r();
  }));

  const client = new discord.Client();

  client.on('ready', () => console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`));

  client.on('message', msg => {
    if(msg.channel.id !== process.env.CHANNEL_ID) return;
    if(!msg.content.startsWith('-')) return;
    const suggestion = msg.content.substring(1);
    google.sheets('v4').spreadsheets.values.append({
      auth,
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Incoming Suggestions!A2:A',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[msg.author.id, `${msg.author.username}#${msg.author.discriminator}`, new Date(msg.createdTimestamp), suggestion]],
      },
    })
  })

  client.login(process.env.TOKEN);
})();