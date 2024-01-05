const { EmbedBuilder } = require('discord.js');
const ClanManagerSchema = require('../../../schemas/clanManagerSchema');
const config = require('../../../config');

module.exports = {
    structure: {
        name: 'check',
        description: 'Check clan management settings.',
        aliases: [`setupcheck`],
        //permissions: 'Administrator',
        cooldown: 20000
    },
    /**
     * @param {ExtendedClient} client
     * @param {Message} message
     * @param {[String]} args
     */
    run: async (client, message, args) => {
        try {
            // Check if the user has administrator permissions
            if (!message.member.permissions.has('Administrator')) {
                return message.reply({content: '- <a:attention1:1184524624793448498> You do not have the required permissions to use this command.', flags: [ 4096 ]});
            }

            // Fetch clan management settings for the current guild
            const guildSettings = await ClanManagerSchema.findOne({ guildId: message.guild.id });

            if (!guildSettings) {
                return message.reply({content: '- <a:attention1:1184524624793448498> Clan Manager settings not configured for this server.', flags: [ 4096 ]});
            }

            // Create an embed with the clan management settings information using MessageEmbed
            const embed = new EmbedBuilder()
                .setColor(config.color)
                .setThumbnail(message.guild.iconURL())
                .setFields(
                    { name: '<:whitearmorr:1184508816952410174> ┃ `Clan Manager Role`', value: `<@&${guildSettings.clanManagerRoleId}>`, inline: true },
                    { name: '<:whitecrown:1184508553357172786> ┃ `Clan Leader Role`', value: `<@&${guildSettings.clanLeaderRoleId}>`, inline: true },
                    { name: '<:whitemem1:1184509056711405639> ┃ `Clan Co-Leader Role`', value: `<@&${guildSettings.clanCoLeaderRoleId}>`, inline: true },
                    { name: '<:voicegreen:1184558172292255845> ┃ `Clan Voices Category`', value: `<#${guildSettings.clanVoicesCategoryId}>`, inline: true },
                    { name: '<:chatwhite:1184558428778139658> ┃ `Clan Chat Category`', value: `<#${guildSettings.clanChatVoicesCategoryId}>`, inline: true },
                    { name: '<:hachtagwhite:1184558674354647123> ┃ `Clan Logs Channel`', value: `<#${guildSettings.clanLogsChannelId}>`, inline: true },
                )
                .setAuthor({
                    name: `${message.guild.name}`,
                    iconURL: message.guild.iconURL(),
                    })
                .setFooter({
                    text: `Requested By: ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL(),
                    });
                   

            message.channel.send({ embeds: [embed], flags: [ 4096 ] });
        } catch (error) {
            console.error('- Error checking clan management settings:', error);
            message.reply('- <a:attention1:1184524624793448498> An error occurred while checking clan management settings.');
        }
    },
};
