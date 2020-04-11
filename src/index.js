const fs = require('fs');
const Discord = require('discord.js');
const {token, hostInfo, userInfo, passwordInfo, databaseInfo} = require('./config.json');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

var prefix = '!';
var guildPrefixes = [];

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}
var dbConfig = {
    host     : hostInfo,
    user     : userInfo,
    password : passwordInfo,
    database : databaseInfo,
};
const mysql = require('mysql');
const con = mysql.createPool(dbConfig);


const cooldowns = new Discord.Collection();

client.on('ready', () => {
    getData();
    setTimeout(function() {
        process.exit(0);
    }, 1000 * 60 * 30);
    const time = new Date(Date.now());
	client.user.setPresence({ status: 'online', game: { name: `DelariousBot ~ Type  ${prefix}help for commands` } });
	console.log(`${time.toUTCString()}: Logged in as ${client.user.tag}!\r\n`);
});

client.on('error', console.error);
client.on('disconnect', (e) => {
	client.destroy().then(() => client.login());
	console.log(`${e.code}: ${e.reason}\r\n`);
});


client.on('message', message => {
    if (message.channel.type == 'dm'){
        prefix = '!';
        if(!message.content.startsWith(prefix) || message.author.bot) return;
        const args = message.content.slice(prefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();
        if(commandName === 'help'){
            const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
            
            if (!command) {
                return;
            }
            command.execute(message, args, con);
        }
        return;
    } 

    getData();

    if(guildPrefixes.some(e => e.guildName === message.guild.id)){
        var item = guildPrefixes.find(guilds => guilds.guildName === message.guild.id);
        prefix = item.prefix;
    }else{
        prefix = '!';
    }

    if(!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    if(!guildPrefixes.some(e => e.guildName === message.guild.id)){
        insertGuildInfo(message, args);
        updateNames(message);
    }
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) {
		return;
	}

    if(command.args && !args.length){
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if(command.usage){
            reply += `\r\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}`;
        }

        return message.channel.send(reply);
    }

    if( !cooldowns.has(command.name)){
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if(timestamps.has(message.author.id)){
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if(now < expirationTime){
            const timeLeft = (expirationTime - now) / 1000;
            return message.author.send(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }

    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try{
        const time = new Date(Date.now());
        console.log(`${time}: ${message.author.username} ran the command: ${commandName}\r\n`);
        command.execute(message, args, con);
        getData();
    }catch(error){
        const time = new Date(Date.now());
        console.log(`${time}: Command threw an error: \r\n${error}` );
    
    }
});

client.login(token);

async function getData(){
    con.getConnection(function(err, connection){
        var sql = 'SELECT * FROM discordbot.GuildInfo';
        if(err){
            return console.log(err + '\r\n');
        }
        connection.query(sql, function(err, result){
            if(err){
                return console.log('Unable to load database\r\n');
            }
            guildPrefixes = [];
            result.forEach((guildName, prefix1) => {
                guildPrefixes.push({guildName: guildName.GuildName, prefix: guildName.prefix});
            });
        });
        connection.release();
    });
}

function updateNames(message){
    con.getConnection(function(err, connection){
        connection.query(`UPDATE discordbot.GuildInfo SET ChannelName = '${message.guild.name}' WHERE GuildName = '${message.guild.id}'`, function(err2, result2){
            if(err2){
                console.log('\r\nIt failed to Update' + err2);
                return;
            }else{
                console.log('\r\nYour channel name is set');
                return;
            }
        });
        connection.release();
    });
}

function insertGuildInfo(message, args){
    con.getConnection(function(err, connection){
        connection.query(`INSERT INTO discordbot.GuildInfo VALUES('${message.guild.id}', '!', '${message.guild.name}')`, function(err1, result2){
            if(err1){
                return console.log('It failed to Insert' + err1 + '\r\n');
            }else{
                return console.log('\r\nInserted Successfully\n');
            }
        });
        connection.release();
    });
}