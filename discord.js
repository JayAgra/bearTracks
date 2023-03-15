const { Client, EmbedBuilder, GatewayIntentBits, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const sqlite3 = require('sqlite3');
let db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE, (err) => {});
const seasonData = require("./2023.js");

function logInfo(info) {
    console.log('\x1b[36m', '[DISCORD BOT]   ' ,'\x1b[0m' + '\x1b[32m', '  [INFO] ' ,'\x1b[0m' + info)
}

function logErrors(errortodisplay) {
    console.log('\x1b[36m', '[DISCORD BOT]   ' ,'\x1b[0m' + '\x1b[31m', '  [', '\x1b[0m\x1b[41m', 'ERROR', '\x1b[0m\x1b[31m', '] ' ,'\x1b[0m' + errortodisplay);
    console.log('╰─> ' + Date.now);
}

if (!fs.existsSync('config.example.json') && !fs.existsSync('config.json')) {
    logErrors('Could not find config.json! Fill out config.example.json and rename it to config.json');
    logInfo('Killing');
    process.exit();
} else {logInfo('Found config.json file!');}

if (fs.statSync("config.json").size < 300) {
    logErrors('The file config.json seems to be empty! Please fill it out.');
    logInfo('Killing');
    process.exit();
} else {logInfo('The file config.json seems to be filled out');}

//safe to require config.json
const { token, frcapi, scoutteama, scoutteamb, leadscout, drive, pit, myteam, season, currentComp, baseURL } = require('./config.json');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: []
});
var EventEmitter = require("events").EventEmitter;
var https = require('follow-redirects').https;

client.once(Events.ClientReady, () => {
    client.user.setActivity("the 766 Ws", { type: "WATCHING" });
    logInfo('Ready!');
    logInfo(new Date());
});

//emotes
const trollface = "<:tf:1061411458027618375>"; //trollface

//function to check if JSON is valid
function invalidJSON(str) {
  try {
      JSON.parse(str);
      return false
  } catch (error) {
      return true
  }
}

function defaultSeason(fallback) {
    if (fallback == null || typeof fallback == 'undefined') {
        return season;
    } else {
        return fallback;
    }
}

function defaultEvent(fallback, interaction) {
    if (fallback == null || typeof fallback == 'undefined') {
        if (currentComp == "NONE") {
            return interaction.reply({
                content: "We are not competing, you must specify an event code.",
                ephemeral: true
            })
        }
        return currentComp;
    } else {
        return fallback;
    }
}

function newSubmission(formType, Id, scoutIP, scoutName) {
    //you need to set channel yourslef!
    const channel = client.channels.cache.get('400355158502014977');
    channel.send(`New ${formType} submission, ID: ${Id}.\n${scoutName}:${scoutIP}`);
    return;
}

async function sendPasswordToUser(userID, password, email) {
    client.users.send(userID, `A password has been set for your account to use with email login if you would like.\nThe password is for team ${myteam}'s scouting app.\n\nEmail: ` + "`" + email + "`" + `\nPassword: ` + "`" + password + "`")
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === 'matches') {

    var opseason;
    if (typeof interaction.options.getInteger('season') == 'undefined') {
        opseason = season;
    } else {
        opseason = interaction.options.getInteger('season');
    }

    var eventcode;
    if (typeof interaction.options.getString('eventcode') == 'undefined') {
        if (currentComp == "NONE") {
            interaction.reply({
                content: "We are not competing, you must specify an event code.",
                ephemeral: true
            })
            return;
        }
        eventcode = currentComp;
    } else {
        eventcode = interaction.options.getString('eventcode');
    }

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
              logErrors(data)
              interaction.reply({
                  content: 'invalid input, or i messed it up',
                  ephemeral: true
              });
              logErrors(`${opseason} - ${eventcode} - ${teamnum} - ${tlevel}`);
          } else {
              const outputget = JSON.parse(data);
              const matchEmbed = new EmbedBuilder()
                  .setColor(0x68C3E2)
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
                  })
                  .setTimestamp();
              //button defs
              const actrow = new ActionRowBuilder()
                  .addComponents(
                      new ButtonBuilder()
                      .setCustomId('prev')
                      .setStyle(ButtonStyle.Primary)
                      .setLabel('Previous')
                  )
                  .addComponents(
                      new ButtonBuilder()
                      .setCustomId('next')
                      .setStyle(ButtonStyle.Primary)
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
                      const matchEmbedu = new EmbedBuilder()
                          .setColor(0x68C3E2)
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
                          })
                          .setTimestamp();
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
                      const matchEmbedu = new EmbedBuilder()
                          .setColor(0x68C3E2)
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
                          })
                          .setTimestamp();
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
                logErrors('Could not send message');
            }
          }
      });
  } else if (interaction.commandName === 'data') {
    var opseason = defaultSeason(interaction.options.getInteger('season'));

    var eventcode = defaultEvent(interaction.options.getString('eventcode'), interaction)

    const teamnum = interaction.options.getInteger('teamnum');

    try {
        seasonData.teamData(opseason, teamnum, eventcode, interaction);
    } catch (error) {
        logErrors('Could not send message');
        interaction.reply({
            content: `There was an unexpected error! ${error}`,
            ephemeral: true
        })
    }
  } else if (interaction.commandName === 'pit') {
    var opseason = defaultSeason(interaction.options.getInteger('season'));

    var eventcode = defaultEvent(interaction.options.getString('eventcode'), interaction);

    const teamnum = interaction.options.getInteger('teamnum');

    try {
        seasonData.pitData(opseason, teamnum, eventcode, interaction);
    } catch (error) {
        logErrors('Could not send message');
        interaction.reply({
            content: `There was an unexpected error! ${error}`,
            ephemeral: true
        })
    }
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
              interaction.reply({
                  content: `You do not have permission to use this command.\nTo use this command, you must have the Lead Scout role (${leadscout}), even if you are an admin or a server owner!`,
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
    var opseason = defaultSeason(interaction.options.getInteger('season'))
    defaultEvent("aaa", interaction)
    var eventcode = defaultEvent(interaction.options.getString('eventcode'), interaction)
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
              logErrors(data);
              interaction.reply({
                  content: `Invalid inputs, or the FRC API failed to respond`,
                  ephemeral: true
              });
              logErrors('potential error ' + opseason + eventcode)
          } else {
              const outputget = JSON.parse(data);
              const rankEmbed = new EmbedBuilder()
                  .setColor(0x68C3E2)
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
              const actrow = new ActionRowBuilder()
                  .addComponents(
                      new ButtonBuilder()
                      .setCustomId('prev2')
                      .setStyle(ButtonStyle.Primary)
                      .setLabel('<<')
                  )
                  .addComponents(
                      new ButtonBuilder()
                      .setCustomId('prev')
                      .setStyle(ButtonStyle.Success)
                      .setLabel('<')
                  )
                  .addComponents(
                      new ButtonBuilder()
                      .setCustomId(`${myteam}`)
                      .setStyle(ButtonStyle.Danger)
                      .setLabel(`${myteam}`)
                  )
                  .addComponents(
                      new ButtonBuilder()
                      .setCustomId('next')
                      .setStyle(ButtonStyle.Success)
                      .setLabel('>')
                  )
                  .addComponents(
                      new ButtonBuilder()
                      .setCustomId('next2')
                      .setStyle(ButtonStyle.Primary)
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
                      const rankEmbedu = new EmbedBuilder()
                          .setColor(0x68C3E2)
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
                      const rankEmbedu = new EmbedBuilder()
                          .setColor(0x68C3E2)
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
                              logInfo(teamdata);
                              interaction.reply({
                                  content: 'invalid input, or i messed it up',
                                  ephemeral: true
                              });
                          } else {
                              const outputgetteam = JSON.parse(teamdata);
                              rankno = outputgetteam.Rankings[0].rank - 1;
                          }
                      });
                      logInfo(rankno);
                      const rankEmbedu = new EmbedBuilder()
                          .setColor(0x68C3E2)
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
  } else if (interaction.commandName === 'info') {
    var os = require('os');
    var si = require('systeminformation');
    const cpu = await si.cpu();
    const disk = (await si.diskLayout())[0];
    const diskGB = Math.round(disk.size / 1024 / 1024 / 1024);
    async function pingWebServer() {
        var stats = await require('ping').promise.probe(baseURL);
        return stats.time;
    }
    async function pingFRCAPI() {
        var stats =  await require('ping').promise.probe('https://frc-api.firstinspires.org/');
        return stats.time;
     }
    const infoEmbed = new EmbedBuilder()
        .setColor(0x68C3E2)
        .setTitle(`App Info`)
        .addFields({
            name: 'Version: ',
            value: `**NodeJS**: ${process.version}\n**${require('./package.json').name}**: ${require('./package.json').version}`,
            inline: true
        }, {
            name: 'Latency: ',
            value: `**Scouting Web**: ${await pingWebServer()}\n**FRC API**: ${await pingFRCAPI()}\nDiscord API: ${Math.round(client.ws.ping)}ms\n**This message**: ${Date.now() - interaction.createdTimestamp}ms`,
            inline: false
        }, {
            name: "Hardware: ",
            value: `**Memory:** ${os.freemem()} of ${os.totalmem()} (${((1-(os.freemem()/os.totalmem()))*100).toFixed(2)}% used)\n**Load Avg** (1m, 5m, 15m): ${((os.loadavg()[0])*100).toFixed(2)}%, ${((os.loadavg()[1])*100).toFixed(2)}%, ${((os.loadavg()[2])*100).toFixed(2)}%\n**CPU**: ${cpu.manufacturer}/${cpu.brand} (${cpu.cores} cores at ${cpu.speed} GHz)\n**Disk**: ${diskGB} GB (${disk.vendor}/${disk.name}, ${disk.type}, interface ${disk.interfaceType})`,
            inline: false
        })
        .setTimestamp()
    interaction.reply({
        embeds: [infoEmbed]
    });
    } else if (interaction.commandName === 'slots') {
        const stmt = `SELECT score FROM scouts WHERE discordID=?`;
        const values = [interaction.user.id];
        db.get(stmt, values, (err, dbQueryResult) => {
          if (err) {
            interaction.reply({
                content: 'Error finding you in the database!',
                ephemeral: true
            });
            return;
          } else {
            if (typeof dbQueryResult == "undefined") {
                interaction.reply({
                    content: 'You are not signed in to the scouting app!',
                    ephemeral: true
                });
            } else {
                if (dbQueryResult.score >= 25) {
                    let pointDeductStmt = `UPDATE scouts SET score = score - 25 WHERE discordID=?`;
                    let pointDeductValues = [interaction.user.id];
                    db.run(pointDeductStmt, pointDeductValues, function(err) {
                        if (err) {
                            interaction.reply({
                                content: 'Error removing points, betting failed!',
                                ephemeral: true
                            });
                        } else {
                            function ifUndefinedZero (num) {if (num == undefined) {return 0;} else {return num}}
                            function getRandomInt(min, max) {
                                min = Math.ceil(min);
                                max = Math.floor(max);
                                return Math.floor(Math.random() * (max - min) + min);
                              }                              
                            var array = [];
                            const result = getRandomInt(0,16).toString(2).split('');
                            array.push(ifUndefinedZero(result[3]))
                            array.push(ifUndefinedZero(result[2]))
                            array.push(ifUndefinedZero(result[1]))
                            array.push(ifUndefinedZero(result[0]))
                            if (array.join('') == '0000' || array.join('') == '1111') {
                                let addWinPointsStmt = `UPDATE scouts SET score = score + 766 WHERE discordID=?`;
                                let addWinPointsVals = [interaction.user.id];
                                db.run(addWinPointsStmt, addWinPointsVals, function(err) {});
                                interaction.reply({
                                    content: `You won 766 points.\nRoll: ${array.join(' - ')}\nYou now have ${dbQueryResult.score} points`,
                                    ephemeral: true
                                });
                            } else {
                                interaction.reply({
                                    content: `You lost.\nRoll: ${array.join(' - ')}`,
                                    ephemeral: true
                                });
                            }
                        }
                    });
                } else {
                    interaction.reply({
                        content: `You only have ${dbQueryResult.score} points. You need 50 to gamble.`,
                        ephemeral: true
                    });
                }
            }
          }
        });
    } else {
      interaction.reply({
          content: 'You have been lied to.\nThis feature is not yet supported because the devs are on strike.\nThey need people to understand that macOS is the superior operating system. You can end this strike endlessly insulting every Windows user you know.',
          ephemeral: true
      });
  }
});


//login to discord
client.login(token);

module.exports = { newSubmission, sendPasswordToUser };