const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton, CommandInteractionOptionResolver } = require('discord.js');
const fs = require('fs');
var datetime = new Date();
const sqlite3 = require('sqlite3');

const {
  exec } = require('child_process');

if (!fs.existsSync('config.example.json') && fs.existsSync('config.json')) {
    console.log('\x1b[36m', '[DISCORD BOT]   ' ,'\x1b[0m' + '\x1b[31m', '  [', '\x1b[0m\x1b[41m', 'ERROR', '\x1b[0m\x1b[31m', '] ' ,'\x1b[0m' + 'Could not finf config.json! Fill out config.example.json and rename it to config.json');
    console.log('\x1b[36m', '[DISCORD BOT]   ' ,'\x1b[0m' + '\x1b[31m', '  [', '\x1b[0m\x1b[41m', 'ERROR', '\x1b[0m\x1b[31m', '] ' ,'\x1b[0m' + 'Killing');
    process.exit();
} else {console.log('\x1b[36m', '[DISCORD BOT]   ' ,'\x1b[0m' + '\x1b[32m', '  [INFO] ' ,'\x1b[0m' + 'Found config.json file!');}

if (fs.statSync("config.json").size < 300) {
    console.log('\x1b[36m', '[DISCORD BOT]   ' ,'\x1b[0m' + '\x1b[31m', '  [', '\x1b[0m\x1b[41m', 'ERROR', '\x1b[0m\x1b[31m', '] ' ,'\x1b[0m' + 'The file config.json seems to be empty! Please fill it out.');
    console.log('\x1b[36m', '[DISCORD BOT]   ' ,'\x1b[0m' + '\x1b[31m', '  [', '\x1b[0m\x1b[41m', 'ERROR', '\x1b[0m\x1b[31m', '] ' ,'\x1b[0m' + 'Killing');
    process.exit();
} else {console.log('\x1b[36m', '[DISCORD BOT]   ' ,'\x1b[0m' + '\x1b[32m', '  [INFO] ' ,'\x1b[0m' + 'The file config.json seems to be filled out');}

//safe to require config.json
const { token, frcapi, scoutteama, scoutteamb, leadscout, drive, pit, myteam, repoUrl, botOwnerUserID, season, currentComp } = require('./config.json');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS]
});
var EventEmitter = require("events").EventEmitter;
var https = require('follow-redirects').https;
var CronJob = require('cron').CronJob;
var lodash = require('lodash');
const { error } = require('console');
client.once('ready', () => {
  console.log('\x1b[36m', '[DISCORD BOT]   ' ,'\x1b[0m' + '\x1b[32m', '  [INFO] ' ,'\x1b[0m' + 'Ready!');
  console.log('\x1b[36m', '[DISCORD BOT]   ' ,'\x1b[0m' + '\x1b[32m', '  [INFO] ' ,'\x1b[0m' + datetime);
});

//emotes
const eone = "<:01:964216829969068053>";
const etwo = "<:02:964216829683847179>";
const ethree = "<:03:964216830048759818>";
const efour = "<:04:964216829637701694>";
const efive = "<:05:964216830120067182>";
const esix = "<:06:964216830061334618>";
const eseven = "<:07:964216830040371290>";
const eeight = "<:08:964216830392696852>";
const enine = "<:09:964216829767712810>";
const eten = "<:10:964216830174572614>";
const empend = "<:empend:964263842899181609>"; //etwelve
const empmid = "<:empmid:964263842869809152>"; //eeleven
const ethirteen = "<:13:964307653121683577>";
const efoutreen = "<:14:964322741866094602>";
const trollface = "<:tf:1061411458027618375>"; //trollface

//emote string array
const stringzero = [`${etwo}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empend}`, 
  `${etwo}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empend}`, 
  `${etwo}${eten}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empend}`, 
  `${etwo}${eseven}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empend}`, 
  `${etwo}${eseven}${eten}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empend}`, 
  `${etwo}${eseven}${eseven}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empend}`, 
  `${etwo}${eseven}${eseven}${eten}${empmid}${empmid}${empmid}${empmid}${empmid}${empend}`, 
  `${etwo}${eseven}${eseven}${eseven}${empmid}${empmid}${empmid}${empmid}${empmid}${empend}`, 
  `${etwo}${eseven}${eseven}${eseven}${eten}${empmid}${empmid}${empmid}${empmid}${empend}`, 
  `${etwo}${eseven}${eseven}${eseven}${eseven}${empmid}${empmid}${empmid}${empmid}${empend}`, 
  `${ethirteen}${esix}${esix}${esix}${esix}${enine}${empmid}${empmid}${empmid}${empend}`, 
  `${ethirteen}${esix}${esix}${esix}${esix}${esix}${empmid}${empmid}${empmid}${empend}`, 
  `${ethirteen}${esix}${esix}${esix}${esix}${esix}${enine}${empmid}${empmid}${empend}`, 
  `${ethirteen}${esix}${esix}${esix}${esix}${esix}${esix}${empmid}${empmid}${empend}`, 
  `${ethirteen}${esix}${esix}${esix}${esix}${esix}${esix}${enine}${empmid}${empend}`, 
  `${ethirteen}${esix}${esix}${esix}${esix}${esix}${esix}${esix}${empmid}${empend}`,
  `${eone}${efive}${efive}${efive}${efive}${efive}${efive}${efive}${eeight}${empend}`, 
  `${eone}${efive}${efive}${efive}${efive}${efive}${efive}${efive}${efive}${empend}`, 
  `${eone}${efive}${efive}${efive}${efive}${efive}${efive}${efive}${efive}${ethree}`, 
  `${eone}${efive}${efive}${efive}${efive}${efive}${efive}${efive}${efive}${efour}`];

//function to check if JSON is valid
function invalidJSON(str) {
  try {
      JSON.parse(str);
      return false
  } catch (error) {
      return true
  }
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === 'matches') {
    var opseason;
    if (typeof(interaction.options.getInteger('season')) == undefined) {
        opseason = season;
    } else {
        opseason = interaction.options.getInteger('season');
    }
      const eventcode = interaction.options.getString('eventcode');
      const teamnum = interaction.options.getInteger('teamnum');
      const tlevel = interaction.options.getString('tlevel');
      var dbody = new EventEmitter();
      var options = {
          'method': 'GET',
          'hostname': 'frc-api.firstinspires.org',
          'path': `/v3.0/${opseason}/schedule/${eventcode.toUpperCase()}?teamNumber=${teamnum}&tournamentLevel=${tlevel}`,
          'headers': {
              'Authorization': 'Basic ' + frcapi
          },
          'maxRedirects': 20
      };

      var req = https.request(options, function(res) {
          var chunks = [];

          res.on("data", function(chunk) {
              chunks.push(chunk);
          });

          res.on("end", function(chunk) {
              var body = Buffer.concat(chunks);
              data = body;
              dbody.emit('update');
          });

          res.on("error", function(error) {
              console.error(error);
          });
      });
      req.end();
      dbody.on('update', function() {
          if (invalidJSON(data)) {
              console.log('\x1b[36m', '[DISCORD BOT] ' ,'\x1b[0m' + data);
              interaction.reply({
                  content: 'invalid input, or i messed it up',
                  ephemeral: true
              });
              console.log('\x1b[36m', '[DISCORD BOT] ' ,'\x1b[0m' + 'potential error ' + opseason + eventcode + teamnum + tlevel)
          } else {
              const outputget = JSON.parse(data);
              const matchEmbed = new MessageEmbed()
                  .setColor('#ff00ff')
                  .setTitle(`${outputget.Schedule[0].description}`)
                  .setThumbnail('https://www.firstinspires.org/sites/default/files/uploads/resource_library/brand/thumbnails/FRC-Vertical.png')
                  .addFields({
                      name: 'Red 1',
                      value: `${outputget.Schedule[0].teams[0].teamNumber}`,
                      inline: true
                  }, {
                      name: 'Red 2',
                      value: `${outputget.Schedule[0].teams[1].teamNumber}`,
                      inline: true
                  }, {
                      name: 'Red 3',
                      value: `${outputget.Schedule[0].teams[2].teamNumber}`,
                      inline: true
                  }, {
                      name: '\u200B',
                      value: '\u200B',
                      inline: false
                  }, {
                      name: 'Blue 1',
                      value: `${outputget.Schedule[0].teams[3].teamNumber}`,
                      inline: true
                  }, {
                      name: 'Blue 2',
                      value: `${outputget.Schedule[0].teams[4].teamNumber}`,
                      inline: true
                  }, {
                      name: 'Blue 3',
                      value: `${outputget.Schedule[0].teams[5].teamNumber}`,
                      inline: true
                  }, )
                  .setTimestamp()
              //button defs
              const actrow = new MessageActionRow()
                  .addComponents(
                      new MessageButton()
                      .setCustomId('prev')
                      .setStyle('PRIMARY')
                      .setLabel('Previous')
                  )
                  .addComponents(
                      new MessageButton()
                      .setCustomId('next')
                      .setStyle('PRIMARY')
                      .setLabel('Next')
                  )
              //end btns start btn processing
              var matchno = 0;
              const filter = i => i.customId === 'next' || 'prev' && i.user.id === interaction.user.id;
              const collector = interaction.channel.createMessageComponentCollector({
                  filter: filter,
                  time: 60000
              });
              collector.on('collect', async i => {
                  if (i.customId === 'next') {
                      var testvar = matchno + 1
                      if (typeof outputget.Schedule[testvar] !== 'undefined') {
                          var updatedp = matchno + 1;
                      } else {
                          var updatedp = matchno;
                      }
                      matchno = updatedp;
                      const matchEmbedu = new MessageEmbed()
                          .setColor('#ff00ff')
                          .setTitle(`${outputget.Schedule[matchno].description}`)
                          .setThumbnail('https://www.firstinspires.org/sites/default/files/uploads/resource_library/brand/thumbnails/FRC-Vertical.png')
                          .addFields({
                              name: 'Red 1',
                              value: `${outputget.Schedule[matchno].teams[0].teamNumber}`,
                              inline: true
                          }, {
                              name: 'Red 2',
                              value: `${outputget.Schedule[matchno].teams[1].teamNumber}`,
                              inline: true
                          }, {
                              name: 'Red 3',
                              value: `${outputget.Schedule[matchno].teams[2].teamNumber}`,
                              inline: true
                          }, {
                              name: '\u200B',
                              value: '\u200B',
                              inline: false
                          }, {
                              name: 'Blue 1',
                              value: `${outputget.Schedule[matchno].teams[3].teamNumber}`,
                              inline: true
                          }, {
                              name: 'Blue 2',
                              value: `${outputget.Schedule[matchno].teams[4].teamNumber}`,
                              inline: true
                          }, {
                              name: 'Blue 3',
                              value: `${outputget.Schedule[matchno].teams[5].teamNumber}`,
                              inline: true
                          }, )
                          .setTimestamp()
                      await i.deferUpdate()
                      await i.editReply({
                          embeds: [matchEmbedu],
                          components: [actrow]
                      });
                  }
                  if (i.customId === 'prev') {
                      if (matchno > 0) {
                          var updated = matchno - 1;
                      } else {
                          var updated = matchno;
                      }
                      matchno = updated;
                      const matchEmbedu = new MessageEmbed()
                          .setColor('#ff00ff')
                          .setTitle(`${outputget.Schedule[matchno].description}`)
                          .setThumbnail('https://www.firstinspires.org/sites/default/files/uploads/resource_library/brand/thumbnails/FRC-Vertical.png')
                          .addFields({
                              name: 'Red 1',
                              value: `${outputget.Schedule[matchno].teams[0].teamNumber}`,
                              inline: true
                          }, {
                              name: 'Red 2',
                              value: `${outputget.Schedule[matchno].teams[1].teamNumber}`,
                              inline: true
                          }, {
                              name: 'Red 3',
                              value: `${outputget.Schedule[matchno].teams[2].teamNumber}`,
                              inline: true
                          }, {
                              name: '\u200B',
                              value: '\u200B',
                              inline: false
                          }, {
                              name: 'Blue 1',
                              value: `${outputget.Schedule[matchno].teams[3].teamNumber}`,
                              inline: true
                          }, {
                              name: 'Blue 2',
                              value: `${outputget.Schedule[matchno].teams[4].teamNumber}`,
                              inline: true
                          }, {
                              name: 'Blue 3',
                              value: `${outputget.Schedule[matchno].teams[5].teamNumber}`,
                              inline: true
                          }, )
                          .setTimestamp()
                      await i.deferUpdate()
                      await i.editReply({
                          embeds: [matchEmbedu],
                          components: [actrow]
                      });
                  }
              });
              //end btn processing
            try {
              interaction.reply({
                  embeds: [matchEmbed],
                  components: [actrow]
              });
            } catch (error) {
                console.log('\x1b[36m', '[DISCORD BOT]   ' ,'\x1b[0m' + '\x1b[31m', '  [', '\x1b[0m\x1b[41m', 'ERROR', '\x1b[0m\x1b[31m', '] ' ,'\x1b[0m' + 'Could not send message');
            }
          }
      });
  } else if (interaction.commandName === 'data') {
    var opseason;
    if (typeof(interaction.options.getInteger('season')) == undefined) {
        opseason = season;
    } else {
        opseason = interaction.options.getInteger('season');
    }
    const eventcode = interaction.options.getString('eventcode');
    const teamnum = interaction.options.getInteger('teamnum');
    //fetch data from the database
    //see what season
    //decide how to make embed based off season
    //create embed
    //send embed
    try {
    interaction.reply({
        embeds: []
    });
    } catch (error) {
        console.log('\x1b[36m', '[DISCORD BOT]   ' ,'\x1b[0m' + '\x1b[31m', '  [', '\x1b[0m\x1b[41m', 'ERROR', '\x1b[0m\x1b[31m', '] ' ,'\x1b[0m' + 'Could not send message');
    }
  } else if (interaction.commandName === 'pit') {
    var opseason;
    if (typeof(interaction.options.getInteger('season')) == undefined) {
        opseason = season;
    } else {
        opseason = interaction.options.getInteger('season');
    }
    const eventcode = interaction.options.getString('eventcode');
    const teamnum = interaction.options.getInteger('teamnum');
    //fetch data from the database
    //see what season
    //decide how to make embed based off season
    //create embed
    //send embed
    interaction.reply({
        embeds: [pitEmbed]
    });
  } else if (interaction.commandName === 'addscout') {
      if (interaction.member.id != interaction.options.getUser('user').id) {
          if (interaction.member.roles.cache.some(r => r.id == `${leadscout}`)) {
              //even if user is server owner, they MUST have the lead scout role!
              const user = interaction.guild.members.cache.get(interaction.options.getUser('user').id)
              const targetedgroup = interaction.options.getString('group');
              if (targetedgroup === "Scout A") {
                  user.roles.add(`${scoutteama}`);
              } else if (targetedgroup === "Scout B") {
                  user.roles.add(`${scoutteamb}`);
              } else if (targetedgroup === "Drive") {
                  user.roles.add(`${drive}`);
              } else if (targetedgroup === "Pit") {
                  user.roles.add(`${pit}`);
              } else {
                  interaction.reply({
                      content: 'An error occurred! The bot got an invalid input, or another unexpected error occurred.',
                      ephemeral: true
                  });
              }
              interaction.reply({
                  content: `Added ${interaction.options.getUser('user')} to ${targetedgroup}`,
                  ephemeral: true
              });
          } else {
              var adjective = ["are less intelligent", "have less brainpower", "are more terrifying", "have less honor"];
              var thing = ["member of team 254", "porcupine", "discord moderator", "farm animal"];

              var a, ad;
              var a = adjective[Math.floor(Math.random() * 4)];
              var ad = thing[Math.floor(Math.random() * 4)];
              var insult = "You " + a + " than a " + ad + ".";

              interaction.reply({
                  content: `You do not have permission to use this command.\nTo use this command, you must have the Lead Scout role (${leadscout}), even if you are an admin or a server owner!\n${insult}`,
                  ephemeral: true
              });
          }
      } else {
          //allow users to add roles to themselves, but not to others
          const user = interaction.guild.members.cache.get(interaction.options.getUser('user').id)
          const targetedgroup = interaction.options.getString('group');
          if (targetedgroup === "Scout A") {
              user.roles.add(`${scoutteama}`);
          } else if (targetedgroup === "Scout B") {
              user.roles.add(`${scoutteamb}`);
          } else if (targetedgroup === "Drive") {
              user.roles.add(`${drive}`);
          } else if (targetedgroup === "Pit") {
              user.roles.add(`${pit}`);
          } else {
              interaction.reply({
                  content: 'An error occurred! The bot got an invalid input, or another unexpected error occurred.',
                  ephemeral: true
              });
          }
          interaction.reply({
              content: `Added ${interaction.options.getUser('user')} to ${targetedgroup}`,
              ephemeral: true
          });
      }
  } else if (interaction.commandName === 'rankings') {
    var opseason;
    if (typeof(interaction.options.getInteger('season')) == undefined) {
        opseason = season;
    } else {
        opseason = interaction.options.getInteger('season');
    }
      const eventcode = interaction.options.getString('eventcode');
      var dbody = new EventEmitter();
      var options = {
          'method': 'GET',
          'hostname': 'frc-api.firstinspires.org',
          'path': `/v3.0/${opseason}/rankings/${eventcode}`,
          'headers': {
              'Authorization': 'Basic ' + frcapi
          },
          'maxRedirects': 20
      };

      var req = https.request(options, function(res) {
          var chunks = [];

          res.on("data", function(chunk) {
              chunks.push(chunk);
          });

          res.on("end", function(chunk) {
              var body = Buffer.concat(chunks);
              data = body;
              dbody.emit('update');
          });

          res.on("error", function(error) {
              console.error(error);
          });
      });
      req.end();
      dbody.on('update', function() {
          if (invalidJSON(data)) {
              console.log('\x1b[36m', '[DISCORD BOT] ' ,'\x1b[0m' + data);
              interaction.reply({
                  content: 'invalid input, or i messed it up',
                  ephemeral: true
              });
              console.log('\x1b[36m', '[DISCORD BOT] ' ,'\x1b[0m' + 'potential error ' + opseason + eventcode + teamnum + tlevel)
          } else {
              const outputget = JSON.parse(data);
              const rankEmbed = new MessageEmbed()
                  .setColor('#ff00ff')
                  .setTitle(`${eventcode} team rankings`)
                  .setThumbnail('https://www.firstinspires.org/sites/default/files/uploads/resource_library/brand/thumbnails/FRC-Vertical.png')
                  .setDescription(`Rank ${outputget.Rankings[0].rank}: ${outputget.Rankings[0].teamNumber}`)
                  .addFields({
                      name: 'Wins: ',
                      value: `${outputget.Rankings[0].wins}`,
                      inline: true
                  }, {
                      name: 'Losses: ',
                      value: `${outputget.Rankings[0].losses}`,
                      inline: true
                  }, {
                      name: 'Ties: ',
                      value: `${outputget.Rankings[0].ties}`,
                      inline: true
                  }, {
                      name: '\u200B',
                      value: '\u200B'
                  }, {
                      name: 'Average Qualification Score: ',
                      value: `${outputget.Rankings[0].qualAverage}`,
                      inline: true
                  }, {
                      name: 'Matches Played: ',
                      value: `${outputget.Rankings[0].matchesPlayed}`,
                      inline: true
                  })
                  .setTimestamp()
                  .setFooter({
                      text: 'Data from FRC API'
                  });

              //button defs
              const actrow = new MessageActionRow()
                  .addComponents(
                      new MessageButton()
                      .setCustomId('prev2')
                      .setStyle('PRIMARY')
                      .setLabel('<<')
                  )
                  .addComponents(
                      new MessageButton()
                      .setCustomId('prev')
                      .setStyle('SUCCESS')
                      .setLabel('<')
                  )
                  .addComponents(
                      new MessageButton()
                      .setCustomId(`${myteam}`)
                      .setStyle('DANGER')
                      .setLabel(`${myteam}`)
                  )
                  .addComponents(
                      new MessageButton()
                      .setCustomId('next')
                      .setStyle('SUCCESS')
                      .setLabel('>')
                  )
                  .addComponents(
                      new MessageButton()
                      .setCustomId('next2')
                      .setStyle('PRIMARY')
                      .setLabel('>>')
                  )
              //end btns start btn processing
              var rankno = 0;
              const filter = i => i.customId === 'next' || 'prev' || 'next2' || 'prev2' || `${myteam}` && i.user.id === interaction.user.id;
              const collector = interaction.channel.createMessageComponentCollector({
                  filter: filter,
                  time: 60000
              });
              collector.on('collect', async i => {
                  if (i.customId === 'next' || i.customId === 'next2') {
                      var testvar;
                      if (i.customId === 'next') {
                          testvar = rankno + 1
                      } else {
                          testvar = rankno + 5
                      }
                      if (typeof outputget.Rankings[testvar] !== 'undefined') {
                          var updatedp = testvar;
                      } else {
                          var updatedp = rankno;
                      }
                      rankno = updatedp;
                      const rankEmbedu = new MessageEmbed()
                          .setColor('#ff00ff')
                          .setTitle(`${eventcode} team rankings`)
                          .setThumbnail('https://www.firstinspires.org/sites/default/files/uploads/resource_library/brand/thumbnails/FRC-Vertical.png')
                          .setDescription(`Rank ${outputget.Rankings[rankno].rank}: ${outputget.Rankings[rankno].teamNumber}`)
                          .addFields({
                              name: 'Wins: ',
                              value: `${outputget.Rankings[rankno].wins}`,
                              inline: true
                          }, {
                              name: 'Losses: ',
                              value: `${outputget.Rankings[rankno].losses}`,
                              inline: true
                          }, {
                              name: 'Ties: ',
                              value: `${outputget.Rankings[rankno].ties}`,
                              inline: true
                          }, {
                              name: '\u200B',
                              value: '\u200B'
                          }, {
                              name: 'Average Qualification Score: ',
                              value: `${outputget.Rankings[rankno].qualAverage}`,
                              inline: true
                          }, {
                              name: 'Matches Played: ',
                              value: `${outputget.Rankings[rankno].matchesPlayed}`,
                              inline: true
                          })
                          .setTimestamp()
                          .setFooter({
                              text: 'Data from FRC API'
                          });
                      await i.deferUpdate()
                      await i.editReply({
                          embeds: [rankEmbedu],
                          components: [actrow]
                      });
                  }
                  if (i.customId === 'prev' || i.customId === 'prev2') {
                      var testvar;
                      if (i.customId === 'prev') {
                          testvar = rankno - 1
                      } else {
                          testvar = rankno - 5
                      }
                      if (typeof outputget.Rankings[testvar] !== 'undefined') {
                          var updatedp = testvar;
                      } else {
                          var updatedp = rankno;
                      }
                      rankno = updatedp;
                      const rankEmbedu = new MessageEmbed()
                          .setColor('#ff00ff')
                          .setTitle(`${eventcode} team rankings`)
                          .setThumbnail('https://www.firstinspires.org/sites/default/files/uploads/resource_library/brand/thumbnails/FRC-Vertical.png')
                          .setDescription(`Rank ${outputget.Rankings[rankno].rank}: ${outputget.Rankings[rankno].teamNumber}`)
                          .addFields({
                              name: 'Wins: ',
                              value: `${outputget.Rankings[rankno].wins}`,
                              inline: true
                          }, {
                              name: 'Losses: ',
                              value: `${outputget.Rankings[rankno].losses}`,
                              inline: true
                          }, {
                              name: 'Ties: ',
                              value: `${outputget.Rankings[rankno].ties}`,
                              inline: true
                          }, {
                              name: '\u200B',
                              value: '\u200B'
                          }, {
                              name: 'Average Qualification Score: ',
                              value: `${outputget.Rankings[rankno].qualAverage}`,
                              inline: true
                          }, {
                              name: 'Matches Played: ',
                              value: `${outputget.Rankings[rankno].matchesPlayed}`,
                              inline: true
                          })
                          .setTimestamp()
                          .setFooter({
                              text: 'Data from FRC API'
                          });
                      await i.deferUpdate()
                      await i.editReply({
                          embeds: [rankEmbedu],
                          components: [actrow]
                      });
                  }
                  if (i.customId === `${myteam}`) {
                      var dbodyteam = new EventEmitter();
                      var options = {
                          'method': 'GET',
                          'hostname': 'frc-api.firstinspires.org',
                          'path': `/v3.0/${season}/rankings/${eventcode}?teamNumber=${myteam}`,
                          'headers': {
                              'Authorization': 'Basic ' + frcapi
                          },
                          'maxRedirects': 20
                      };
                      var req = https.request(options, function(res) {
                          var teamchunks = [];

                          res.on("data", function(chunk) {
                              teamchunks.push(chunk);
                          });

                          res.on("end", function(chunk) {
                              var teambody = Buffer.concat(teamchunks);
                              teamdata = teambody;
                              dbodyteam.emit('update');
                          });

                          res.on("error", function(error) {
                              console.error(error);
                          });
                      });
                      req.end();
                      dbodyteam.on('update', function() {
                          if (invalidJSON(teamdata)) {
                              console.log('\x1b[36m', '[DISCORD BOT] ' ,'\x1b[0m' + teamdata);
                              interaction.reply({
                                  content: 'invalid input, or i messed it up',
                                  ephemeral: true
                              });
                          } else {
                              const outputgetteam = JSON.parse(teamdata);
                              rankno = outputgetteam.Rankings[0].rank - 1;
                          }
                      });
                      console.log('\x1b[36m', '[DISCORD BOT] ' ,'\x1b[0m' + rankno);
                      const rankEmbedu = new MessageEmbed()
                          .setColor('#ff00ff')
                          .setTitle(`${eventcode} team rankings`)
                          .setThumbnail('https://www.firstinspires.org/sites/default/files/uploads/resource_library/brand/thumbnails/FRC-Vertical.png')
                          .setDescription(`Rank ${outputget.Rankings[rankno].rank}: ${outputget.Rankings[rankno].teamNumber}`)
                          .addFields({
                              name: 'Wins: ',
                              value: `${outputget.Rankings[rankno].wins}`,
                              inline: true
                          }, {
                              name: 'Losses: ',
                              value: `${outputget.Rankings[rankno].losses}`,
                              inline: true
                          }, {
                              name: 'Ties: ',
                              value: `${outputget.Rankings[rankno].ties}`,
                              inline: true
                          }, {
                              name: '\u200B',
                              value: '\u200B'
                          }, {
                              name: 'Average Qualification Score: ',
                              value: `${outputget.Rankings[rankno].qualAverage}`,
                              inline: true
                          }, {
                              name: 'Matches Played: ',
                              value: `${outputget.Rankings[rankno].matchesPlayed}`,
                              inline: true
                          })
                          .setTimestamp()
                          .setFooter({
                              text: 'Data from FRC API'
                          });
                      await i.deferUpdate();
                      await i.editReply({
                          embeds: [rankEmbedu],
                          components: [actrow]
                      });
                  }
              });
              //end btn processing
              interaction.reply({
                  embeds: [rankEmbed],
                  components: [actrow]
              });
          }
      });
  } else if (interaction.commandName === 'pitscout') {
    if (currentComp == "NONE") {
        interaction.reply({
            content: 'we are not in a comp!',
            ephemeral: true
        });
    } else {
      var dbody = new EventEmitter();
      var options = {
          'method': 'GET',
          'hostname': 'frc-api.firstinspires.org',
          'path': `/v3.0/${season}/teams?eventCode=${currentComp}`,
          'headers': {
              'Authorization': 'Basic ' + frcapi
          },
          'maxRedirects': 20
      };

      var req = https.request(options, function(res) {
          var chunks = [];

          res.on("data", function(chunk) {
              chunks.push(chunk);
          });

          res.on("end", function(chunk) {
              var body = Buffer.concat(chunks);
              data = body;
              dbody.emit('update');
          });

          res.on("error", function(error) {
              console.error(error);
          });
      });
      req.end();
      dbody.on('update', function() {
          if (invalidJSON(data)) {
              console.log('\x1b[36m', '[DISCORD BOT] ' ,'\x1b[0m' + data);
              interaction.reply({
                  content: 'invalid input, or i messed it up',
                  ephemeral: true
              });
              console.log('\x1b[36m', '[DISCORD BOT] ' ,'\x1b[0m' + 'potential error ' + season + eventcode)
          } else {
            const outputget = JSON.parse(data);
            var listOfTeams;
            for (let i = 1; i < outputget.teamCountTotal; i++){
                listOfTeams += `${outputget.i.teamNumber}\n`
            }
            const teamList = new MessageEmbed()
            .setColor('#ff00ff')
            .setTitle(`Teams to scout`)
            .setThumbnail('https://www.firstinspires.org/sites/default/files/uploads/resource_library/brand/thumbnails/FRC-Vertical.png')
            .setDescription(`List of teams in the current comp (${season}:${currentComp})`)
            .addFields({
                name: 'To Scout:',
                value: `${listOfTeams}`,
                inline: false
            }, {
                name: 'Scouted: ',
                value: `${listOfTeams}`,
                //todo
                inline: false
            })
            .setTimestamp()
            .setFooter({
                text: 'Data from FRC API'
            });
          }
        });
  }
  } else if (interaction.commandName === 'frcapi') {
      const requesturl = interaction.options.getString('path');
      var dbody = new EventEmitter();
      var options = {
          'method': 'GET',
          'hostname': 'frc-api.firstinspires.org',
          'path': `${requesturl}`,
          'headers': {
              'Authorization': 'Basic ' + frcapi
          },
          'maxRedirects': 20
      };

      var req = https.request(options, function(res) {
          var chunks = [];

          res.on("data", function(chunk) {
              chunks.push(chunk);
          });

          res.on("end", function(chunk) {
              var body = Buffer.concat(chunks);
              data = body;
              dbody.emit('update');
          });

          res.on("error", function(error) {
              console.error(error);
          });
      });
      req.end();
      dbody.on('update', function() {
          if (invalidJSON(data)) {
              console.log('\x1b[36m', '[DISCORD BOT] ' ,'\x1b[0m' + data);
              interaction.reply({
                  content: 'the FRC API returned invalid data',
                  ephemeral: true
              });
          } else {
              interaction.reply({
                  content: `${data.slice(0,1750)}\n\nand ${data.length - 1750} more characters`,
                  ephemeral: true
              });
          }
      });
  } else if (interaction.commandName === 'update') {
      if (interaction.user.id == botOwnerUserID) {
          exec(`git pull ${repoUrl}`, (error, stdout, stderr) => {
              if (error) {
                  interaction.reply({
                      content: 'could not pull data. error: ' + error,
                      ephemeral: false
                  });
                  return;
              }


                  //move cfg to tmp so it does not get nuked
                  exec("cp config.json config.temp", (error, stdout, stderr) => {
                      if (error) {
                          interaction.reply({
                              content: 'could not save config file, aborted to save it. error: ' + error,
                              ephemeral: false
                          });
                          return;
                      }

                      //reboot
                      exec("npm start", (error, stdout, stderr) => {
                          if (error) {
                              interaction.reply({
                                  content: 'could not restart bot, but files may have been updated. error: ' + error,
                                  ephemeral: false
                              });
                              return;
                          }
                          const updateEmbed = new MessageEmbed()
                              .setColor('#ff00ff')
                              .setTitle(`Bot Updated!`)
                              .setDescription(`Bot services should resume`)
                              .setTimestamp()
                          interaction.reply({
                              embeds: [updateEmbed]
                          });
                      });
              });
          });
      } else {
          interaction.reply({
              content: 'no ' + trollface + '. you are not the bot owner/hoster!',
              ephemeral: true
          });
      }
  } else {
      interaction.reply({
          content: 'You have been lied to.\nThis feature is not yet supported because the devs are on strike.\nThey need people to understand that macOS is the superior operating system. You can end this strike endlessly insulting every Windows user you know.',
          ephemeral: true
      });
  }
});

//login to discord
client.login(token);