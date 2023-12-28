import { downloadFileWithProgress, uploadFileWithProgress } from './utils/httpWithProgress'

export async function tinifyWithProgress(filePath: string, token: string, onProgress: ({
  progress,
  stage,
}: {
  progress: number
  stage: 'upload' | 'download'
}) => void) {
  const uploadResp = await uploadFileWithProgress(token, filePath, (e) => {
    onProgress({
      progress: e.loaded / (e.total || 1),
      stage: 'upload',
    })
  })

  if (!uploadResp.outputUrl)
    throw new Error('Upload failed.')

  await downloadFileWithProgress(uploadResp.outputUrl, filePath, (e) => {
    onProgress({
      progress: e.loaded / (e.total || 1),
      stage: 'download',
    })
  })

  return {
    meta: uploadResp.meta,
    outputUrl: uploadResp.outputUrl,
  }
}
