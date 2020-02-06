module.exports = {
    name: 'emote',
    cooldown: 5,
    execute(message, args, con) {
        var str = message.content.split(' ');
        str.splice(0, 1);
        str.forEach(emote => {
            console.log(emote);
        });
    },
};