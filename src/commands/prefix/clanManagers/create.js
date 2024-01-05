const { EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const ClansSchema = require('../../../schemas/ClansSchema');
const ClanManagerSchema = require('../../../schemas/clanManagerSchema');

module.exports = {
    structure: {
        name: 'create',
        description: 'Create a new clan.',
        aliases: ['cr'],
        //permissions: 'Administrator',
        //cooldown: 20000
    },
    /**
     * @param {ExtendedClient} client
     * @param {Message} message
     * @param {[String]} args
     */
    run: async (client, message, args) => {
        try {
            // Fetch clan management settings for the current guild
            const guildSettings = await ClanManagerSchema.findOne({ guildId: message.guild.id });

            if (!guildSettings) {
                return message.reply({ content: '- <a:attention1:1184524624793448498> Clan management settings not configured for this server.', flags: [4096] });
            }

            // Parse command arguments
            // Extract the leader ID from the mention
            const leaderMention = args[0];
            const leaderId = leaderMention.replace(/<@!?(.*)>/, '$1');

            // Check if the leader already has a clan in the server
            const existingClan = await ClansSchema.findOne({ guildId: message.guild.id, clanLeaderId: leaderId });

            if (existingClan) {
                return message.reply({ content: '- <a:attention1:1184524624793448498> The specified leader already has a clan in this server.', flags: [4096] });
            }

            // Trim clan name and tag to remove whitespaces and ensure they are within Discord's character limit
            const clanName = args[1];
            const clanVoiceChannelId = args[2];
            const clanChatChannelId = args[3];
            const tag = args.slice(4).join(' ');

            // Check if required parameters are provided
            if (!leaderId || !clanName || !clanVoiceChannelId || !clanChatChannelId || !tag) {
                return message.reply({ content: '- <a:attention1:1184524624793448498> Please provide valid leader ID, clan name, voice channel ID, chat channel ID, and tag.', flags: [4096] });
            }

            // Check if the user has administrator permissions or the clan manager role
            const hasAdministratorPermission = message.member.permissions.has('Administrator');
            const hasClanManagerRole = message.member.roles.cache.some(role => role.id === guildSettings.clanManagerRoleId);

            if (!hasAdministratorPermission && !hasClanManagerRole) {
                return message.reply({ content: '- <a:attention1:1184524624793448498> You do not have the required permissions to use this command.', flags: [4096] });
            }

            // Trim clan name and tag to remove whitespaces and ensure they are within Discord's character limit
            const trimmedClanName = clanName.trim().slice(0, 100);
            let trimmedTag = tag.trim().slice(0, 100);

            // Check if the tag contains {user}
            const tagPattern = /\{user\}/i;
            if (!tagPattern.test(trimmedTag)) {
                return message.reply({ content: '- <a:attention1:1184524624793448498> The tag must contain the placeholder "{user}".', flags: [4096] });
            }

            // Set the clan tag as the nickname for the leader
            const leaderMember = message.guild.members.cache.get(leaderId);
            if (leaderMember) {
                const existingName = leaderMember.displayName; // Use displayName to get the current nickname

                // Create a new variable for display purposes
                const displayTag = trimmedTag.replace(/\{user\}/i, existingName);

                await leaderMember.setNickname(displayTag).catch(error => {
                    console.error(`- Error setting nickname for leader ${leaderId}:`, error);
                });
            }

            // Create a role with the clan name
            const clanRole = await message.guild.roles.create({
                name: trimmedClanName,
                color: 'Random', // Set the color as desired
            });

            // Assign the clan role to the leader
            if (leaderMember) {
                await leaderMember.roles.add(clanRole).catch(error => {
                    console.error(`- Error assigning clan role to leader ${leaderId}:`, error);
                });

                // Assign the clan leader role from the Clan Manager settings
                if (guildSettings && guildSettings.clanLeaderRoleId) {
                    const clanLeaderRole = message.guild.roles.cache.get(guildSettings.clanLeaderRoleId);
                    if (clanLeaderRole) {
                        await leaderMember.roles.add(clanLeaderRole).catch(error => {
                            console.error(`- Error assigning clan leader role to leader ${leaderId}:`, error);
                        });
                    }
                }
            }

            // Generate a random clan key with 8 numbers
            const clanKey = Math.floor(10000000 + Math.random() * 90000000).toString();

            // Save the clan data to MongoDB
            const clanData = {
                guildId: message.guild.id,
                clanLeaderId: leaderId,
                clanRoleId: clanRole.id,
                clanVoiceChannelId,
                clanChatChannelId,
                clanKey,
                tag: trimmedTag,
                name: trimmedClanName, // New field for clan name
                members: [{ userId: leaderId }], // Add the leader to the members array
            };

            const ClansModel = require('../../../schemas/ClansSchema'); // Adjust the path accordingly
            await ClansModel.create(clanData);

            // Send an embed to the clan logs channel
            const clanLogsChannel = message.guild.channels.cache.get(guildSettings.clanLogsChannelId);

            const embed = new EmbedBuilder()
                .setColor('#00fc00')
                .setTitle(`Clan Created: ${trimmedClanName}`)
                .setDescription(`Clan Leader: ${message.author.tag} (${message.author.id})\nClan Role: ${clanRole}`)
                .addFields(
                    { name: 'Clan Tag', value: trimmedTag },
                    { name: 'Voice Channel ID', value: `<#${clanVoiceChannelId}>` },
                    { name: 'Text Channel ID', value: `<#${clanChatChannelId}>` }
                )
                .setTimestamp()
                .setFooter({
                    text: `Server: ${message.guild.name}`,
                    iconURL: message.guild.iconURL(),
                });

            clanLogsChannel.send({ embeds: [embed] });

            message.reply({ content: `- Clan "${trimmedClanName}" has been created successfully. Clan Key: ${clanKey}`, flags: [4096] });
        } catch (error) {
            console.error('- Error creating clan:', error);
            message.reply({ content: '- <a:attention1:1184524624793448498> An error occurred while creating the clan.', flags: [4096] });
        }
    },
};
