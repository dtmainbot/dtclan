const { Message } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config');
const GuildSchema = require('../../../schemas/GuildSchema');

module.exports = {
    structure: {
        name: 'prefix',
        description: 'Get/Set/Default prefix',
        aliases: [],
        permissions: 'Administrator'
    },
    /**
     * @param {ExtendedClient} client 
     * @param {Message<true>} message 
     * @param {string[]} args 
     */
    run: async (client, message, args) => {

        if (!config.handler?.mongodb?.toggle) {
            await message.reply({
                content: '- <a:attention1:1184524624793448498> Database is not ready, this command cannot be executed.',
                flags: [ 4096 ]
            });

            return;
        };

        const type = args[0];

        switch (type) {
            case 'set': {
                let data = await GuildSchema.findOne({ guild: message.guildId });

                if (!data) {
                    data = new GuildSchema({
                        guild: message.guildId
                    });
                }

                const oldPrefix = data.prefix || config.handler.prefix;

                if (!args[1]) {
                    await message.reply({
                        content: '- <a:attention1:1184524624793448498> You need to provide the prefix as a second parameter.',
                        flags: [ 4096 ]
                    });

                    return;
                }

                data.prefix = args[1];

                await data.save();

                await message.reply({
                    content: `- The old prefix \`${oldPrefix}\` has been changed to \`${args[1]}\`.`,
                    flags: [ 4096 ]
                });

                break;
            }

            case 'reset': {
                let data = await GuildSchema.findOne({ guild: message.guildId });

                if (data) {
                    await GuildSchema.deleteOne({ guild: message.guildId });
                }

                await message.reply({
                    content: `- The new prefix on this server is: \`${config.handler.prefix}\` (default).`,
                    flags: [ 4096 ]
                });

                break;
            }

            default: {
                await message.reply({
                    content: '- Allowed methods: `set`, `reset`',
                    flags: [ 4096 ]
                });

                break;
            }
        }
    }
};
