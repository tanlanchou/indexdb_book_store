export const errorHaddler = function (reject: any, words: string) {
  return function (event: any) {
    if (event.target.error) {
      reject({
        status: 500,
        message: `${words},${event.target.error.message}`,
        data: event
      })
    } else {
      reject({ status: 500, message: words, data: event })
    }
  }
}

export const errorHaddlerWithDbClose = function (db: IDBDatabase, reject: any, words: string) {
  db.close()
  return errorHaddler(reject, words)
}
