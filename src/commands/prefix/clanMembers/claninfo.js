const { EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const ClansModel = require('../../../schemas/ClansSchema');
const config = require('../../../config');

module.exports = {
    structure: {
        name: 'claninfo',
        description: 'Get information about a specific clan.',
        aliases: [`infoclan`],
        permissions: 'SendMessages',
        cooldown: 20000
    },
    /**
     * @param {ExtendedClient} client
     * @param {Message} message
     * @param {[String]} args
     */
    run: async (client, message, args) => {
        // Check if the user provided a clan key
        const clanKey = args[0];

        if (!clanKey) {
            return message.reply({content: '- <a:attention1:1184524624793448498> Please provide a valid clan key.', flags: [ 4096 ]});
        }

        try {
            const clan = await ClansModel.findOne({ clanKey }).exec();

            if (clan && clan.guildId === message.guild.id) {
                // Clan exists in the server
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
                } = clan;

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
                // Clan does not exist or is not in the current server
                message.reply({content: '- <a:attention1:1184524624793448498> The provided clan key is invalid or the clan is not in this server.', flags: [ 4096 ]});
            }
        } catch (error) {
            console.error('Error fetching clan information:', error);
            message.reply({content: '- <a:attention1:1184524624793448498> An error occurred while fetching the clan information.', flags: [ 4096 ]});
        }
    }
};
