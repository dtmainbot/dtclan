const { ButtonInteraction, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const ClanManagerSchema = require('../../schemas/clanManagerSchema');
const config = require('../../config');
const GuildSchema = require('../../schemas/GuildSchema');

module.exports = {
    customId: 'clanleaders_help',
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
                    .setTitle('**Leader Commands**')
                    .setFooter({
                        text: `Requested By: ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setDescription(`
                    <:aroww:1184514008536059965> | \`${prefix} adduser <user>\` - Add User To Your Clan.
                    <:aroww:1184514008536059965> | \`${prefix} removeuser <user>\` - remove a user from your clan.
                    <:aroww:1184514008536059965> | \`${prefix} dmclan <message>\` - Send Message to All Clan Members.
                    <:aroww:1184514008536059965> | \`${prefix} moveclan\` - move clan members to clan vc.
                    <:aroww:1184514008536059965> | \`${prefix} settings icon <iconURL>\` - set Clan Icon.
                    <:aroww:1184514008536059965> | \`${prefix} settings banner <bannerURL>\` - set Clan Banner.
                    <:aroww:1184514008536059965> | \`${prefix} addcol <user>\` - add a clan coleader.
                    <:aroww:1184514008536059965> | \`${prefix} removecol <user>\` - remove a clan coleader.
                    <:aroww:1184514008536059965> | \`${prefix} chatallow role <role>\` - permit a role in your clan chat.
                    <:aroww:1184514008536059965> | \`${prefix} chatdeny role <role>\` - deny a role in your clan chat.
                    <:aroww:1184514008536059965> | \`${prefix} chatallow user <user>\` - permit a user in your clan voice.
                    <:aroww:1184514008536059965> | \`${prefix} chatdeny user <user>\` - deny a user in your clan voice.
                    <:aroww:1184514008536059965> | \`${prefix} voiceallow role <role>\` - permit a role in your clan voice.
                    <:aroww:1184514008536059965> | \`${prefix} voicedeny role <role>\` - deny a role in your clan voice.
                    <:aroww:1184514008536059965> | \`${prefix} voiceallow user <user>\` - permit a user in your clan voice.
                    <:aroww:1184514008536059965> | \`${prefix} voicedeny user <user>\` - deny a user in your clan voice.
                    <:aroww:1184514008536059965> | \`${prefix} chatlock\` - lock your clan chat.
                    <:aroww:1184514008536059965> | \`${prefix} chatunlock\` - unlock your clan chat.
                    <:aroww:1184514008536059965> | \`${prefix} voicelock\` - lock your clan voice.
                    <:aroww:1184514008536059965> | \`${prefix} voiceunlock\` - unlock your clan voice.
                    `)

                if (member.permissions.has('ManageRoles') || member.roles.cache.has(clanManagerData.clanLeaderRoleId)) {
                    await interaction.reply({
                        embeds: [embed],
                        flags: [ 4096 ],
                        ephemeral: true,
                    });
                } else {
                    await interaction.reply({
                        content: '- <a:attention1:1184524624793448498> You do not have the necessary permissions or role to use this button.',
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
