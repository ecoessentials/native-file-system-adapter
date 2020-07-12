/* global globalThis */

import { WritableStream } from 'web-streams-polyfill/dist/ponyfill.es2018'

const Writable = globalThis.WritableStream || WritableStream

/**
 * @lends WritableStream
 */
class FileSystemWritableFileStream extends Writable {
  constructor(sink) {
    super(sink)
    this._closed = false
  }
  close() {
    this._closed = true
    const w = this.getWriter()
    const p = w.close()
    w.releaseLock()
    return p
    // return super.close ? super.close() : this.getWriter().close()
  }
  seek(position) {
    return this.write({ type: 'seek', position })
  }
  truncate(size) {
    return this.write({ type: 'truncate', size })
  }
  write(data) {
    if (this._closed) {
      return Promise.reject(
        new TypeError('Cannot write to a CLOSED writable stream')
      )
    }

    const writer = this.getWriter()
    const p = writer.write(data)
    writer.releaseLock()
    return p
  }
}

Object.defineProperty(
  FileSystemWritableFileStream.prototype,
  Symbol.toStringTag,
  {
    value: 'FileSystemWritableFileStream',
    writable: false,
    enumerable: false,
    configurable: true
  }
)

Object.defineProperties(FileSystemWritableFileStream.prototype, {
  close: { enumerable: true },
  seek: { enumerable: true },
  truncate: { enumerable: true },
  write: { enumerable: true }
})

export default FileSystemWritableFileStream
