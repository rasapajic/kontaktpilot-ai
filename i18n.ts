import {getRequestConfig} from 'next-intl/server'

export default getRequestConfig(async () => {
  return {
    locale: 'sr',
    messages: (await import('./lib/messages/sr.json')).default
  }
})