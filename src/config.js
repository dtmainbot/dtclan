module.exports = {
    color: `Random`,
    client: {
        token: "Your Bot token (USE .env FOR SAFETY)",
        id: "Your Bot ID (USE .env FOR SAFETY)",
    },
    handler: {
        prefix: "!c ",
        deploy: true,
        commands: {
            prefix: true,
            slash: true,
            user: true,
            message: true,
        },
        mongodb: {
            uri: "Your MongoDB URI string (USE .env FOR SAFETY)",
            toggle: true,
        },
    },
    users: {
        developers: ["1142083742026960906"],
    },
    messageSettings: {
        nsfwMessage: "**- <:alert:1174003047341490196> The current channel is not a NSFW channel.**",
        developerMessage: "**- <:alert:1174003047341490196> You are not authorized to use this command.**",
        cooldownMessage: "**- <:alert:1174003047341490196> Slow down buddy!**",
        notHasPermissionMessage: "**- <:alert:1174003047341490196> You do not have the permission to use this command.**",
        missingDevIDsMessage: "**- <:alert:1174003047341490196> This is a developer only command**"
    }
};
