import isArray from 'lodash/isArray'

const rootTypes = {
  email: 'string',
  string: 'string',
  ID: 'string',
  integer: 'number',
  number: 'number',
  array: 'array',
  plainObject: 'plainObject',
  boolean: 'boolean',
  date: 'date'
}

const arrayRootTypes = {}

export default fields => {
  const getField = function(key) {
    const field = fields[key]
    if (!field) throw new Error('No field component for type: ' + key)
    return field
  }

  return function(field) {
    if (field.fieldType) {
      return getField(field.fieldType)
    }

    const fieldMap = isArray(field.type) ? arrayRootTypes : rootTypes
    const typeId = isArray(field.type) ? field.type[0] : field.type
    const rootType = fieldMap[typeId]
    if (rootType) {
      return getField(rootType)
    }

    const text = isArray(field.type) ? `[${typeId}]` : typeId
    throw new Error('No field component for type: ' + text)
  }
}
