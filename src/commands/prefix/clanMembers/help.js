const { Message, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require(`../../../config`);

module.exports = {
    structure: {
        name: 'help',
        description: 'Get the help of the bot',
        aliases: [`clanhelp`],
        permissions: 'SendMessages',
        cooldown: 20000
    },
    /**
     * @param {ExtendedClient} client 
     * @param {Message} message 
     * @param {[String]} args 
     */
    run: async (client, message, args) => {
        const helpEmbed = new EmbedBuilder()
            .setColor(config.color)
            .setAuthor({name: message.guild.name + ` World Clan Manager Help`, iconURL: `https://cdn.discordapp.com/emojis/1190730054238482493.gif`})
            .setDescription(`<a:Abluecrown:1190730953090416780> \`-\` Click a button To get the help you want!\n`)
            .setImage('https://media.discordapp.net/attachments/1184519586733891737/1190729162349084762/samuraiX.jpg')
            .setFooter({
                text: `${message.guild.name}'s World. - Clans • Powered By: KwaYLen`,
                iconURL: message.author.displayAvatarURL(),
            });


        message.channel.send({ embeds: [helpEmbed], flags: [ 4096 ], components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('members_help')
                            .setEmoji(`<:whitemember:1184508156718633021>`)
                            .setLabel('Members')
                            .setStyle(1),
                        new ButtonBuilder()
                            .setCustomId('clancoleaders_help')
                            .setEmoji(`<:whitemem1:1184509056711405639>`)
                            .setLabel('Co Leaders')
                            .setStyle(1),
                        new ButtonBuilder()
                            .setCustomId('clanleaders_help')
                            .setEmoji(`<:whitecrown:1184508553357172786>`)
                            .setLabel('Leaders')
                            .setStyle(1),
                        new ButtonBuilder()
                            .setCustomId('clanmanager_help')
                            .setEmoji(`<:whitecrown:1184508553357172786>`)
                            .setLabel('Manager')
                            .setStyle(1),
                        new ButtonBuilder()
                            .setCustomId('administrator_help')
                            .setEmoji(`<:whitearmorr:1184508816952410174>`)
                            .setLabel('𝙰𝙳𝙼𝙸𝙽')
                            .setStyle(4)
                    ),
        ] });
    }
};
