const { EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const ClansModel = require('../../../schemas/ClansSchema');
const config = require('../../../config');

module.exports = {
    structure: {
        name: 'myclan',
        description: 'Get information about your clan.',
        aliases: [`clani`],
        permissions: 'SendMessages',
        cooldown: 15000
    },
    /**
     * @param {ExtendedClient} client
     * @param {Message} message
     * @param {[String]} args
     */
    run: async (client, message, args) => {
        // Check if the user has a clan or is a member of a clan
        const userId = message.author.id;
        const guildId = message.guild.id;

        try {
            const userClan = await ClansModel.findOne({ 'members.userId': userId, guildId }).exec();

            if (userClan) {
                // User is part of a clan
                const {
                    name,
                    clanLeaderId,
                    clanRoleId,
                    clanKey,
                    tag,
                    clanVoiceChannelId,
                    clanChatChannelId,
                    coLeaders,
                    members,
                    creationTime,
                } = userClan;

                // Check if the user has the clan role, is a clan leader, or is a clan co-leader
                const hasClanRole = message.member.roles.cache.has(clanRoleId);
                const isClanLeader = userId === clanLeaderId;
                const isCoLeader = coLeaders.includes(userId);

                if (hasClanRole || isClanLeader || isCoLeader) {
                    // User has the clan role, is a clan leader, or is a clan co-leader
                    const embed = new EmbedBuilder()
                        .setColor(config.color)
                        .setTitle(`**${name} Clan Information**`)
                        .addFields(
                            {
                                name: '<:whitecrown:1184508553357172786> \`-\` Clan Leader',
                                value: `<a:arrowanimated:1184510749733818408><@${clanLeaderId}>`,
                                inline: true,
                            },
                            {
                                name: '<:kyy:1190744530081816598> \`-\` Clan Key',
                                value: `<a:arrowanimated:1184510749733818408>`+clanKey,
                                inline: true,
                            },
                            {
                                name: '<:hachtagwhite:1184558674354647123> \`-\` Clan Tag',
                                value: `<a:arrowanimated:1184510749733818408>`+tag,
                                inline: true,
                            },
                            {
                                name: '<:voicegreen:1184558172292255845> \`-\` Clan Voice',
                                value: `<a:arrowanimated:1184510749733818408><#${clanVoiceChannelId}>`,
                                inline: true,
                            },
                            {
                                name: '<:chatwhite:1184558428778139658> \`-\` Clan Chat',
                                value: `<a:arrowanimated:1184510749733818408><#${clanChatChannelId}>`,
                                inline: true,
                            },
                            {
                                name: '<a:Astars:1190730054238482493> \`-\` Clan Role',
                                value: `<a:arrowanimated:1184510749733818408><@&${clanRoleId}>`,
                                inline: true,
                            },
                            {
                                name: '<:cronometre:1190745729380122644> \`-\` Clan Created',
                                value: `<a:arrowanimated:1184510749733818408>`+creationTime.toDateString(),
                                inline: true,
                            },
                            {
                                name: '<:whitemem1:1184509056711405639> \`-\` Clan CoLeaders',
                                value: `<a:arrowanimated:1184510749733818408>`+coLeaders.map(coLeader => `<@${coLeader}>`).join(', ') || 'None',
                                inline: true,
                            },
                            {
                                name: '<:whitemember:1184508156718633021> \`-\` Clan Members',
                                value: `<a:arrowanimated:1184510749733818408>${members.length}/150`,
                                inline: true,
                            }
                        );

                    message.reply({ embeds: [embed], flags: [ 4096 ] });
                } else {
                    // User does not have the necessary roles
                    message.reply({content: '- <a:attention1:1184524624793448498> You do not have the necessary roles to use this command.', flags: [ 4096 ]});
                }
            } else {
                // User is not part of a clan
                message.reply({content: '- <a:attention1:1184524624793448498> You are not a member of any clan in this server.', flags: [ 4096 ]});
            }
        } catch (error) {
            console.error('Error fetching user clan:', error);
            message.reply({content: '- <a:attention1:1184524624793448498> An error occurred while fetching your clan information.', flags: [ 4096 ]});
        }
    }
};
