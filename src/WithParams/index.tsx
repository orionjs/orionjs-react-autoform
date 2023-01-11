import React from 'react'
import gql from 'graphql-tag'
import {Query} from '@apollo/client/react/components'
import {QueryResult, WatchQueryFetchPolicy} from '@apollo/client'
import {ParamsContext} from './Context'

export interface WithParamsParams {
  name: string
  result: any
  basicResultQuery: string
  params: any
}

export interface WithParamsProps {
  children: (params: WithParamsParams) => JSX.Element | null
  name: string
  loading: JSX.Element
  client: any
  fetchPolicy: WatchQueryFetchPolicy
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
      <Query
        fetchPolicy={this.props.fetchPolicy}
        query={query}
        variables={{name: this.props.name}}
        client={this.props.client}>
        {(result: QueryResult<{params: WithParamsParams}, any>) => {
          const {error, data} = result
          if (data && data.params) {
            return (
              <ParamsContext.Provider value={data.params}>
                {this.props.children(data.params)}
              </ParamsContext.Provider>
            )
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
