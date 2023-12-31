export type BookInfo = {
    title?: string,
    cover?: string,
    description?: string,
    creator?: string,
    identifier?: string,
    language?: string,
    modified_date?: Date,
    orientation?: string,
    pubdate?: Date,
    publisher?: string,
    rights?: string,
    content?: ArrayBuffer
    push_date?: Date,
}

export type BookMarkInfo = {
    cfi: string,
    bookId: number,
    createdate?: Date,
}

export interface IOptions {
    onerror?: (event: Event) => void;
    onsuccess?: (event: Event) => void;
    onupgradeneeded?: (event: IDBVersionChangeEvent) => void;
    onblock?: (event: Event) => void;
}

export interface IResult {
    status: number,
    message?: string
    data?: any
}
