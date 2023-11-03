type Book = {

}

interface IOptions {
    onerror?: (event: Event) => void;
    onsuccess?: (event: Event) => void;
    onupgradeneeded?: (event: Event) => void;
    onblock?: (event: Event) => void;
}

function openIndexDb(name: string, version: number, options: IOptions) {

    const db = window.indexedDB.open(name, version);
    db.onerror = (event: Event) => {
        console.error("Error: 打开数据库失败");
        console.error(event);
    }

    db.onsuccess = (event: Event) => {
        console.log("Success: 打开数据库");
    }

}