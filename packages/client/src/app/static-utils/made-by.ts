// tslint:disable:no-string-throw no-console
((g: any) => {
  const madeBy = `
      _     _  __ _                _         ____           _     _   _
  ___| |__ (_)/ _| |_ ___ ___   __| | ___   / ___|_ __ ___ | |__ | | | |
 / __| '_ \\| | |_| __/ __/ _ \\ / _\` |/ _ \\ | |  _| '_ \` _ \\| '_ \\| |_| |
 \\__ \\ | | | |  _| || (_| (_) | (_| |  __/ | |_| | | | | | | |_) |  _  |
 |___/_| |_|_|_|  \\__\\___\\___/ \\__,_|\\___|  \\____|_| |_| |_|_.__/|_| |_|

`
  Object.defineProperty(g, 'madeBy', {
    get() {
      console.log(madeBy)
      throw "developers - that's what we are"
    },
    set() {
      throw 'How dare you...'
    },
  })
})(window || global)
