const TelegramBot = require('node-telegram-bot-api');
var mongoose = require('mongoose');
var fs = require('fs');

var strings = {
    'twice': "شما قبلا در این نظرسنجی شرکت کرده‌اید!",
    'name': "لطفا نام و نام خانوادگی خود را در صورت تمایل وارد کنید.",
    'melliCode': "لطفا کد ملی خود را در صورت تمایل وارد کنید.",
    'mobile': "لطفا شماره‌ی موبایل خود را در صورت تمایل وارد کنید.",
    'choice1': "کاملا موافق",
    'choice2': "مجموعا موافق",
    'choice3': "ممتنع",
    'choice4': "محموعا مخالف",
    'choice5': "کاملا مخالف",
}


var token = ""
createBot()
/*
fs.readFile('token.txt', 'utf8', function (err, data) {
    if (err) {
        console.log('token read error!')
    }
    token = data;
    createBot();
    console.log(token)
});
*/

mongoose.connect('mongodb://localhost/savesampad');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
    console.log('db connect')
});


var userSchema = mongoose.Schema({
    chatId: Number,
    username: String,
    first_name: String,
    last_name: String,
    name: String,
    typeOfConnection: String,
    email: String,
    school: String,
    university: String,
    description: String,
    state: Number,
});

userSchema.plugin(mongooseToCsv, {
    headers: 'Name typeOfConnection School University Email Description username first_name last_name chatId state',
    constraints: {
        'Name': 'name',
        'typeOfConnection': 'typeOfConnection',
        'School': 'school',
        'University': 'university',
        'Description': 'description',
        'Email': 'email',
        'username': 'username',
        'first_name': 'first_name',
        'last_name': 'last_name',
        'state': 'state',
        'chatId': 'chatId',
    }
})

var userModel = mongoose.model('userModel', userSchema)

// Create a bot that uses 'polling' to fetch new updates

var bot
function createBot() {
    bot = new TelegramBot(token, {polling: true});
    bot.on('message', (msg) => {
        const chatId = msg.chat.id
        if(chatId == 57692552 || msg.username == adminUsernames[0] || msg.username == adminUsernames[1] || msg.username == adminUsernames[2]) {
            if(msg.text == '/excel') {
                createCSV(chatId)
                return
            } else if(msg.text == '/count') {
                userModel.count({}, function (err, data) {
                    if(err) {
                        throw err
                        return
                    }
                    bot.sendMessage(chatId, "Count is "+data.toString())
                })
                return
            }
        }
        userModel.findOne({'chatId': chatId}, function (err, user) {
            if(err)
                throw err
            if(msg.text == 'reset') {
                console.log(user)
                user['state'] = 0
                user.name = ''
                user.school = ''
                user.university = ''
                user.description = ''
                user.typeOfConnection = ''
                user.email = ''
                user.save()
            } else
            if(user) {
                if(user.state == 0) {
                    bot.sendMessage(chatId, strings['welcome'])
                    setTimeout(() => {bot.sendMessage(chatId, strings['name'])}, 500)
                }
                if(user.state == 1) {
                    user['name'] = msg.text
                    user['state'] += 1
                    bot.sendMessage(chatId, strings['connection'], {
                        "reply_markup": {
                            "keyboard": [[strings['choice1'], strings['choice2']], [strings['choice3'], strings['choice4']], [strings['choice5'], strings['choice6']], [strings['choice7']]],
                            "one_time_keyboard": true
                        }
                    })
                } else if(user.state == 2) {
                    user['typeOfConnection'] = msg.text
                    user['state'] += 1
                    bot.sendMessage(chatId, strings['school'])
                } else if(user.state == 3) {
                    user['school'] = msg.text
                    user['state'] += 1
                    bot.sendMessage(chatId, strings['university'])
                } else if(user.state == 4) {
                    user['university'] = msg.text
                    user['state'] += 1
                    bot.sendMessage(chatId, strings['email'], {parse_mode: 'Markdown'})
                } else if(user.state == 5) {
                    if(msg.text != '/next') {
                        user['email'] = msg.text
                    }
                    user['state'] += 1
                    bot.sendMessage(chatId, strings['description'], {parse_mode: "Markdown"})
                } else if(user.state == 6) {
                    user['description'] = msg.text
                    bot.sendMessage(chatId, strings['savesuccessful'])
                    user['state'] += 1

                } else if (user.state > 6) {
                    bot.sendMessage(chatId, strings['twice'])
                }
                else {
                    user['state'] = 1
                }
                user.save()
            } else {
                bot.sendMessage(chatId, strings['welcome'])
                setTimeout(() => {bot.sendMessage(chatId, strings['name'])}, 500)
                userModel.create({'chatId': chatId, 'state': 1, 'first_name': msg.first_name, 'last_name': msg.last_name, 'username': msg.username}, function (err, data) {
                    if (err) return handleError(err)
                })
            }
        })
    })
}

function createCSV(chatId) {
    /*
    var date = new Date()
    userModel.find({}, function (err, data) {
        fs.createWriteStream('users'+date.getHours().toString()+'.csv')
    })
    stream.on('finish', function () {
        bot.sendDocument(chatId, stream)
    })
    */

    userModel.find({}, function (err, data) {
        var model = mongoXlsx.buildDynamicModel(data);
        mongoXlsx.mongoData2Xlsx(data, model, function(err, data) {
            bot.sendMessage(chatId, 'File saved at:', data.fullPath)
            bot.sendDocument(chatId, data.fullPath);
        });
    })

}