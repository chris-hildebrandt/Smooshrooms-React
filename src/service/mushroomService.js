// Compatibility shim to preserve the original filename
// Re-exports the React-friendly service implemented in mushroomsService.js
export { mushroomsService } from './mushroomsService.js'
export default (await import('./mushroomsService.js')).mushroomsService
