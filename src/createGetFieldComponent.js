import isArray from 'lodash/isArray'

export default fields => {
  const getField = function(key, fieldName) {
    const field = fields[key]
    if (!field) throw new Error('No field component for field: ' + fieldName + ', type: ' + key)
    return field
  }

  return function(field, fieldName) {
    if (field.fieldType) {
      return getField(field.fieldType, fieldName)
    }

    const typeId = isArray(field.type) ? field.type[0] : field.type
    const text = isArray(field.type) ? `[${typeId}]` : typeId
    return getField(text, fieldName)
  }
}
