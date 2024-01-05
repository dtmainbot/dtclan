const { Message, EmbedBuilder, Client } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config');
const GuildSchema = require('../../../schemas/GuildSchema');

module.exports = {
    structure: {
        name: 'cmds',
        description: 'View all the possible commands!',
        aliases: ['cmd'],
        cooldown: 15000
    },
    /**
     * @param {ExtendedClient} client 
     * @param {Message<true>} message 
     * @param {string[]} args 
     */
    run: async (client, message, args) => {

        let prefix = config.handler.prefix;

        if (config.handler?.mongodb?.toggle) {
            try {
                const data = (await GuildSchema.findOne({ guild: message.guildId }));

                if (data && data?.prefix) prefix = data.prefix;
            } catch {
                prefix = config.handler.prefix;
            };
        };

        const mapIntCmds = client.applicationcommandsArray.map((v) => `\`${(v.type === 2 || v.type === 3) ? '' : '/'}${v.name}\`: ${v.description || '(No description)'}`);
        const mapPreCmds = client.collection.prefixcommands.map((v) => `\`${prefix}${v.structure.name}\` (${v.structure.aliases.length > 0 ? v.structure.aliases.map((a) => `**${a}**`).join(', ') : 'None'}): ${v.structure.description || '(No description)'}`);

        await message.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(message.guild.name + ` Help Commands`)
                    .setColor(config.color)
                    .setDescription(`- **Slash commands**\n - ${mapIntCmds.join('\n - ')}\n- **Prefix commands**\n - ${mapPreCmds.join('\n - ')}`)
                    .setThumbnail(message.guild.iconURL())
                    .setFooter({
                        text: `Requested by: ${message.author.username}`,
                        iconURL: message.author.displayAvatarURL(),
                    })
            ],
            flags: [ 4096 ]
        });

    }
};
