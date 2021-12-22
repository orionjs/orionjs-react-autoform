import React from 'react'
import gql from 'graphql-tag'
import {Query} from '@apollo/client/react/components'
import {QueryResult} from '@apollo/client'

export interface WithParamsProps {
  children: (params: object) => JSX.Element | null
  name: string
  loading: JSX.Element
  client: any
}

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
export default class WithParams extends React.Component<WithParamsProps> {
  render() {
    return (
      <Query query={query} variables={{name: this.props.name}} client={this.props.client}>
        {(result: QueryResult<any, any>) => {
          const {error, data} = result
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
