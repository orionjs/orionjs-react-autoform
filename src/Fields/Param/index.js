import React from 'react'
import PropTypes from 'prop-types'
import isArray from 'lodash/isArray'
import isPlainObject from 'lodash/isPlainObject'
import {Field} from 'simple-react-form'
import includes from 'lodash/includes'

export default class AutoFormField extends React.Component {
  static propTypes = {
    field: PropTypes.object,
    fieldName: PropTypes.string,
    getFieldComponent: PropTypes.func,
    only: PropTypes.array,
    passProps: PropTypes.object,
    omit: PropTypes.array
  }

  renderObjectFields(fields) {
    const currentOmit = this.props.omit
      .filter(key => key && key.startsWith(this.props.fieldName + '.'))
      .map(key => key.replace(this.props.fieldName + '.', ''))

    const currentOnly = this.props.only
      .filter(key => key && key.startsWith(this.props.fieldName + '.'))
      .map(key => key.replace(this.props.fieldName + '.', ''))

    return Object.keys(fields)
      .filter(key => (currentOnly.length ? includes(currentOnly, key) : true))
      .filter(key => !includes(currentOmit, key))
      .map(key => {
        return (
          <AutoFormField
            key={key}
            field={fields[key]}
            fieldName={key}
            getFieldComponent={this.props.getFieldComponent}
            passProps={this.props.passProps}
            omit={currentOmit}
            only={currentOnly}
          />
        )
      })
  }

  renderField(field) {
    const {type, label, placeholder, description, fieldType, fieldOptions = {}} = field
    const props = {
      label,
      placeholder,
      description,
      ...fieldOptions,
      ...this.props.passProps,
      fieldName: this.props.fieldName
    }

    if (fieldType) {
      props.type = this.props.getFieldComponent(field, this.props.fieldName)
    } else if (isArray(type) && isPlainObject(type[0])) {
      props.type = this.props.getFieldComponent({type: 'array'}, this.props.fieldName)
      props.children = this.renderObjectFields(type[0])
    } else if (isPlainObject(type)) {
      props.type = this.props.getFieldComponent({type: 'plainObject'}, this.props.fieldName)
      props.children = this.renderObjectFields(type)
    } else {
      props.type = this.props.getFieldComponent(field, this.props.fieldName)
    }

    return <Field {...props} />
  }

  render() {
    return this.renderField(this.props.field, this.props.fieldName)
  }
}
