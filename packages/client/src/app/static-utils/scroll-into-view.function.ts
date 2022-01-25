export function scrollIntoView(win: Window, element: HTMLElement, offset: number = 0) {
  const elementPosition = element.getBoundingClientRect().top
  const gotToPos = document.documentElement.scrollTop + elementPosition - offset
  document.documentElement.scrollTop = gotToPos
  document.body.scrollTop = gotToPos // For Safari
}
