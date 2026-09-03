import type { CustomSelectProps } from './App'

const validProps: CustomSelectProps = {
  label: 'PRIORITY',
  value: 'medium',
  options: ['low', 'medium', 'high'],
  onChange: value => {
    const next: string = value
    void next
  },
}
void validProps

const invalidProps: CustomSelectProps = {
  label: 'PRIORITY',
  // @ts-expect-error A function/setter must never be accepted as CustomSelect.value.
  value: (value: string) => value,
  options: ['low', 'medium', 'high'],
  onChange: value => void value,
}
void invalidProps
