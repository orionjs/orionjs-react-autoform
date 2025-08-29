import {QueryResult, WatchQueryFetchPolicy} from '@apollo/client'
import {Query} from '@apollo/client/react/components'
import {cloneDeep} from '@apollo/client/utilities'
import gql from 'graphql-tag'
import {useMemo} from 'react'
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
function WithParamsInner({
  renderChildren,
  params,
}: {
  renderChildren: (params: WithParamsParams) => JSX.Element | null
  params: WithParamsParams
}) {
  const clonedParams = useMemo(() => {
    return cloneDeep(params)
  }, [params])

  return (
    <ParamsContext.Provider value={clonedParams}>
      {renderChildren(clonedParams)}
    </ParamsContext.Provider>
  )
}

export default function WithParams(props: WithParamsProps) {
  return (
    <Query
      fetchPolicy={props.fetchPolicy}
      query={query}
      variables={{name: props.name}}
      client={props.client}
    >
      {(result: QueryResult<{params: WithParamsParams}, any>) => {
        const {error, data} = result

        if (data?.params) {
          return <WithParamsInner params={data.params} renderChildren={props.children} />
        }

        if (error) {
          console.error('Error fetching autoform information')
          console.error(error)
          return null
        }

        if (props.loading) return props.loading
        return null
      }}
    </Query>
  )
}
