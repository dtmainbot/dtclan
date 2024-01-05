const { ButtonInteraction, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const ClanManagerSchema = require('../../schemas/clanManagerSchema');
const config = require('../../config');
const GuildSchema = require('../../schemas/GuildSchema');

module.exports = {
    customId: 'administrator_help',
    /**
     * 
     * @param {ExtendedClient} client 
     * @param {ButtonInteraction} interaction 
     */
    run: async (client, interaction) => {
        let prefix = config.handler.prefix;

        try {
            const guildData = await GuildSchema.findOne({ guild: interaction.guildId });

            if (guildData && guildData.prefix) {
                prefix = guildData.prefix;
            }
        } catch (error) {
            console.error('Error fetching prefix from database:', error);
        }

        // Ensure that roles are properly cached
        await interaction.guild.members.fetch();

        try {
            const clanManagerData = await ClanManagerSchema.findOne({ guildId: interaction.guildId });

            if (clanManagerData) {
                const member = interaction.guild.members.cache.get(interaction.user.id);
                const embed = new EmbedBuilder()
                    .setColor(config.color)
                    .setAuthor({name: interaction.guild.name, iconURL: interaction.guild.iconURL()})
                    .setTitle('**Administrator Commands**')
                    .setFooter({
                        text: `Requested By: ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setDescription(`
                    <:aroww:1184514008536059965> | </setup_clan_manager:1175883014216089691> - setup the clans system settings.
                    <:aroww:1184514008536059965> | \`${prefix} cmds\` - view all the possible commands.
                    <:aroww:1184514008536059965> | \`${prefix} ping\` - view the ping of the bot.
                    <:aroww:1184514008536059965> | \`${prefix} prefix <reset/set> <NewPrefix>\` - Change the bot prefix.
                    `)

                if (member.permissions.has('Administrator')) {
                    await interaction.reply({
                        embeds: [embed],
                        flags: [ 4096 ],
                        ephemeral: true,
                    });
                } else {
                    await interaction.reply({
                        content: '- <a:attention1:1184524624793448498> You do not have the necessary permissions to use this button.',
                        ephemeral: true,
                        flags: [ 4096 ]
                    });
                }
            } else {
                console.error('ClanManager data not found for guild:', interaction.guildId);
            }
        } catch (error) {
            console.error('Error fetching ClanManager data from database:', error);
        }
    },
};
