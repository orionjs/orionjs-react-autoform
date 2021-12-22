import React from 'react'
import WithParams from './WithParams'
import Form, {AutoFormFormProps} from './Form'
import Fields from './Fields'
import WithMutation from './WithMutation'
import getFragment from './getFragment'
import {getValidationErrors, clean} from '@orion-js/schema'
import debounce from 'lodash/debounce'
import {ApolloClient} from '@apollo/client'

export interface AutoFormChildrenProps {
  params: object
  omit: string[] | string
  only: string[] | string
}

export interface AutoFormProps {
  mutation: string
  doc?: object
  onChange?: (newDoc: object) => any
  children?: (props: AutoFormChildrenProps) => React.ReactNode | React.ReactNode
  fragment?: any
  getErrorFieldLabel?: AutoFormFormProps['getErrorFieldLabel']
  onSuccess?: AutoFormFormProps['onSuccess']
  onValidationError?: AutoFormFormProps['onValidationError']
  onError?: AutoFormFormProps['onError']
  clean?: AutoFormFormProps['clean']
  validate?: AutoFormFormProps['validate']
  schema?: AutoFormFormProps['schema']
  omit?: string[] | string
  only?: string[] | string
  getErrorText?: AutoFormFormProps['getErrorText']
  getDefaultLabel?: AutoFormFormProps['getDefaultLabel']
  refetchQueries?: string[]
  buttonRef?: AutoFormFormProps['buttonRef']
  autoSave?: boolean
  autoSaveDebounceTime?: number
  useFormTag?: boolean
  client?: any
}

export interface CreateAutoFormOptions {
  getField: (fieldType: string) => any
  onError: (error: any) => any
  getErrorText: AutoFormFormProps['getErrorText']
  loading: JSX.Element
  getDefaultLabel: () => string
  getClient?: () => ApolloClient<any>
}

let options: CreateAutoFormOptions = {
  getField: () => {
    throw new Error('You must pass a getField function')
  },
  onError: error => alert(error.message),
  getErrorText: (code, field) => code,
  loading: null,
  getDefaultLabel: () => 'This field'
}

export class AutoForm extends React.Component<AutoFormProps> {
  static defaultProps: Partial<AutoFormProps> = {
    children: props => <Fields getField={options.getField} {...props} />,
    clean: clean,
    validate: getValidationErrors,
    omit: [],
    only: [],
    onSuccess: () => {},
    onValidationError: () => {},
    onError: options.onError,
    getErrorText: options.getErrorText,
    getDefaultLabel: options.getDefaultLabel,
    autoSaveDebounceTime: 500
  }

  form: Form = null
  debouncedSubmit: Function = null

  constructor(props) {
    super(props)
    this.debouncedSubmit = debounce(this.submit, props.autoSaveDebounceTime)
  }

  submit = () => {
    return this.form.submit()
  }

  onChange = newDoc => {
    if (this.props.onChange) {
      this.props.onChange(newDoc)
    }
    if (this.props.autoSave) {
      this.debouncedSubmit()
    }
  }

  renderChildren({params}) {
    if (typeof this.props.children === 'function') {
      return this.props.children({
        params,
        omit: this.props.omit,
        only: this.props.only
      })
    } else {
      return this.props.children
    }
  }

  getFragment({name, result, basicResultQuery, params}) {
    if (this.props.fragment) {
      return this.props.fragment
    } else {
      return getFragment({name, result, basicResultQuery, params})
    }
  }

  render() {
    const passedClient = options.getClient ? options.getClient() : undefined
    const client = this.props.client ? this.props.client : passedClient

    return (
      <WithParams name={this.props.mutation} loading={options.loading} client={client}>
        {({name, result, basicResultQuery, params}) => (
          <WithMutation
            refetchQueries={this.props.refetchQueries}
            params={params}
            fragment={this.getFragment({name, result, basicResultQuery, params})}
            mutation={this.props.mutation}>
            {(mutate: AutoFormFormProps['mutate']) => (
              <Form
                setRef={form => (this.form = form)}
                buttonRef={this.props.buttonRef}
                doc={this.props.doc}
                mutate={mutate}
                useFormTag={this.props.useFormTag}
                onChange={this.onChange}
                params={params}
                getDefaultLabel={this.props.getDefaultLabel}
                schema={this.props.schema || params}
                onSuccess={this.props.onSuccess}
                onError={this.props.onError}
                getErrorFieldLabel={this.props.getErrorFieldLabel}
                onValidationError={this.props.onValidationError}
                clean={this.props.clean}
                getErrorText={this.props.getErrorText}
                validate={this.props.validate}>
                {this.renderChildren({params: this.props.schema || params})}
              </Form>
            )}
          </WithMutation>
        )}
      </WithParams>
    )
  }
}

export default function createAutoForm(passedOptions: CreateAutoFormOptions) {
  options = {
    ...options,
    ...passedOptions
  }

  return AutoForm
}
