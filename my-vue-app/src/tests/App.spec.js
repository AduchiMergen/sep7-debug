import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(App)
    expect(wrapper.exists()).toBe(true)
  })
})
