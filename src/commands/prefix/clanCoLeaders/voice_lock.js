const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const ClanManagerSchema = require('../../../schemas/clanManagerSchema');
const ClansSchema = require('../../../schemas/ClansSchema');
const config = require('../../../config');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: {
        name: 'voicelock',
        description: 'Lock the clan voice channel to prevent members from connecting.',
        aliases: ['lockvoice'],
        cooldown: 8000,
    },
    /**
     * @param {ExtendedClient} client
     * @param {Message} message
     * @param {[String]} args
     */
    run: async (client, message, args) => {
        // Check if the user executing the command is a clan leader or co-leader
        const guildId = message.guild.id;
        const clanManagerSettings = await ClanManagerSchema.findOne({ guildId });

        if (!clanManagerSettings) {
            return message.reply({ content: 'Clan management settings not found for this server.', flags: [4096] });
        }

        const { clanLeaderRoleId, clanCoLeaderRoleId } = clanManagerSettings;
        const member = message.guild.members.cache.get(message.author.id);

        if (!member.roles.cache.has(clanLeaderRoleId) && !member.roles.cache.has(clanCoLeaderRoleId)) {
            return message.reply({ content: '- You do not have the necessary role to execute this command.', flags: [4096] });
        }

        // Retrieve clan information from the database
        const clanInfo = await getClanInfo(guildId, message);
        if (!clanInfo) {
            return; // Error message already handled in getClanInfo
        }

        const clanVoiceChannelId = clanInfo.clanVoiceChannelId;

        // Update permissions for the voice channel
        const clanVoiceChannel = message.guild.channels.cache.get(clanVoiceChannelId);

        try {
            // Update permissions for everyone role
            await clanVoiceChannel.permissionOverwrites.edit(message.guild.roles.everyone, {
                Connect: false,
            });

            // Update permissions for clan role
            const clanRoleId = clanInfo.clanRoleId;
            const clanRole = message.guild.roles.cache.get(clanRoleId);

            if (clanRole) {
                await clanVoiceChannel.permissionOverwrites.edit(clanRole, {
                    Connect: false,
                });
            }

            const successembed = new EmbedBuilder()
                .setDescription(`- ✅Clan voice channel locked. Members can no longer connect.`)
                .setColor(config.color)
                .setFooter({ text: message.author.username, iconURL: message.author.avatarURL() });

            message.reply({ embeds: [successembed], flags: [4096] });
        } catch (error) {
            console.error(`Error locking clan voice channel: ${error.message}`);
            message.reply('- An error occurred while locking the clan voice channel.');
        }
    },
};

// Helper function to retrieve clan information from the database
async function getClanInfo(guildId, message) {
    const clanInfo = await ClansSchema.findOne({ guildId });
    if (!clanInfo) {
        message.reply({ content: '- Clan information not found for this server.', flags: [4096] });
        return null;
    }
    return clanInfo;
}
