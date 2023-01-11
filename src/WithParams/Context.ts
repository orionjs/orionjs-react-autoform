import {createContext, useContext} from 'react'
import {WithParamsParams} from '.'

export const ParamsContext = createContext<WithParamsParams>(null)

export function useAutoFormParamsContext() {
  return useContext(ParamsContext)
}
