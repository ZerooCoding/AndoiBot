const { imdbKey } = require("./config.json");
const imdb = require("imdb-api");
const Discord = require("discord.js");
const fs = require("fs");
const token = require(`./config.json`);
const { Client, MessageEmbed, Guild, ShardingManager } = require("discord.js");
const { GiveawaysManager } = require("discord-giveaways");
const client = new Discord.Client({
  disableMentions: "everyone",
  partials: ["MESSAGE", "REACTION", "USER", "GUILD_MEMBER"],
  ws: {
    properties: { $browser: "Discord Android" },
  },
});
require("./utils/user")(client);
const check = client.emojis.cache.find((emoji) => emoji.name === "andoiCheck");
const cross = client.emojis.cache.find((emoji) => emoji.name === "andoiCross");
client.cross = cross;
client.check = check;
const { Player } = require("discord-player");
require("./utils/client")(client);
const emotes = require("./JSON/emojis.json");
const { init } = require("./utils/mongoose");
const filters = require("./JSON/filters.json");
client.emotes = emotes;
client.filters = filters;
const player = new Player(client);
client.player = player;
init();
const { sendErrorLog } = require("./utils/functions");
require("./utils/config.js")(client);
const logs = require("discord-logs");
logs(client);
const d = require('dblapi.js')
const dbl = new d("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcyODY5NDM3NTczOTE2MjY4NSIsImJvdCI6dHJ1ZSwiaWF0IjoxNjAxODkxNTQyfQ.nDIyXm8MqKAzgcpMtO2JkntRvnmLA3FOVnirYnszjmA", client)
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();
client.aliases = new Discord.Collection();
client.queue = new Map();
client.on('ready', () => {
  setInterval(() => {
    dbl.postStats(client.guilds.size);
}, 1800000);

})
client.snipes = new Map();
client.afk = new Map();
client.imdb = new imdb.Client({ apiKey: imdbKey });
client.config = require("./config.json");
const GiveawayManagerWithShardSupport = class extends GiveawaysManager {
  // Refresh storage method is called when the database is updated on one of the shards
  async refreshStorage() {
    // This should make all shard refreshing their cache with the updated database
    return client.shard.broadcastEval(() =>
      this.giveawaysManager.getAllGiveaways()
    );
  }
};

// Create a new instance of your new class
const manager = new GiveawayManagerWithShardSupport(client, {
  storage: "./src/giveaways.json",
  updateCountdownEvery: 10000,
  default: {
    botsCanWin: false,
    exemptPermissions: ["MANAGE_MESSAGES", "ADMINISTRATOR"],
    embedColor: "#FF0000",
    reaction: "🎉",
  },
});

client.giveawaysManager = manager;

["command"].forEach((handler) => {
  require(`./handlers/${handler}`)(client);
});

require("./handlers/event")(client);
process.on("unhandledRejection", (error) =>
  sendErrorLog(client, error, "error")
);

process.on("uncaughtExceptionMonitor", (error) =>
  sendErrorLog(client, error, "error")
);
process.on("warning", (warning) => sendErrorLog(client, warning, "warning"));
client.login(token.Token);
player

  // Send a message when a track starts
  .on("trackStart", (message, track) =>
    message.channel.send(`Now playing ${track.title}...`)
  )

  // Send a message when something is added to the queue
  .on("trackAdd", (message, queue, track) =>
    message.channel.send(`${track.title} has been added to the queue!`)
  )
  .on("playlistAdd", (message, queue, playlist) =>
    message.channel.send(
      `${playlist.title} has been added to the queue (${playlist.items.length} songs)!`
    )
  )

  // Send messages to format search results
  .on("searchResults", (message, query, tracks) => {
    const embed = new Discord.MessageEmbed()
      .setAuthor(`Here are your search results for ${query}!`)
      .setDescription(tracks.map((t, i) => `${i + 1}. ${t.title}`))
      .setFooter("Send the number of the song you want to play!");
    message.channel.send(embed);
  })
  .on("searchInvalidResponse", (message, query, tracks, content, collector) =>
    message.channel.send(
      `You must send a valid number between 1 and ${tracks.length}!`
    )
  )
  .on("searchCancel", (message, query, tracks) =>
    message.channel.send(
      "You did not provide a valid response... Please send the command again!"
    )
  )
  .on("noResults", (message, query) =>
    message.channel.send(`No results found on YouTube for ${query}!`)
  )

  // Send a message when the music is stopped
  .on("queueEnd", (message, queue) =>
    message.channel.send(
      "Music stopped as there is no more music in the queue!"
    )
  )
  .on("channelEmpty", (message, queue) =>
    message.channel.send(
      "Music stopped as there is no more member in the voice channel!"
    )
  )
  .on("botDisconnect", (message) =>
    message.channel.send(
      "Music stopped as I have been disconnected from the channel!"
    )
  )

  // Error handling
  .on("error", (error, message) => {
    switch (error) {
      case "NotPlaying":
        message.channel.send("There is no music being played on this server!");
        break;
      case "NotConnected":
        message.channel.send("You are not connected in any voice channel!");
        break;
      case "UnableToJoin":
        message.channel.send(
          "I am not able to join your voice channel, please check my permissions!"
        );
        break;
      default:
        message.channel.send(`Something went wrong... Error: ${error}`);
    }
  });
