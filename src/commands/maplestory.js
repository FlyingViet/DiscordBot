module.exports = {
    name: 'maplestory',
    description: 'Maplestory easter egg',
    aliases: ['maple'],
    cooldown: 5,
    execute(message, args, con) {
        message.channel.send(`${message.author} has been disconnected due to HACK reason`);
    },
};