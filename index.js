const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const fs = require('fs');
const mongoXlsx = require('mongo-xlsx');

var strings = {
  'ignoreButton': 'متمایل نیستم.',
  'preIgnore': '\n'+'در غیر این صورت بر روی'+' /next '+'کلیک کنید.',
  'ignore': '',
  'end': 'با تشکر از شرکت شما در این نظرسنجی',
  'twice': "شما قبلا در این نظرسنجی شرکت کرده‌اید!",
  'name': "لطفا نام و نام خانوادگی خود را در صورت تمایل وارد کنید.",
  'melliCode': "لطفا کد ملی خود را در صورت تمایل وارد کنید.",
  'mobile': "لطفا شماره‌ی موبایل خود را در صورت تمایل وارد کنید.",
  'welcome': "به نام خدا\n" +
  "\n" +
  "فرم نظرسنجی آئین‌نامۀ متراژ غرفه نمایشگاه\n" +
  " \n" +
  "نظرخواهی زیر به ‌منظور جمع‌بندی نظر ناشران کودک ‌و ‌نوجوان در نحوه‌ي محاسبه‌ي متراژ غرفه در نمایشگاه بین‌المللی کتاب تهران ارائه مي‌شود.\n" +
  "از شما تقاضا داریم با صرف چند دقیقه از وقت خود زمینه‌ي مثبت برای تدوین اين آیین‌نامه را فراهم آوريد.\n" +
  " \n" +
  "مقدمه: در این آیین‌نامه ملاک‌ محاسبه‌ي متراژ هر موسسه‌‌ي انتشاراتی بر مبنای آیین‌نامه بالا‌دستی مصوب نمایشگاه بین‌المللی کتاب تهران شرح داده شده است.\n" +
  "روش محاسبه متراژ غرفه‌ي هر ناشر به این شرح است که در ابتدا بر مبنای این آیین‌نامه امتیاز هر  متقاضی محاسبه خواهد شد. سپس، امتیاز کل ناشران تقسیم بر متراژ کل غرفه‌ي موجود در سالن کودک خواهد شد. حاصل این تقسیم عددي پایه است که تعیین می‌کند در ازاي چند امتیاز، یک متر مربع غرفه به ناشر تعلق خواهد گرفت. از اینجا به بعد، با تقسیم امتیاز هر متقاضی بر عدد پایه‌ي متراژ غرفه آن شرکت‌کننده تعیین خواهد شد. البته به دلیل محدودیت سیستم غرفه‌بندی، برای متراژ هر غرفه اعداد رُند شده تعیین خواهد شد.\n" +
  " \n" +
  "تذکر۱- ملاک محاسبه‌ي بيشتر موارد آیین‌نامه‌ي زیر، عناوین چاپ‌شده‌ي ناشر در چهار سال گذشته شمسی است.\n" +
  "تذکر۲- مرجع تأیید تمام اطلاعات آماری زیر وب‌سایت خانه کتاب خواهد بود و در صورت عدم دسترسی به هر یک، آن مورد يا موارد از آیین‌نامه‌ي محاسباتی حذف خواهد شد." + "\n\n" +
  "لطفا هم اکنون برای هر کدام از سوال‌ها یکی از گزینه‌های موردنظر را انتخاب کنید.",
  'choice1': "کاملا موافق",
  'choice2': "مجموعا موافق",
  'choice3': "ممتنع",
  'choice4': "مجموعا مخالف",
  'choice5': "کاملا مخالف",
  'questions': [
    '1-  هر عنوان کتاب تجدید چاپ در چهار سال گذشته : يك امتیاز (موارد تکراری تجدید چاپ یک کتاب در یک سال حذف خواهند شد.)',
    ' 2- هر عنوان چاپ اول در چهار سال گذشته: دو امتیاز.',
    ' 3 - به هر یک از موارد چاپ اول یا تجدید چاپ که تألیفی باشند، ضریب دو تعلق خواهد گرفت.',
    '4-  برای هر پانصد نسخه تیراژ کتاب مورد نظر، نیم امتیاز تعلق خواهد گرفت.',
    '5-  بر اساس تعداد کل صفحه‌هاي کتاب رنگی به ازای هر شانزده صفحه، نیم امتیاز افزوده خواهد شد.',
    '6- بر اساس تعداد کل صفحه‌هاي کتاب تک‌رنگ به ازای هر چهل و هشت صفحه، نیم امتیاز افزوده خواهد شد.',
    '7- برای کتاب با قطع رحلی و بزرگ‌تر، ضریب یک و نیم اعمال خواهد شد.',
    '8- برای هر کتاب دست‌ساز مانند کتب شکفتنی یا پارچه‌ای، یا فومی دست ساز، ضریب دو تعلق خواهد گرفت.',
    '9- برای عناوین تألیفیِ ویژه، مانند دایره‌المعارف‌ها یا کتاب‌های مرجع رنگی به تشخیص شورای کارشناسی، ضریب‌های زیر در نظر گرفته خواهد شد:\n' +
    'ـ تا 150 صفحه پنج امتیاز\n' +
    'ـ 150 تا 300 صفحه، ده امتیاز\n' +
    'ـ 300 صفحه به بالا، پانزده امتیاز',
    ' 10- يك امتیاز به ازای هر سال سابقه‌ي نشر کتاب کودک و نوجوان اضافه خواهد شد.',
    '11- کسب عنوان ناشر سال، هر بار بیست امتیاز  .',
    ' 12- کسب عنوان ناشر تقدیری سال ، هر بار ده امتیاز.',
    '13- کسب عنوان ناشر برگزیده‌ي (نمونه) نمایشگاه ، هر بار ده امتیاز.',
    ' 14- کسب عنوان ناشر تقدیری نمایشگاه،  هر بار پنج امتیاز.',
    '15- کسب عنوان کتاب سال جمهوری اسلامی ایران، هر کتاب ده امتیاز.',
    '16- کسب عنوان کتاب تقدیری سال جمهوری اسلامی ایران، هر کتاب پنج امتیاز.',
    '17- کسب عنوان کتاب برگزیده از جشنواره‌های معتبر کتاب، طی چهار سال گذشته، هر عنوان پنج امتیاز.',
    '18- کسب عنوان کتاب تقدیری یا معادل آن از جشنواره‌های معتبر کتاب، طی چهار سال گذشته، هر عنوان دو و نیم امتیاز .',
    '19- کتاب شناخته‌شده به‌عنوان کتاب مناسب جشنواره‌ي رشد، طی چهار سال گذشته، هر کتاب نیم امتیاز .',
    '20- با تخلفات هر متقاضی در نمایشگاههای چهار سال گذشته طبق آییننامه کمیسیون تخلفات برخورد خواهد شد.'
  ]
}


var token = ""
//createBot()
fs.readFile('token.txt', 'utf8', function (err, data) {
    if (err) {
        console.log('token read error!')
    }
    token = data;
    createBot();
    console.log(token)
});

mongoose.connect('mongodb://localhost/nasherBot');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
  console.log('db connect')
});


var userSchema = mongoose.Schema({
  chatId: Number,
  name: String,
  melliCode: String,
  mobile: String,
  answers: [String],
  state: Number,
});
var userModel = mongoose.model('userModel', userSchema)

function createBot() {
  const bot = new TelegramBot(token, {polling: true});
  bot.on('message', (msg) => {
    const chatId = msg.chat.id
    userModel.findOne({'chatId': chatId}, function (err, user) {
      if (err)
        throw err
      if((msg.chat.username == 'airani_a' || msg.chat.username == 'mahdi9003') && msg.text == '/get') {
        userModel.find({}, function (err, users) {
          var model = mongoXlsx.buildDynamicModel(users);
          mongoXlsx.mongoData2Xlsx(users, model, function(err, data) {
            console.log('File saved at:', data.fullPath);
            bot.sendDocument(chatId, data.fullPath)
          });
        })
        return
      }

      if (msg.text == 'reset' && msg.chat.username == 'airani_a') {
        console.log(user)
        user['state'] = 1
        user.name = ''
        user.email = ''
        user.answers = [0]
        user.save()
        bot.sendMessage(chatId, strings['welcome'])
        setTimeout(() => {bot.sendMessage(chatId, strings['questions'][0], {
          "reply_markup": {
            "keyboard": [[strings['choice1'], strings['choice2']], [strings['choice3']], [strings['choice5'], strings['choice4']]],
          }})}, 500)
      } else if (user) {
        if (user.state == 0) {
          bot.sendMessage(chatId, strings['welcome'])
          setTimeout(() => {bot.sendMessage(chatId, strings['questions'][user.state], {
            "reply_markup": {
              "keyboard": [[strings['choice1'], strings['choice2']], [strings['choice3']], [strings['choice5'], strings['choice4']]],
            }})}, 500)
        } else if (user.state < 19) {
          user['answers'].push(msg.text)
          bot.sendMessage(chatId, strings['questions'][user.state], {
            "reply_markup": {
              "keyboard": [[strings['choice1'], strings['choice2']], [strings['choice3']], [strings['choice5'], strings['choice4']]],
            }
          })
        } else if(user.state == 19) {
          user['answers'].push(msg.text)
          bot.sendMessage(chatId, strings['questions'][user.state], {
            "reply_markup": {
              "keyboard": [[strings['choice1'], strings['choice2']], [strings['choice3']], [strings['choice5'], strings['choice4']]],
              "one_time_keyboard": true
            }
          })
        } else if(user.state == 20) {
          user['answers'].push(msg.text)
          bot.sendMessage(chatId, strings['name']+strings['ignore'], {
            "reply_markup": {
              "keyboard": [[strings['ignoreButton']]],
            }
          })
        } else if(user.state == 21) {
          if(msg.text != strings['ignoreButton']) {
            user['name'] = msg.text
          }
          bot.sendMessage(chatId, strings['melliCode']+strings['ignore'], {
            "reply_markup": {
              "keyboard": [[strings['ignoreButton']]],
            }
          })
        } else if(user.state == 22) {
          if(msg.text != strings['ignoreButton']) {
            user['melliCode'] = msg.text
          }
          bot.sendMessage(chatId, strings['mobile']+strings['ignore'], {
            "reply_markup": {
              "keyboard": [[strings['ignoreButton']]],
              "one_time_keyboard": true
            }
          })
        } else if(user.state == 23) {
          if(msg.text != strings['ignoreButton']) {
            user['mobile'] = msg.text
          }
          bot.sendMessage(chatId, strings['end'])
        } else if(user.state > 23) {
          bot.sendMessage(chatId, strings['twice'])
          user['state'] -= 1
        }
        user['state'] += 1
        user.save()
      } else {
        bot.sendMessage(chatId, strings['welcome'])
        setTimeout(() => {bot.sendMessage(chatId, strings['questions'][0], {
          "reply_markup": {
            "keyboard": [[strings['choice1'], strings['choice2']], [strings['choice3']], [strings['choice5'], strings['choice4']]],
          }})}, 500)
        userModel.create({
          'chatId': chatId,
          'state': 1,
          'answers': [0],
        }, function (err, data) {
          if (err) return handleError(err)
        })
      }
    })
  })
}