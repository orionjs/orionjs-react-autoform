import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import {Query} from '@apollo/client/react/components'

const query = gql`
  query getParams($name: ID) {
    params(name: $name, mutation: true) {
      name
      result
      basicResultQuery
      params
    }
  }
`
export default class AutoFormWithSchema extends React.Component {
  static propTypes = {
    children: PropTypes.func,
    name: PropTypes.string,
    loading: PropTypes.node,
    client: PropTypes.object
  }

  render() {
    return (
      <Query query={query} variables={{name: this.props.name}} client={this.props.client}>
        {({loading, error, data}) => {
          if (data && data.params) {
            return this.props.children(data.params)
          }

          if (error) {
            console.error('Error fetching autoform information')
            console.error(error)
            return null
          }

          if (this.props.loading) return this.props.loading
          return null
        }}
      </Query>
    )
  }
}
