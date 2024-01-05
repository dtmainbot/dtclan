const { Message } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const ClanManagerSchema = require('../../../schemas/clanManagerSchema');
const ClansSchema = require('../../../schemas/ClansSchema');

module.exports = {
    structure: {
        name: 'moveclan',
        description: 'Move all clan members to the clan voice channel.',
        aliases: ['clanmove'],
        permissions: 'SendMessages',
        cooldown: 20000,
    },
    /**
     * @param {ExtendedClient} client
     * @param {Message} message
     * @param {[String]} args
     */
    run: async (message) => {
        try {
            // Check if the user has the clan leader role
            const guildId = message.guild.id;
            const clanManagerData = await ClanManagerSchema.findOne({ guildId });

            if (!clanManagerData || !message.member.roles.cache.has(clanManagerData.clanLeaderRoleId)) {
                return message.reply('- <a:attention1:1184524624793448498> You do not have the necessary role to use this command.');
            }

            // Get the clan details for the clan leader
            const clanData = await ClansSchema.findOne({ guildId, clanLeaderId: message.author.id });

            if (!clanData) {
                return message.reply('- <a:attention1:1184524624793448498> You are not the leader of any clan in this server.');
            }

            // Get the clan voice channel ID
            const clanVoiceChannelId = clanData.clanVoiceChannelId;

            // Get connected members in voice channels
            const voiceChannelMembers = message.guild.channels.cache
                .get(clanVoiceChannelId)
                .members.map((member) => member.id);

            // Move only clan members who are connected to voice channels
            for (const member of clanData.members) {
                if (voiceChannelMembers.includes(member.userId)) {
                    const guildMember = await message.guild.members.fetch(member.userId);
                    guildMember.voice.setChannel(clanVoiceChannelId);
                }
            }

            message.reply('- <a:attention1:1184524624793448498> Connected clan members moved to the clan voice channel.');
        } catch (error) {
            console.error(error);
            message.reply('- <a:attention1:1184524624793448498> An error occurred while processing your request.');
        }
    },
};
