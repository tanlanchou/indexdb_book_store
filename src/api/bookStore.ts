import { errorHaddler, errorHaddlerWithDbClose } from '@/common/errorHadller'
import type { BookInfo, BookMarkInfo, IOptions, IResult } from '@/types/booStore'

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
      options.onupgradeneeded(event);
    }

    if (event.oldVersion === 0) {
      upgradeneededVersionOne(event);
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
  objectStore.createIndex('location', 'location', { unique: true })

  const objectStore2 = db.createObjectStore('bookMarks', {
    keyPath: 'id',
    autoIncrement: true
  })

  objectStore2.createIndex('cfi', 'cfi', { unique: true });
  objectStore2.createIndex('bookId', 'bookId', { unique: false });
  objectStore2.createIndex('createdate', 'createdate', { unique: false })
}

export const addBook = function (bookInfo: BookInfo): Promise<IResult> {
  if (!bookInfo.push_date) bookInfo.push_date = new Date()
  return new Promise((resolve, reject) => {
    const dbRequest = openIndexDb(dbName, version, {
      onsuccess: (event: any) => {
        const db = event.target.result as IDBDatabase
        const transaction = db.transaction('bookStore', 'readwrite')
        const objectStore = transaction.objectStore('bookStore')

        const request = objectStore.add(bookInfo)
        request.onsuccess = (event: any) => {
          db.close()
          resolve({ status: 200, message: '添加成功' })
        }

        request.onerror = errorHaddlerWithDbClose(db, reject, '添加失败')
      },
      onerror: errorHaddler(reject, `添加失败`)
    })
  })
}

export const getBooks = function (): Promise<IResult> {
  return new Promise((resolve, reject) => {
    const dbRequest = openIndexDb(dbName, version, {
      onsuccess: (event: any) => {
        const db = event.target.result as IDBDatabase
        const transaction = db.transaction('bookStore', 'readonly')
        const objectStore = transaction.objectStore('bookStore')

        const query = IDBKeyRange.upperBound(new Date())
        const orderBy = ['push_date', 'desc']

        const results = objectStore.getAll(query)
        results.onsuccess = (event: any) => {
          db.close()
          resolve({
            status: 200,
            message: 'ok',
            data: event.target.result || []
          })
        }

        results.onerror = errorHaddlerWithDbClose(db, reject, `获取数据失败`)
      },
      onerror: errorHaddler(reject, `获取数据失败`)
    })
  })
}

/**
 * @description 由于根本没有拿到 ISBN， 所以打算暂时根据title来判断
 * @param title
 */
export const existBook = function (title: string): Promise<IResult> {
  return new Promise((resolve, reject) => {
    openIndexDb(dbName, version, {
      onsuccess: (event: any) => {
        const db = event.target.result as IDBDatabase
        const transaction = db.transaction('bookStore', 'readonly')
        const objectStore = transaction.objectStore('bookStore')

        const results = objectStore.index('title').get(title)
        results.onerror = errorHaddlerWithDbClose(db, reject, '查寻图书失败')
        results.onsuccess = function (event: any) {
          db.close()
          resolve({
            status: 200,
            message: 'ok',
            data: !!event.target.result
          })
        }
      },
      onerror: errorHaddler(reject, '查寻图书失败')
    })
  })
}

export const deleteBook = function (id: number) {
  return new Promise((resolve, reject) => {
    openIndexDb(dbName, version, {
      onsuccess: (event: any) => {
        const db = event.target.result as IDBDatabase
        const transaction = db.transaction('bookStore', 'readwrite')
        const objectStore = transaction.objectStore('bookStore')

        const results = objectStore.delete(id)
        results.onerror = errorHaddlerWithDbClose(db, reject, '删除图书失败')
        results.onsuccess = function () {
          db.close()
          resolve({
            status: 200,
            message: 'ok'
          })
        }
      },
      onerror: errorHaddler(reject, '删除图书成功')
    })
  })
}

export const getBook = function (id: number) {
  return new Promise((resolve, reject) => {
    openIndexDb(dbName, version, {
      onsuccess: (event: any) => {
        const db = event.target.result as IDBDatabase
        const transaction = db.transaction('bookStore', 'readonly')
        const objectStore = transaction.objectStore('bookStore')

        const results = objectStore.get(id)
        results.onerror = errorHaddlerWithDbClose(db, reject, '获取图书失败')
        results.onsuccess = function (event: any) {
          db.close()
          resolve({
            status: 200,
            message: 'ok',
            data: event.target.result
          })
        }
      },
      onerror: errorHaddler(reject, '获取图书失败')
    })
  })
}


export const updateLocation = function (id: number, location: string) {
  return new Promise((resolve, reject) => {
    openIndexDb(dbName, version, {
      onsuccess: (event: any) => {
        const db = event.target.result as IDBDatabase
        const transaction = db.transaction('bookStore', 'readwrite')
        const objectStore = transaction.objectStore('bookStore')

        const results = objectStore.get(id)
        results.onerror = errorHaddlerWithDbClose(db, reject, '获取图书失败')
        results.onsuccess = function (event: any) {
          var book = results.result;
          if (book) {
            book.location = location;

            // 使用 put 方法将更新后的记录存回数据库
            var updateRequest = objectStore.put(book);

            updateRequest.onsuccess = function (event) {
              resolve({
                status: 200,
                message: 'ok',
              })
            };

            updateRequest.onerror = function (event: any) {
              reject(event.target.error);
            };
          } else {
            reject(`找不到图书`);
          }
        }
      },
      onerror: errorHaddler(reject, '获取图书失败')
    })
  })
}

export const addBookMark = function (bookMarkInfo: BookMarkInfo) {

  if (!bookMarkInfo.createdate) bookMarkInfo.createdate = new Date();

  return new Promise((resolve, reject) => {
    openIndexDb(dbName, version, {
      onsuccess: (event: any) => {
        const db = event.target.result as IDBDatabase
        const transaction = db.transaction('bookMarks', 'readwrite')
        const objectStore = transaction.objectStore('bookMarks')

        const request = objectStore.add(bookMarkInfo)
        request.onsuccess = (event: any) => {
          db.close()
          resolve({ status: 200, message: '添加书签成功' })
        }

        request.onerror = errorHaddlerWithDbClose(db, reject, '添加书签失败')
      },
      onerror: errorHaddler(reject, '打开数据库失败')
    })
  });
}

export const deleteBookMark = function (id: number) {
  return new Promise((resolve, reject) => {
    openIndexDb(dbName, version, {
      onsuccess: (event: any) => {
        const db = event.target.result as IDBDatabase
        const transaction = db.transaction('bookMarks', 'readwrite')
        const objectStore = transaction.objectStore('bookMarks')

        const request = objectStore.get(id);
        request.onerror = errorHaddlerWithDbClose(db, reject, '获取书签失败')
        request.onsuccess = (event: any) => {
          let bookMark = event.result;
          if (bookMark) {
            let deleteRequest = objectStore.delete(id);
            deleteRequest.onsuccess = function (event) {
              db.close();
              resolve({
                status: 200,
                message: 'ok',
              })
            };

            deleteRequest.onerror = function (event: any) {
              db.close();
              reject(event.target.error);
            };
          }
          else {
            db.close();
            reject(`找不到书签`);
          }
        }

        request.onerror = errorHaddlerWithDbClose(db, reject, '添加书签失败')
      },
      onerror: errorHaddler(reject, '打开数据库失败')
    })
  });
}

export const getBookMarks = function () {
  return new Promise((resolve, reject) => {
    openIndexDb(dbName, version, {
      onsuccess: (event: any) => {
        const db = event.target.result as IDBDatabase
        const transaction = db.transaction('bookMarks', 'readonly')
        const objectStore = transaction.objectStore('bookMarks')

        const request = objectStore.getAll();
        request.onsuccess = (event: any) => {
          db.close()
          resolve({ status: 200, data: event.target.result })
        }

        request.onerror = errorHaddlerWithDbClose(db, reject, '获取书签失败')
      },
      onerror: errorHaddler(reject, '打开数据库失败')
    })
  });
}

export const getBookMark = function (id: number) {
  return new Promise((resolve, reject) => {
    openIndexDb(dbName, version, {
      onsuccess: (event: any) => {
        const db = event.target.result as IDBDatabase
        const transaction = db.transaction('bookMarks', 'readonly')
        const objectStore = transaction.objectStore('bookMarks')

        const request = objectStore.get(id)
        request.onsuccess = (event: any) => {
          db.close()
          resolve({ status: 200, data: event.target.result })
        }

        request.onerror = errorHaddlerWithDbClose(db, reject, '获取书签失败')
      },
      onerror: errorHaddler(reject, '打开数据库失败')
    })
  });
}