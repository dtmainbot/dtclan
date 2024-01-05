const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const ClanManagerSchema = require('../../../schemas/clanManagerSchema');
const ClansSchema = require('../../../schemas/ClansSchema');
const config = require('../../../config');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: {
        name: 'chatlock',
        description: 'Lock the clan chat to prevent members from sending messages.',
        aliases: ['lockchat'],
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

        const clanChatChannelId = clanInfo.clanChatChannelId;

        // Update permissions for the chat channel
        const clanChatChannel = message.guild.channels.cache.get(clanChatChannelId);

        try {
            // Update permissions for everyone role
            await clanChatChannel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: false,
            });

            // Update permissions for clan role
            const clanRoleId = clanInfo.clanRoleId;
            const clanRole = message.guild.roles.cache.get(clanRoleId);

            if (clanRole) {
                await clanChatChannel.permissionOverwrites.edit(clanRole, {
                    SendMessages: false,
                });
            }

            const succesembed = new EmbedBuilder()
                .setDescription(`- ✅ Clan chat locked. Members can no longer send messages.`)
                .setColor(config.color)
                .setFooter({ text: message.author.username, iconURL: message.author.avatarURL() });

            message.reply({ embeds: [succesembed], flags: [4096] });
        } catch (error) {
            console.error(`Error locking clan chat: ${error.message}`);
            message.reply('- An error occurred while locking the clan chat.');
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
