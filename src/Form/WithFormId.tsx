import React, {useId} from 'react'

export interface Props {
  formId?: string
  children: (formId: string) => JSX.Element
}

export function WithFormId({formId, children}: Props) {
  const id = useId()
  const finalFormId = formId || id
  return <>{children(finalFormId)}</>
}
