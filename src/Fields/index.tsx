import {SchemaNode} from '@orion-js/schema'
import includes from 'lodash/includes'
import isArray from 'lodash/isArray'
import React from 'react'
import Param from './Param'
import getFieldComponent from './getFieldComponent'

export interface AutoFormFieldProps {
  params: any
  getField: (fieldType: string) => any
  extendFields?: Record<string, any>
  omit?: string[] | string
  only?: string[] | string
  passProps?: any
}

export class Fields extends React.Component<AutoFormFieldProps> {
  static defaultProps = {
    passProps: {},
  }

  getFieldComponent = (field: Partial<SchemaNode>) => {
    return getFieldComponent(field, this.props.getField, this.props.extendFields)
  }

  renderFields(params) {
    if (!params) return
    if (Object.keys(params).length === 0) return

    const omit = this.props.omit
      ? isArray(this.props.omit)
        ? this.props.omit
        : [this.props.omit]
      : []
    const only = this.props.only
      ? isArray(this.props.only)
        ? this.props.only
        : [this.props.only]
      : []

    const keys = Object.keys(params)
      .filter(key => {
        if (!only.length) return true
        for (const onlyItem of only) {
          if (onlyItem.startsWith(key)) return true
        }

        return false
      })
      .filter(key => !includes(omit, key))

    return keys.map(key => {
      return (
        <Param
          key={key}
          omit={omit}
          only={only}
          field={params[key]}
          fieldName={key}
          getFieldComponent={this.getFieldComponent}
          extendFields={this.props.extendFields}
          passProps={this.props.passProps}
        />
      )
    })
  }

  render() {
    return this.renderFields(this.props.params)
  }
}
