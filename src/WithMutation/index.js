import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import {withApollo} from 'react-apollo'

@withApollo
export default class WithMutation extends React.Component {
  static propTypes = {
    client: PropTypes.object,
    children: PropTypes.func,
    params: PropTypes.object,
    mutation: PropTypes.string,
    fragment: PropTypes.any,
    refetchQueries: PropTypes.array
  }

  getArguments() {
    const keys = Object.keys(this.props.params)
    if (keys.length === 0) return ''
    const args = keys
      .map(key => {
        const field = this.props.params[key]
        return `$${key}: ${field.__graphQLType}`
      })
      .join(', ')

    return `(${args})`
  }

  getParams() {
    const keys = Object.keys(this.props.params)
    if (keys.length === 0) return ''
    const params = keys
      .map(key => {
        return `${key}: $${key}`
      })
      .join(', ')
    return `(${params})`
  }

  getSubselection() {
    const fragment = this.props.fragment
    if (!fragment) return ''
    const fragmentName = fragment.definitions[0].name.value
    return `{...${fragmentName}}`
  }

  getMutationText() {
    return `
      mutation ${this.props.mutation} ${this.getArguments()} {
        result: ${this.props.mutation}  ${this.getParams()} ${this.getSubselection()}
      }
    `
  }

  getMutation() {
    const {client, fragment, refetchQueries} = this.props
    const text = this.getMutationText()
    const mutation = gql([text, ''], fragment || '')
    return async variables => {
      const {data} = await client.mutate({
        mutation,
        variables,
        refetchQueries
      })
      return data.result
    }
  }

  render() {
    const mutate = this.getMutation()
    return this.props.children(mutate)
  }
}
