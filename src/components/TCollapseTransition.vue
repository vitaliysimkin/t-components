<script setup lang="ts">
// TCollapseTransition — animates height 0 ↔ auto (and opacity) using Vue <Transition> JS hooks.
// No props required. Wrap a single v-show / v-if child.

function onBeforeEnter(el: Element) {
  const htmlEl = el as HTMLElement
  htmlEl.style.height = '0'
  htmlEl.style.opacity = '0'
  htmlEl.style.overflow = 'hidden'
}

function onEnter(el: Element, done: () => void) {
  const htmlEl = el as HTMLElement
  // Force a reflow so the browser registers the initial height=0 before we change it.
  void htmlEl.offsetHeight
  const targetHeight = htmlEl.scrollHeight
  htmlEl.style.transition = 'height var(--t-collapse-duration, 250ms) var(--t-collapse-easing, ease), opacity var(--t-collapse-duration, 250ms) ease'
  htmlEl.style.height = `${targetHeight}px`
  htmlEl.style.opacity = '1'

  function onEnd() {
    htmlEl.removeEventListener('transitionend', onEnd)
    // Restore auto height so the element can grow/shrink naturally after animation.
    htmlEl.style.height = 'auto'
    htmlEl.style.overflow = ''
    htmlEl.style.transition = ''
    done()
  }
  htmlEl.addEventListener('transitionend', onEnd)
}

function onAfterEnter(el: Element) {
  const htmlEl = el as HTMLElement
  htmlEl.style.height = 'auto'
  htmlEl.style.overflow = ''
  htmlEl.style.opacity = ''
  htmlEl.style.transition = ''
}

function onEnterCancelled(el: Element) {
  onAfterEnter(el)
}

function onBeforeLeave(el: Element) {
  const htmlEl = el as HTMLElement
  // Snapshot the current rendered height so we can animate from it.
  htmlEl.style.height = `${htmlEl.offsetHeight}px`
  htmlEl.style.overflow = 'hidden'
}

function onLeave(el: Element, done: () => void) {
  const htmlEl = el as HTMLElement
  // Force reflow so the browser registers the snapshotted height.
  void htmlEl.offsetHeight
  htmlEl.style.transition = 'height var(--t-collapse-duration, 250ms) var(--t-collapse-easing, ease), opacity var(--t-collapse-duration, 250ms) ease'
  htmlEl.style.height = '0'
  htmlEl.style.opacity = '0'

  function onEnd() {
    htmlEl.removeEventListener('transitionend', onEnd)
    htmlEl.style.overflow = ''
    htmlEl.style.transition = ''
    done()
  }
  htmlEl.addEventListener('transitionend', onEnd)
}

function onAfterLeave(el: Element) {
  const htmlEl = el as HTMLElement
  htmlEl.style.height = ''
  htmlEl.style.overflow = ''
  htmlEl.style.opacity = ''
  htmlEl.style.transition = ''
}

function onLeaveCancelled(el: Element) {
  onAfterLeave(el)
}
</script>

<template>
  <Transition
    name="t-collapse"
    :css="false"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @enter-cancelled="onEnterCancelled"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="onAfterLeave"
    @leave-cancelled="onLeaveCancelled"
  >
    <slot />
  </Transition>
</template>
