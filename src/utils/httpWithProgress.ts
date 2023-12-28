import { readFile, writeFile } from 'node:fs/promises'
import type { AxiosProgressEvent } from 'axios'
import axios from 'axios'

/**
 * Download a file with progress reporting.
 */
export async function downloadFileWithProgress(url: string, outputFilename: string, onProgress: (e: AxiosProgressEvent) => void): Promise<void> {
  try {
    const response = await axios({
      method: 'get',
      url,
      onDownloadProgress: onProgress,
      responseType: 'arraybuffer',

    })
    await writeFile(outputFilename, response.data)
  }
  catch (error) {
    console.error('Download failed:', error)
    throw error
  }
}

/**
 * Upload a file with progress tracking.
 */
export async function uploadFileWithProgress(token: string, filePath: string, onProgress: (e: AxiosProgressEvent) => void) {
  const fileData = await readFile(filePath)
  const resp = await axios.post('https://api.tinify.com/shrink', fileData, {
    headers: {
      Authorization: `Basic ${btoa(`api:${token}`)}`,
    },
    onUploadProgress: onProgress,
  })
  return {
    meta: resp.data,
    outputUrl: resp.data.output.url,
    fileSize: fileData.length,
  }
}
