import React from 'react'
import PropTypes from 'prop-types'
import isArray from 'lodash/isArray'
import isPlainObject from 'lodash/isPlainObject'
import {Field} from 'simple-react-form'

export default class AutoFormField extends React.Component {
  static propTypes = {
    field: PropTypes.object,
    fieldName: PropTypes.string,
    getFieldComponent: PropTypes.func,
    only: PropTypes.string,
    passProps: PropTypes.object
  }

  renderObjectFields(fields) {
    return Object.keys(fields).map(key => {
      return (
        <AutoFormField
          key={key}
          field={fields[key]}
          fieldName={key}
          getFieldComponent={this.props.getFieldComponent}
          passProps={this.props.passProps}
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
      props.type = this.props.getFieldComponent(field)
    } else if (isArray(type) && isPlainObject(type[0])) {
      props.type = this.props.getFieldComponent({type: 'array'})
      props.children = this.renderObjectFields(type[0])
    } else if (isPlainObject(type)) {
      props.type = this.props.getFieldComponent({type: 'plainObject'})
      props.children = this.renderObjectFields(type)
    } else {
      props.type = this.props.getFieldComponent(field)
    }

    return <Field {...props} />
  }

  render() {
    return this.renderField(this.props.field, this.props.fieldName)
  }
}
