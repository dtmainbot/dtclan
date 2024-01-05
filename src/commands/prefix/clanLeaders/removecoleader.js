const { EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const ClanManagerSchema = require('../../../schemas/clanManagerSchema');
const ClansModel = require('../../../schemas/ClansSchema');


module.exports = {
    structure: {
        name: 'removecol',
        description: 'Remove a co-leader from your clan.',
        aliases: [`removecoleader`],
        permissions: 'SendMessages',
        cooldown: 20000
    },
    /**
     * @param {ExtendedClient} client
     * @param {Message} message
     * @param {[String]} args
     */
    run: async (client, message, args) => {
        // Check if the user provided a valid user ID or mention
        const userId = args[0].replace(/<@!?(.*)>/, '$1');

        if (!userId) {
            return message.reply({content: '- <a:attention1:1184524624793448498> Please provide a valid user ID or mention.', flags: [ 4096 ]});
        }

        try {
            // Check if the user executing the command is a clan leader
            const guildId = message.guild.id;
            const clanLeaderId = message.author.id;
            const clan = await ClansModel.findOne({ 'members.userId': clanLeaderId, guildId }).exec();

            if (clan && clanLeaderId === clan.clanLeaderId) {
                // User executing the command is a clan leader
                const guildSettings = await ClanManagerSchema.findOne({ guildId });
                const clanCoLeaderRoleId = guildSettings.clanCoLeaderRoleId;

                // Check if the user to be removed as a co-leader is a co-leader
                if (clan.coLeaders.includes(userId)) {
                    // Remove the user from the co-leaders
                    clan.coLeaders = clan.coLeaders.filter(coLeader => coLeader !== userId);
                    await clan.save();

                    // Remove the clan co-leader role from the user
                    const member = message.guild.members.cache.get(userId);
                    if (member && clanCoLeaderRoleId) {
                        const clanCoLeaderRole = message.guild.roles.cache.get(clanCoLeaderRoleId);
                        if (clanCoLeaderRole) {
                            await member.roles.remove(clanCoLeaderRole).catch(error => {
                                console.error(`- Error removing clan co-leader role from ${userId}:`, error);
                            });
                        }
                    }

                    // Send an embed to the clan logs channel
                    const clanLogsChannel = message.guild.channels.cache.get(guildSettings.clanLogsChannelId);

                    const embed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('Co-Leader Removed')
                        .setDescription(`Leader <@${clanLeaderId}> removed <@${userId}> as a co-leader from the clan.`)
                        .addFields(
                            {
                                name: 'Clan Name',
                                value: clan.name,
                                inline: true,
                            },
                            {
                                name: 'Clan Key',
                                value: clan.clanKey,
                                inline: true,
                            }
                        )
                        .setTimestamp()
                        .setFooter({
                            text: `Server: ${message.guild.name}`,
                            iconURL: message.guild.iconURL(),
                        });

                    clanLogsChannel.send({ embeds: [embed] });

                    message.reply({content: `User <@${userId}> has been removed as a co-leader from the clan.`, flags: [ 4096 ]});
                } else {
                    message.reply({content: '- <a:attention1:1184524624793448498> The specified user is not a co-leader in the clan.', flags: [ 4096 ]});
                }
            } else {
                // User executing the command is not a clan leader
                message.reply({content: 'You do not have the necessary roles to use this command.', flags: [ 4096 ]});
            }
        } catch (error) {
            console.error('Error removing co-leader:', error);
            message.reply({content: '- <a:attention1:1184524624793448498> An error occurred while removing the co-leader.', flags: [ 4096 ]});
        }
    }
};
