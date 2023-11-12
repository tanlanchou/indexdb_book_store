import type { IResult } from '@/types/booStore'

export const getImageDataByUrl = function (url: string): Promise<IResult> {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader()

        reader.onload = () => {
          const base64String = reader.result
          resolve({
            status: 200,
            message: 'ok',
            data: base64String
          })
        }

        reader.readAsDataURL(blob)
      })
      .catch((ex: any) => {
        reject({
          status: 500,
          message: 'error',
          data: ex.message
        })
      })
  })
}
