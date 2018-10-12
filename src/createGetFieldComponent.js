import isArray from 'lodash/isArray'

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

    const typeId = isArray(field.type) ? field.type[0] : field.type
    const text = isArray(field.type) ? `[${typeId}]` : typeId
    return getField(text)
  }
}
