import baseURL from "@/consts/baseURL";

type ExtType = {text: string, web_app?: {url: string}}[]

export default function keyboardButtonsCreator(id: number|string, group: number|string, admin: boolean): ExtType {
    let firstLine: ExtType = [
            {
                text: '📆Календарь', 
                web_app: {url: baseURL.botPages.event(id, group)}
            }
        ]
        if (admin) {
            firstLine.push({text: '📝Список пользователей', web_app: {url: baseURL.botPages.users(id, group)}})
            firstLine.push({text: '➕Создать событие'})
        }
        firstLine.push({text: 'Выбрать другую группу'})
        firstLine.push({text: '🖌Добавить свободные даты в календарь'})
        firstLine.push({text: '🖍Добавить занятые даты в календарь'})
    return firstLine
}