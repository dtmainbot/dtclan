const { EmbedBuilder } = require('discord.js');
const ClanManagerSchema = require('../../../schemas/clanManagerSchema');
const ClansSchema = require('../../../schemas/ClansSchema');
const config = require('../../../config');

module.exports = {
    structure: {
        name: 'giveclan',
        description: 'transforme your clan ownership to other user',
        aliases: ['clangive'],
        permissions: 'SendMessages',
        cooldown: 30000,
    },
    /**
     * @param {ExtendedClient} client
     * @param {Message} message
     * @param {[String]} args
     */
    run: async (client, message, args) => {
        // Check if the user executing the command has the clan leader role
        const guildId = message.guild.id;
        const clanManagerSettings = await ClanManagerSchema.findOne({ guildId });
        
        if (!clanManagerSettings) {
            return message.channel.send('Clan manager settings not found for this server.');
        }

        const clanLeaderRoleId = clanManagerSettings.clanLeaderRoleId;
        const clanLogsChannelId = clanManagerSettings.clanLogsChannelId;

        if (!message.member.roles.cache.has(clanLeaderRoleId)) {
            return message.channel.send('You do not have the required permissions to use this command.');
        }

        // Check if the user is a clan leader in the server
        const userClan = await ClansSchema.findOne({ guildId, clanLeaderId: message.author.id });

        if (!userClan) {
            return message.channel.send('You are not a clan leader in this server.');
        }

        // Check if a user mention or ID is provided
        const targetUser = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!targetUser) {
            return message.channel.send('Please provide a valid user mention or ID.');
        }

        // Check if the target user is a member of the clan
        const targetUserClan = await ClansSchema.findOne({ guildId, members: { $elemMatch: { userId: targetUser.id } } });

        if (!targetUserClan) {
            return message.channel.send('The target user is not a member of your clan.');
        }

        // Check if the target user is a co-leader
        const isCoLeader = userClan.coLeaders.includes(targetUser.id);

        // Transfer ownership
        userClan.clanLeaderId = targetUser.id;
        userClan.coLeaders = userClan.coLeaders.filter(coLeaderId => coLeaderId !== targetUser.id);

        // Save the updated clan
        await userClan.save();

        // Remove old clan leader role and give new clan leader role
        const oldLeader = message.guild.members.cache.get(message.author.id);
        const newLeader = message.guild.members.cache.get(targetUser.id);

        oldLeader.roles.remove(clanLeaderRoleId);
        newLeader.roles.add(clanLeaderRoleId);

        // Get the clan role of the target user
        const targetUserClanRole = message.guild.roles.cache.get(targetUserClan.clanRoleId);

        // Send embed to logs channel
        const logsChannel = message.guild.channels.cache.get(clanLogsChannelId);

        if (logsChannel) {
            const embed = new EmbedBuilder()
                .setColor('#00FF00') // You can customize the color
                .setTitle('Clan Ownership Transfer')
                .setDescription(`${oldLeader.user.tag} gave the clan ownership to ${newLeader.user.tag}`)
                .addFields(
                    { name: 'Old Leader', value: `<@${oldLeader.user.id}>`, inline: true },
                    { name: 'New Leader', value: `<@${newLeader.user.id}>`, inline: true },
                    { name: 'Clan Role', value: targetUserClanRole || 'Role not found', inline: true },
                )
                .setTimestamp();

            logsChannel.send({ embeds: [embed] });
        }

        // Optionally, you can send a success message
        message.channel.send(`Clan ownership has been transferred from ${oldLeader.user.tag} to ${newLeader.user.tag}.`);
    },
};
