module.exports = {
    name: 'prefix',
    description: 'change prefix',
    aliases: ['pre'],
    execute(message, args, con) {
        if(!message.channel.permissionsFor(message.member).has('MANAGE_MESSAGES', false, false)) return;
        if(!args.length){
            return;
        }
        con.getConnection(function(err, connection){
            connection.query(`SELECT * FROM discordbot.GuildInfo WHERE GuildName = ${message.guild.id}`, function(err, result){
                if(err){
                    return console.log('Could not find guild');
                }else if(result.length < 1 || result === undefined){
                    connection.query(`INSERT INTO discordbot.GuildInfo VALUES('${message.guild.id}', '${args[0]}', '${message.guild.name})`, function(err1, result2){
                        if(err1){
                            message.channel.send('Unable to update prefix');
                            console.log('It failed to Insert' + err1);
                            return;
                        }else{
                            message.channel.send(`Your prefix is now ${args[0]}`);
                            console.log('Inserted Successfully');
                            return;
                        }
                    });
                }
                else{
                    connection.query(`UPDATE discordbot.GuildInfo SET prefix = '${args[0]}' WHERE GuildName = '${message.guild.id}'`, function(err2, result2){
                        if(err2){
                            message.channel.send('Unable to update prefix');
                            console.log('It failed to Update' + err2);
                            return;
                        }else{
                            message.channel.send(`Your prefix is now ${args[0]}`);
                            console.log('Updated Successfully');
                            return;
                        }
                    });
                }
                
            });
            connection.release();
        });
    },
};

