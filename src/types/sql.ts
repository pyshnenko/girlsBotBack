export interface eventListType {
    id: number,
    authorID: number,
    namestring: string,
    dateevent: string,
    place: string,
    linc: string,
    [key: `id${number}`]: 1|2|null
}

export interface calendar {
    id: number,
    evtDate: string,
    day: number,
    [key: `id${number}`]: 1|2|null
}

export interface groupSearchResult {
    Id: number,
    tgId: number,
    name: string,
    register: number,
    admin: number
}

export interface ActiveAttributes {
  tgId: number,
  groupId: number
}

export interface DaysAttributes {
  id?: number,
  free: boolean,
  evtDate: string,
  tgId: number,
  groupId: number
}

export interface GroupsAttr {
    name: string,
    tgId: number,
    admin: boolean,
    register: boolean,
    Id: number
}