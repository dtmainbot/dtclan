const { Message, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const ClansSchema = require('../../../schemas/ClansSchema');
const { model } = require('mongoose');
const config = require('../../../config');

module.exports = {
    structure: {
        name: 'leaderboard',
        description: 'Display a leaderboard of all clans in the server',
        aliases: ['lb'],
        permissions: 'SendMessages',
        cooldown: 20000,
    },
    /**
     * @param {ExtendedClient} client
     * @param {Message} message
     * @param {[String]} args
     */
    run: async (client, message, args) => {
        try {
            // Retrieve all clans from the database
            const allClans = await model('ClansSchema').find({ guildId: message.guild.id });

            if (allClans.length === 0) {
                return message.channel.send({
                    content: '- <a:attention1:1184524624793448498> No clans found in this server.',
                    flags: [4096],
                });
            }

            const embedBuilder = new EmbedBuilder()
                .setAuthor({name: `Top Clans in ` + message.guild.name, iconURL: message.guild.iconURL()})
                .setColor(config.color)
                .setThumbnail(`https://media.discordapp.net/attachments/1184519586733891737/1184519983989014528/pngegg.png?`)
                .setFooter({
                    text: `Requested by: ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL(),
                });

            let clanCounter = 0;

            allClans.forEach((clan) => {
                const leader = message.guild.members.cache.get(clan.clanLeaderId);
                const coLeaders = clan.coLeaders.map((coLeaderId) =>
                    message.guild.members.cache.get(coLeaderId)
                );
                if (
                    clan.tag &&
                    clan.clanRoleId &&
                    clan.clanLeaderId &&
                    clan.clanKey &&
                    clan.tag.length >= 1 &&
                    clan.clanRoleId.length >= 1 &&
                    clan.clanLeaderId.length >= 1 &&
                    clan.clanKey.length >= 1
                ) {
                    try {
                        const clanName = clan.name.substring(0, 1024);
                        const clanTag = clan.tag.substring(0, 1024);
                        const clanRole = `<@&${clan.clanRoleId}>`;
                        const clanLeader = `<@${clan.clanLeaderId}>`;
                        const clanCoLeaders =
                            coLeaders.length > 0 ? coLeaders.map((coLeader) => `<@${coLeader.id}>`).join(', ') : '(None)';
                        const clanKey = clan.clanKey.substring(0, 1024);

                        // logs for fixing the errors (logs diyal lconsol)
                        // console.log('Processed Clan:', { clanName, clanTag, clanRole, clanLeader, clanCoLeaders, clanKey });

                        clanCounter++;

                        embedBuilder.addFields([
                            {
                                name: `\`${clanCounter}st.\``,
                                value: `- ${clanRole}:\`${clanKey}\`` + `\n`,
                                inline: false,
                            },
                        ])
                    } catch (error) {
                        console.error('Error processing clan:', error);
                    }
                }
            });

            // Send the embed message
            message.channel.send({ embeds: [embedBuilder], flags: [4096] });
        } catch (error) {
            console.error('Error retrieving clans from the database:', error);
            message.channel.send({
                content: '- <a:attention1:1184524624793448498> An error occurred while fetching the clan leaderboard.',
                flags: [4096],
            });
        }
    },
};
