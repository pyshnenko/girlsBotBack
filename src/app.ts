import 'module-alias/register';
import * as dotenv from 'dotenv';
dotenv.config();
import { Telegraf, session } from 'telegraf';
const bot = new Telegraf(String(process.env.TGTOK));
import start from '@/bot/start';
import {Context} from '@/types/bot';
import message from '@/bot/message';
import callback from '@/bot/callback';
import app from '@/api';
import { botLogger } from '@/winston/logger';
import sequelize from '@/mech/sqlFuncs/helpers/seqInit';
import { SQLdateListSEQ } from './mech/sqlFuncs/calendar';
import baseURL from './consts/baseURL';
import sql from '@/mech/sql';
import { ActiveAttributes } from "@/types/sql";
bot.use(session());

bot.telegram.setMyCommands([
    { command: '/start', description: 'Начинаем начинать' },
    { command: '/support', description: 'Поддержка' },
    { command: '/tariff', description: 'Денюшки' },
    { command: '/info', description: 'Как пользоваться?' }
])

bot.start(async (ctx: any) => {
    botLogger.log('debug', JSON.stringify({message: 'start', id: ctx.from.id, session: ctx.session}))
    ctx.session = await start(ctx as Context, (ctx as Context).session);
});

bot.on('photo', async (ctx)=>{
    console.log(ctx.message);
})

bot.on('callback_query', async (ctx: any) => {
    botLogger.log('debug', JSON.stringify({...ctx.callbackQuery, id: ctx.from.id, session: ctx.session}))
    ctx.session = await callback(ctx as Context, (ctx as Context).session, bot);
})

bot.on('message', async (ctx: any) => {
    botLogger.log('debug', JSON.stringify({...ctx.message, id: ctx.from.id, session: ctx.session}))
    ctx.session = await message((ctx as Context), (ctx as Context).session, bot);
})

//bot.launch();

bot.catch((err: any)=>{botLogger.log('error', err)});

app.listen(8900, ()=>{botLogger.log('info', 'start on 8900')})

sql.eventAgr.getEvent(1, new Date('2025-05-01')).then((res:any)=>console.log(res));
console.log(baseURL.botPages.users(209103348, 2))
