import type { BookInfo, IOptions, IResult } from '@/types/booStore'

const dbName = 'bookStore'
const version = 1

function openIndexDb(name: string, version: number, options: IOptions): IDBOpenDBRequest {
  const db = window.indexedDB.open(name, version)

  db.onerror = (event: Event) => {
    console.error('Error: 打开数据库失败')
    console.error(event)
    if (options.onerror) {
      options.onerror(event)
    }
  }

  db.onsuccess = (event: any) => {
    console.log('Success: 打开数据库')

    const db = event.target.result as IDBDatabase
    db.onversionchange = (event: IDBVersionChangeEvent) => {
      console.log('数据库版本变化, 需要刷新页面')
      alert('数据库版本变化, 需要刷新页面')
      window.location.reload()
    }

    if (options.onsuccess) {
      options.onsuccess(event)
    }
  }

  db.onupgradeneeded = (event: IDBVersionChangeEvent) => {
    console.log('触发数据库升级')
    if (options.onupgradeneeded) {
      options.onupgradeneeded(event)
    }
  }

  db.onblocked = (event) => {
    console.log('数据库被阻塞')
    if (options.onblock) {
      options.onblock(event)
    }
  }

  return db
}

function upgradeneededVersionOne(event: any) {
  const db = event.target.result as IDBDatabase
  const objectStore = db.createObjectStore('bookStore', {
    keyPath: 'id',
    autoIncrement: true
  })

  objectStore.createIndex('creator', 'creator', { unique: false })
  objectStore.createIndex('description', 'description', { unique: false })
  objectStore.createIndex('title', 'title', { unique: true })
  objectStore.createIndex('language', 'language', { unique: false })
  objectStore.createIndex('modified_date', 'modified_date', { unique: false })
  objectStore.createIndex('pubdate', 'pubdate', { unique: false })
  objectStore.createIndex('publisher', 'publisher', { unique: false })
  objectStore.createIndex('push_date', 'push_date', { unique: false })
}

export const addBook = function (bookInfo: BookInfo): Promise<IResult> {
  if (!bookInfo.push_date) bookInfo.push_date = new Date()
  return new Promise((resolve, reject) => {
    const dbRequest = openIndexDb(dbName, version, {
      onupgradeneeded: upgradeneededVersionOne,
      onsuccess: (event: any) => {
        const db = event.target.result as IDBDatabase
        const transaction = db.transaction('bookStore', 'readwrite')
        const objectStore = transaction.objectStore('bookStore')

        const request = objectStore.add(bookInfo)
        request.onsuccess = (event: any) => {
          db.close()
          resolve({ status: 200, message: '添加成功' })
        }

        request.onerror = (event: any) => {
          db.close()
          if (event.target.error) {
            reject({ status: 500, message: `添加失败,${event.target.error.message}`, data: event })
          } else {
            reject({ status: 500, message: '添加失败', data: event })
          }
        }
      },
      onerror: (event: any) => {
        if (event.target.error) {
          reject({ status: 500, message: `添加失败,${event.target.error.message}`, data: event })
        } else {
          reject({ status: 500, message: '添加失败', data: event })
        }
      }
    })
  })
}

export const getBooks = function () {
  return new Promise((resolve, reject) => {
    const dbRequest = openIndexDb(dbName, version, {
      onupgradeneeded: upgradeneededVersionOne,
      onsuccess: (event: any) => {
        const db = event.target.result as IDBDatabase
        const transaction = db.transaction('bookStore', 'readonly')
        const objectStore = transaction.objectStore('bookStore')
      }
    })
  })
}
