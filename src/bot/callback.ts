import { Context, Session } from "@/types/bot";
import { GroupKeyboard } from "@/mech/keyboard";
import sql from "@/mech/sql";
import { TGFrom } from "@/types/tgTypes";
import { Markup, Telegraf } from "telegraf";

export default async function callback(ctx: Context, session: Session, bot: Telegraf) {
    //let session = {...ctx.session};
    ctx.deleteMessage();
    if (ctx.callbackQuery.data === 'YES') {
        const group = await sql.activeTest.get(ctx.from.id);
        if (session?.make === 'newEvent') {
            if (group) {
                const eventID: number = (
                    await sql.event.addEvent(
                        ctx.from.id, 
                        session?.event?.name||'', 
                        new Date(session?.event?.date||0), 
                        session?.event?.location||'', 
                        session?.event?.linc||'', 
                        group))||0;
                const users: TGFrom[] = await sql.user.search({}, group) as TGFrom[];
                await ctx.reply('добавлено')
                users.map(async (item: TGFrom) => await bot.telegram.sendMessage(
                    item.id, 
                    `Тебя приглашают\n${(new Date(session?.event?.date||0)).toLocaleDateString()}\n`+
                    `на мероприятие:\n${session?.event?.name}\nкоторое пройдет в:\n`+
                    `${session?.event?.location||''}\n${session?.event?.linc||''}`, 
                    Markup.inlineKeyboard([
                        Markup.button.callback('✅Да', `YES_event_${group}_${eventID}`),
                        Markup.button.callback('❌Нет', `NO_event_${group}_${eventID}`)
                    ])))
            }
            else ctx.reply('Пожалуйста, нажми /start и начни с начала')
        }
        else if ((session?.make === 'freeDay') || (session?.make === 'busyDay')) {
            let days: Date[] = []
            if (Array.isArray(session?.result)) {
                days = session.result.map((item: string)=>new Date(`${session?.date?.year}-${session?.date?.month}-${item}`))
                if (group) {
                    (await sql.calendar.set(days, ctx.from.id, session.make === 'freeDay'?true:session?.make === 'busyDay'?false:false, group))
                    ctx.reply('Выполнено')
                }
                else ctx.reply('Пожалуйста, нажми /start и начни с начала')
            }
            else ctx.reply('что-то пошло не так')
        }
        else if (session?.make === 'new group') {
            await sql.group.set(ctx.from.id, String(session.result)||'none', true, true);
            ctx.reply('Создано')
        }
        else if (session?.make === 'search group') {
            await sql.group.set(ctx.from.id, session?.result?.name, false, false, session?.result?.id);
            ctx.reply('Заявка подана')
        }
        session = {}
    } else if (ctx.callbackQuery.data === 'NO') {
        session = {}
    }
    else if (ctx.callbackQuery.data.includes('YES_event')) {
        const datas: string[] = ctx.callbackQuery.data.split('_');
        await sql.event.YNEvent(Number(datas[3]), 1, ctx.from.id, Number(datas[2]))
    } else if (ctx.callbackQuery.data.includes('NO_event')) {
        const datas: string[] = ctx.callbackQuery.data.split('_');
        await sql.event.YNEvent(Number(datas[3]), 2, ctx.from.id, Number(datas[2]))
    } else {
        const dataSplit: string[] = ctx.callbackQuery.data.split('_')
        const command = dataSplit[0];
        const commandIndex = Number(dataSplit[1]);
        if (command === 'setFreeDayMonth') {
            const month = ((new Date()).getMonth() + commandIndex + 1)
            session.make = 'freeDay';
            session.await = 'day'
            session.date = {year: month > 11 ? (new Date()).getFullYear() + 1 : (new Date()).getFullYear(), month: month%12, day: 0}
            ctx.reply('Введи даты через пробел или запятую. Например: 1, 2,3 4')
        }
        else if (command === 'setBusyDayMonth') {
            const month = ((new Date()).getMonth() + commandIndex + 1)
            session.make = 'busyDay';
            session.await = 'day'
            session.date = {year: month > 11 ? (new Date()).getFullYear() + 1 : (new Date()).getFullYear(), month: month%12, day: 0}
            ctx.reply('Введи даты через пробел или запятую. Например: 1, 2,3 4')
        }
        else if (command === 'setActiveGroup') {
            const is_admin = await sql.user.check(ctx.from.id, commandIndex);
            (await sql.activeTest.set(ctx.from.id, commandIndex)) ?
            GroupKeyboard(ctx, 'Группа задана', commandIndex, typeof(is_admin)==='boolean'?false:is_admin.admin) :
            ctx.reply('Что-то пошло не так')
        }
    }
    return session
}