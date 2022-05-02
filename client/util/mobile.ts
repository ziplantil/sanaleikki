
export default function hasVirtualKeyboardOnly() {
  // fragile
  return 'ontouchstart' in document.documentElement
}
