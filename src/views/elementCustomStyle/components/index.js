const componentsUrlList = import.meta.glob('./*.vue')
import { defineAsyncComponent } from 'vue'

const componentsList = []

for (const path in componentsUrlList) {
  if (Object.prototype.hasOwnProperty.call(componentsUrlList, path)) {
    const moduleName = path.replace(/^\.\//, '').replace(/\.vue$/, '')
    const moduleConfig = defineAsyncComponent(componentsUrlList[path])
    componentsList.push({
      moduleName,
      moduleConfig,
    })
  }
}

export { componentsList }