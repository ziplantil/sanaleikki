import Options from '../../common/options'

export function getCachedOptions(): Options {
  const cachedOptions = window.localStorage.getItem('sanaleikkiOptions')
  let preOptions = null
  if (cachedOptions) {
    try {
      preOptions = JSON.parse(cachedOptions) as Options
    } catch (e) { 
      // ignore
    }
  }
  return preOptions
}

export function saveCachedOptions(options: Options) {
  window.localStorage.setItem('sanaleikkiOptions', JSON.stringify(options))
}
