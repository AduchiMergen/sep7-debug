// tests/unit/components/TheHeader.spec.js
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TheHeader from '@/components/TheHeader.vue'; // Adjust path as needed

describe('TheHeader.vue', () => {
  it('renders successfully', () => {
    const wrapper = mount(TheHeader);
    expect(wrapper.exists()).toBe(true);
  });
});
