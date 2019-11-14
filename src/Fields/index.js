import React from 'react'
import PropTypes from 'prop-types'
import Param from './Param'
import includes from 'lodash/includes'
import isArray from 'lodash/isArray'

export default class Fields extends React.Component {
  static propTypes = {
    params: PropTypes.object,
    getFieldComponent: PropTypes.func,
    parent: PropTypes.any,
    omit: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    only: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    passProps: PropTypes.object
  }

  static defaultProps = {
    passProps: {}
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
          parent={this.props.parent}
          field={params[key]}
          fieldName={key}
          getFieldComponent={this.props.getFieldComponent}
          passProps={this.props.passProps}
        />
      )
    })
  }

  render() {
    return this.renderFields(this.props.params)
  }
}
