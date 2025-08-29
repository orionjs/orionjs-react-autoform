import {describe, expect, it, vi} from 'vitest'
import {AutoForm, options, setupAutoForm} from '../AutoForm'

// Mock setup for AutoForm
const mockGetField = vi.fn(() => 'MockField')
const mockOnError = vi.fn()
const mockGetErrorText = vi.fn(code => `Error: ${code}`)
const mockGetDefaultLabel = vi.fn(() => 'Default Label')

describe('AutoForm', () => {
  it('should have correct default props', () => {
    expect(AutoForm.defaultProps).toEqual(
      expect.objectContaining({
        omit: [],
        only: [],
        autoSaveDebounceTime: 500,
      }),
    )
  })

  it('should call onChange when provided', () => {
    const mockOnChange = vi.fn()
    const autoForm = new AutoForm({
      mutation: 'testMutation',
      onChange: mockOnChange,
    })

    const testDoc = {field: 'value'}
    autoForm.onChange(testDoc)

    expect(mockOnChange).toHaveBeenCalledWith(testDoc)
  })

  it('should setup AutoForm options correctly', () => {
    setupAutoForm({
      getField: mockGetField,
      onError: mockOnError,
      getErrorText: mockGetErrorText,
      loading: null,
      defaultFetchPolicy: 'cache-first',
      getDefaultLabel: mockGetDefaultLabel,
    })

    expect(options.getField).toBe(mockGetField)
    expect(options.onError).toBe(mockOnError)
    expect(options.getErrorText).toBe(mockGetErrorText)
    expect(options.getDefaultLabel).toBe(mockGetDefaultLabel)
    expect(options.defaultFetchPolicy).toBe('cache-first')
  })

  it('should create debounced submit function when autoSave is enabled', () => {
    const autoForm = new AutoForm({
      mutation: 'testMutation',
      autoSave: true,
    })

    expect(typeof autoForm.debouncedSubmit).toBe('function')
  })
})
