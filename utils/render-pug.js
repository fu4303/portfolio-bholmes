const pug = require('pug')
const { extname } = require('path')
const Image = require('@11ty/eleventy-img')

const widths = [600, 800, 1400]
const formats = ['webp', 'jpg']
const inputFormats = [...formats, 'png']

// for relative asset paths, make sure we start with "./" instead of just "/"
const toFormattedSrc = (src = '') => src.replace(/^\//, './')

const toMetadataByImageSrc = async (rawPug, props) => {
  let imageSrcToMetadata = {}
  let asyncQueue = []

  const toOptimizedImg = ({ src, ...attrs }) => {
    if (!src) {
      throw 'All uses of toOptimizedImg must have a src!'
    }
    const imageFormat = extname(src).replace('.', '')
    if (!inputFormats.includes(imageFormat)) return
    asyncQueue.push({
      src,
      callback: Image(toFormattedSrc(src), {
        widths,
        formats,
        outputDir: './build/assets/pug-images',
        urlPath: '/assets/pug-images',
      }),
      options: {
        alt: '',
        sizes: '(min-width: 800px) 720px, 100vw',
        loading: 'lazy',
        decoding: 'async',
        ...attrs,
      },
    })
  }
  pug.render(rawPug, { ...props, toOptimizedImg })
  if (!asyncQueue.length) {
    return {}
  }
  await Promise.all(
    asyncQueue.map(async ({ src, callback, options }) => {
      imageSrcToMetadata[src] = {
        metadata: await callback,
        options,
      }
    })
  )
  return imageSrcToMetadata
}

module.exports = async (rawPug, props) => {
  const imageSrcToMetadata = await toMetadataByImageSrc(rawPug, props)
  const toOptimizedImg = ({ src, alt }) => {
    if (!imageSrcToMetadata[src]) {
      return `<img src=${src} alt=${alt} />`
    }
    const { metadata, options } = imageSrcToMetadata[src]

    return Image.generateHTML(metadata, options)
  }

  return pug.render(rawPug, { ...props, toOptimizedImg })
}
