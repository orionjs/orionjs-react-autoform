import React from 'react'
import isArray from 'lodash/isArray'
import isPlainObject from 'lodash/isPlainObject'
import {Field} from 'simple-react-form'
import includes from 'lodash/includes'
import {Blackbox, SchemaNode} from '@orion-js/schema'

export interface AutoFormFieldProps {
  field: any
  fieldName: string
  getFieldComponent: (field: Partial<SchemaNode>) => any
  only: string[]
  passProps: Blackbox
  omit: string[]
}

export default class AutoFormField extends React.Component<AutoFormFieldProps> {
  renderObjectFields(fields: any) {
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

  renderField(field: SchemaNode) {
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
      props.type = this.props.getFieldComponent({fieldType: 'array'})
      props.children = this.renderObjectFields(type[0])
    } else if (isPlainObject(type)) {
      props.type = this.props.getFieldComponent({fieldType: 'plainObject'})
      props.children = this.renderObjectFields(type)
    } else {
      props.type = this.props.getFieldComponent(field)
    }

    return <Field {...props} />
  }

  render() {
    return this.renderField(this.props.field)
  }
}
