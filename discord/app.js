const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { token, frcapi, mainhostname } = require('./config.json');
const fs = require('fs');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
var EventEmitter = require("events").EventEmitter;
var https = require('follow-redirects').https;
client.once('ready', () => {
	console.log('Ready!');
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

//emote string array
const stringzero = [`${etwo}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empend}`,`${etwo}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empend}`,`${etwo}${eten}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empend}`,`${etwo}${eseven}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empend}`,`${etwo}${eseven}${eten}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empend}`,`${etwo}${eseven}${eseven}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empend}`,`${etwo}${eseven}${eseven}${eten}${empmid}${empmid}${empmid}${empmid}${empmid}${empend}`,`${etwo}${eseven}${eseven}${eseven}${empmid}${empmid}${empmid}${empmid}${empmid}${empend}`,`${etwo}${eseven}${eseven}${eseven}${eten}${empmid}${empmid}${empmid}${empmid}${empend}`,`${etwo}${eseven}${eseven}${eseven}${eseven}${empmid}${empmid}${empmid}${empmid}${empend}`,`${ethirteen}${esix}${esix}${esix}${esix}${enine}${empmid}${empmid}${empmid}${empend}`,`${ethirteen}${esix}${esix}${esix}${esix}${esix}${empmid}${empmid}${empmid}${empend}`,`${ethirteen}${esix}${esix}${esix}${esix}${esix}${enine}${empmid}${empmid}${empend}`,`${ethirteen}${esix}${esix}${esix}${esix}${esix}${esix}${empmid}${empmid}${empend}`,`${ethirteen}${esix}${esix}${esix}${esix}${esix}${esix}${enine}${empmid}${empend}`,`${ethirteen}${esix}${esix}${esix}${esix}${esix}${esix}${esix}${empmid}${empend}`,`${eone}${efive}${efive}${efive}${efive}${efive}${efive}${efive}${eeight}${empend}`,`${eone}${efive}${efive}${efive}${efive}${efive}${efive}${efive}${efive}${empend}`,`${eone}${efive}${efive}${efive}${efive}${efive}${efive}${efive}${efive}${ethree}`,`${eone}${efive}${efive}${efive}${efive}${efive}${efive}${efive}${efive}${efour}`];

//check if JSON
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
    const season = interaction.options.getInteger('season');
    const eventcode = interaction.options.getString('eventcode');
    const teamnum = interaction.options.getInteger('teamnum');
    const tlevel = interaction.options.getString('tlevel');
    var dbody = new EventEmitter();
    var options = {
      'method': 'GET',
      'hostname': 'frc-api.firstinspires.org',
      'path': `/v3.0/${season}/schedule/${eventcode}?teamNumber=${teamnum}&tournamentLevel=${tlevel}`,
      'headers': {
        'Authorization': 'Basic ' + frcapi
      },
      'maxRedirects': 20
    };
    
    var req = https.request(options, function (res) {
      var chunks = [];
    
      res.on("data", function (chunk) {
        chunks.push(chunk);
      });
    
      res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        data = body;
        dbody.emit('update');
      });
    
      res.on("error", function (error) {
        console.error(error);
      });
    });
    req.end();
    dbody.on('update', function () {
      if (invalidJSON(data)) {
        console.log(data);
        interaction.reply({ content: 'invalid input, or i messed it up', ephemeral: true });
        console.log('potential error ' + season + eventcode + teamnum + tlevel)
      } else {
      const outputget = JSON.parse(data);
      const matchEmbed = new MessageEmbed()
      .setColor('#ff00ff')
      .setTitle(`${outputget.Schedule[0].description}`)
      .setThumbnail('https://www.firstinspires.org/sites/default/files/uploads/resource_library/brand/thumbnails/FRC-Vertical.png')
      .addFields(
        { name: 'Red 1', value: `${outputget.Schedule[0].teams[0].teamNumber}`, inline: true },
        { name: 'Red 2', value: `${outputget.Schedule[0].teams[1].teamNumber}`, inline: true },
        { name: 'Red 3', value: `${outputget.Schedule[0].teams[2].teamNumber}`, inline: true },
        { name: '\u200B', value: '\u200B', inline: false },
        { name: 'Blue 1', value: `${outputget.Schedule[0].teams[3].teamNumber}`, inline: true },
        { name: 'Blue 2', value: `${outputget.Schedule[0].teams[4].teamNumber}`, inline: true },
        { name: 'Blue 3', value: `${outputget.Schedule[0].teams[5].teamNumber}`, inline: true },
      )
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
      const collector = interaction.channel.createMessageComponentCollector({ filter: filter, time: 60000 });
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
            .addFields(
              { name: 'Red 1', value: `${outputget.Schedule[matchno].teams[0].teamNumber}`, inline: true },
              { name: 'Red 2', value: `${outputget.Schedule[matchno].teams[1].teamNumber}`, inline: true },
              { name: 'Red 3', value: `${outputget.Schedule[matchno].teams[2].teamNumber}`, inline: true },
              { name: '\u200B', value: '\u200B', inline: false },
              { name: 'Blue 1', value: `${outputget.Schedule[matchno].teams[3].teamNumber}`, inline: true },
              { name: 'Blue 2', value: `${outputget.Schedule[matchno].teams[4].teamNumber}`, inline: true },
              { name: 'Blue 3', value: `${outputget.Schedule[matchno].teams[5].teamNumber}`, inline: true },
            )
            .setTimestamp()
          await i.deferUpdate()
          await i.editReply({embeds: [matchEmbedu], components: [actrow]});
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
            .addFields(
              { name: 'Red 1', value: `${outputget.Schedule[matchno].teams[0].teamNumber}`, inline: true },
              { name: 'Red 2', value: `${outputget.Schedule[matchno].teams[1].teamNumber}`, inline: true },
              { name: 'Red 3', value: `${outputget.Schedule[matchno].teams[2].teamNumber}`, inline: true },
              { name: '\u200B', value: '\u200B', inline: false },
              { name: 'Blue 1', value: `${outputget.Schedule[matchno].teams[3].teamNumber}`, inline: true },
              { name: 'Blue 2', value: `${outputget.Schedule[matchno].teams[4].teamNumber}`, inline: true },
              { name: 'Blue 3', value: `${outputget.Schedule[matchno].teams[5].teamNumber}`, inline: true },
            )
            .setTimestamp()
          await i.deferUpdate()
          await i.editReply({embeds: [matchEmbedu], components: [actrow]});
        }
      });
      //end btn processing
      interaction.reply({ embeds: [matchEmbed], components: [actrow]});
    }
    });
	} else if (interaction.commandName === 'data') {
    const season = interaction.options.getInteger('season');
    const eventcode = interaction.options.getString('eventcode');
    const teamnum = interaction.options.getInteger('teamnum');
    var dbody = new EventEmitter();
    var options = {
      'method': 'GET',
      'hostname': mainhostname,
      'path': `/scout/lazyapi.php?season=${season}&teamnum=${teamnum}&event=${eventcode}`,
      'maxRedirects': 20
    };
    
    var req = https.request(options, function (res) {
      var chunks = [];
    
      res.on("data", function (chunk) {
        chunks.push(chunk);
      });
    
      res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        data = body;
        dbody.emit('update');
      });
    
      res.on("error", function (error) {
        console.error(error);
      });
    });
    req.end();
    dbody.on('update', function () {
      const outputget = JSON.parse(data);
      if (outputget.upperavg == 0) {
        var upperavg = `Team ${teamnum} does not shoot in the upper hub`;
        var upperacc = `Team ${teamnum} does not shoot in the upper hub`;
      } else {
        var upperavg = `Team ${teamnum} shoots about ${outputget.upperavg} upper hub shots per game`;
        var upperacc = `Team ${teamnum} shoots in the upper hub with an accuracy of ${outputget.upperacc}%`;
      }
      if (outputget.loweravg == 0) {
        var loweravg = `Team ${teamnum} does not shoot in the lower hub`;
        var loweracc = `Team ${teamnum} does not shoot in the lower hub`;
      } else {
        var loweravg = `Team ${teamnum} shoots about ${outputget.loweravg} lower hub shots per game`;
        var loweracc = `Team ${teamnum} shoots in the lower hub with an accuracy of ${outputget.loweracc}%`;
      }
      var upperavgr = Math.round(outputget.upperacc);
      var loweravgr = Math.round(outputget.loweracc);

      var upperavgdt = upperavgr/5;
      var loweravgdt = loweravgr/5;

      var upperavgrr = Math.round(upperavgdt);
      var loweravgrr = Math.round(loweravgdt); 

      if (!stringzero[upperavgrr]) {
        var upperavgtof = `${efoutreen}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empend}`
      } else {
        var upperavgtof = stringzero[upperavgrr];
      }
      if (!stringzero[loweravgrr]) {
          var loweravgtof = `${efoutreen}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empmid}${empend}`
      } else {
          var loweravgtof = stringzero[loweravgrr];
      }

      const teamEmbed = new MessageEmbed()
      .setColor('#ff00ff')
      .setTitle(`${outputget.teamnum}`)
      .setThumbnail('https://www.firstinspires.org/sites/default/files/uploads/resource_library/brand/thumbnails/FRC-Vertical.png')
      .addFields(
        { name: 'Event Code', value: `${outputget.event}`, inline: true },
        { name: 'Year', value: `${season}`, inline: true },
        { name: 'Upper Average Made', value: `${upperavg}`, inline: false },
        { name: 'Upper Accuracy', value: `${upperacc} \n${upperavgtof}`, inline: false },
        { name: 'Lower Average Made', value: `${loweravg}`, inline: false },
        { name: 'Lower Accuracy', value: `${loweracc}\n${loweravgtof}`, inline: false },
        { name: 'Climbs to Most Frequently', value: `${outputget.climbs}`, inline: false }
      )
      .setTimestamp()
      interaction.reply({ embeds: [teamEmbed]});
    });
  }
});

client.login(token);