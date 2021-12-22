import {SchemaNode} from '@orion-js/schema'
import isArray from 'lodash/isArray'

export default (field: Partial<SchemaNode>, getField: (fieldType: string) => any) => {
  const finalGetField = function (key: string) {
    const field = getField(key)
    if (!field) throw new Error('No field component for type: ' + key)
    return field
  }

  if (field.fieldType) {
    return finalGetField(field.fieldType)
  }

  const typeId = isArray(field.type) ? field.type[0] : field.type
  const text = (isArray(field.type) ? `[${typeId}]` : typeId) as string
  return finalGetField(text)
}
