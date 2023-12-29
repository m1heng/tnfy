import { describe, expect, it, vi } from 'vitest'
import { tinifyWithProgress } from './tinify'
import { downloadFileWithProgress, uploadFileWithProgress } from './utils/httpWithProgress'

vi.mock('./utils/httpWithProgress', () => {
  return {
    uploadFileWithProgress: vi.fn().mockResolvedValue({
      outputUrl: 'testOutputUrl',
      meta: { some: 'meta' },
    }),
    downloadFileWithProgress: vi.fn(),
  }
})

describe('tinifyWithProgress', () => {
  it('should upload and download file with progress', async () => {
    const mockProgressCallback = vi.fn()

    const mockFilePath = 'testFilePath'
    const mockToken = 'testToke1n'

    await tinifyWithProgress(mockFilePath, mockToken, mockProgressCallback)

    expect(uploadFileWithProgress).toHaveBeenCalledWith(mockToken, mockFilePath, expect.any(Function))
    expect(downloadFileWithProgress).toHaveBeenCalledWith('testOutputUrl', mockFilePath, expect.any(Function))
  })
})
