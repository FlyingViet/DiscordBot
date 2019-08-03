module.exports = {
    name: 'user-info',
    description: 'Sends user info',
    aliases: ['info', 'myinfo'],
    cooldown: 5,
    execute(message, args, con) {
        message.channel.send(`Your username: ${message.author.tag}`);
    },
};