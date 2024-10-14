import {ApolloClient, WatchQueryFetchPolicy} from '@apollo/client'
import {Blackbox, clean, getValidationErrors} from '@orion-js/schema'
import {print as printGraphQL} from 'graphql'
import gql from 'graphql-tag'
import debounce from 'lodash/debounce'
import React from 'react'
import {Fields} from './Fields'
import Form, {AutoFormFormProps} from './Form'
import {WithFormId} from './Form/WithFormId'
import WithMutation from './WithMutation'
import WithParams from './WithParams'
import getFragment from './getFragment'

export interface AutoFormChildrenProps {
  params: Blackbox
  omit: string[] | string
  only: string[] | string
  extendFields?: Record<string, any>
}

export interface AutoFormProps {
  /**
   * Name of the mutation
   */
  mutation: string
  /**
   * The initial document
   */
  doc?: Blackbox
  onChange?: (newDoc: any) => any
  children?: React.ReactNode | ((props: AutoFormChildrenProps) => React.ReactNode)
  /**
   * Custom fragment to use in the mutation
   */
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
  useFormTag?: AutoFormFormProps['useFormTag']
  className?: AutoFormFormProps['className']
  client?: any
  resetOnSubmit?: boolean
  /**
   * The fetch policy to use for the getParams query. Defaults to 'cache-first'.
   */
  fetchPolicy?: WatchQueryFetchPolicy
  /**
   * The id of the form. If not provided, a random id will be generated.
   */
  formId?: AutoFormFormProps['formId']

  /**
   * Extends the fields object with custom fields for only this form.
   */
  extendFields?: Record<string, any>
}

export interface CreateAutoFormOptions {
  getField: (fieldType: string) => any
  onError: (error: any) => any
  getErrorText: AutoFormFormProps['getErrorText']
  loading: JSX.Element
  defaultFetchPolicy?: WatchQueryFetchPolicy
  getDefaultLabel: () => string
  getClient?: () => ApolloClient<any>
}

export const options: CreateAutoFormOptions = {
  getField: () => {
    throw new Error('You must pass a getField function')
  },
  onError: error => alert(error.message),
  getErrorText: (code, _field) => code,
  loading: null,
  defaultFetchPolicy: 'cache-first',
  getDefaultLabel: () => 'This field',
}

export class AutoForm extends React.Component<AutoFormProps> {
  static defaultProps: Partial<AutoFormProps> = {
    clean: clean,
    validate: getValidationErrors,
    omit: [],
    only: [],
    onSuccess: () => {},
    onValidationError: () => {},
    onError: error => options.onError(error),
    getErrorText: (code, field) => options.getErrorText(code, field),
    getDefaultLabel: () => options.getDefaultLabel(),
    autoSaveDebounceTime: 500,
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

  reset = () => {
    this.form.form.reset()
  }

  onSuccess = async (result: Blackbox) => {
    if (this.props.onSuccess) {
      await this.props.onSuccess(result)
    }
    if (this.props.resetOnSubmit) {
      this.reset()
    }
  }

  onChange = newDoc => {
    if (this.props.onChange) {
      this.props.onChange(newDoc)
    }
    if (this.props.autoSave) {
      this.debouncedSubmit()
    }
  }

  setDoc = newDoc => {
    this.onChange(newDoc)
  }

  renderLoading() {
    // if children is fixed, no need to show loading
    if (typeof this.props.children === 'function' || !this.props.children) {
      return <>{options.loading}</>
    }

    return <>{this.props.children}</>
  }

  renderChildren({params}) {
    if (!this.props.children) {
      return (
        <Fields
          getField={options.getField}
          extendFields={this.props.extendFields || {}}
          params={params}
          omit={this.props.omit}
          only={this.props.only}
        />
      )
    }
    if (typeof this.props.children === 'function') {
      return this.props.children({
        params,
        omit: this.props.omit,
        only: this.props.only,
        extendFields: this.props.extendFields,
      })
    }
    return this.props.children
  }

  getFragment({name, result, basicResultQuery}) {
    if (this.props.fragment) {
      if (this.props.fragment.loc) {
        return this.props.fragment
      }
      return gql`${printGraphQL(this.props.fragment)}`
    }
    return getFragment({name, result, basicResultQuery})
  }

  render() {
    const passedClient = options.getClient ? options.getClient() : undefined
    const client = this.props.client ? this.props.client : passedClient

    if (!client) {
      throw new Error('You must pass a client or pass a getClient function')
    }

    return (
      <WithParams
        fetchPolicy={this.props.fetchPolicy || options.defaultFetchPolicy}
        name={this.props.mutation}
        loading={this.renderLoading()}
        client={client}
      >
        {({name, result, basicResultQuery, params}) => (
          <WithMutation
            client={client}
            refetchQueries={this.props.refetchQueries}
            params={params}
            fragment={this.getFragment({name, result, basicResultQuery})}
            mutation={this.props.mutation}
          >
            {(mutate: AutoFormFormProps['mutate']) => (
              <WithFormId formId={this.props.formId}>
                {formId => (
                  <Form
                    setRef={form => {
                      this.form = form
                    }}
                    buttonRef={this.props.buttonRef}
                    doc={this.props.doc}
                    mutate={mutate}
                    useFormTag={this.props.useFormTag}
                    className={this.props.className}
                    onChange={this.onChange}
                    params={params}
                    getDefaultLabel={this.props.getDefaultLabel}
                    schema={this.props.schema || params}
                    onSuccess={this.onSuccess}
                    onError={this.props.onError}
                    getErrorFieldLabel={this.props.getErrorFieldLabel}
                    onValidationError={this.props.onValidationError}
                    clean={this.props.clean}
                    getErrorText={this.props.getErrorText}
                    validate={this.props.validate}
                    formId={formId}
                  >
                    {this.renderChildren({params: this.props.schema || params})}
                  </Form>
                )}
              </WithFormId>
            )}
          </WithMutation>
        )}
      </WithParams>
    )
  }
}

export function setupAutoForm(passedOptions: CreateAutoFormOptions) {
  for (const key in passedOptions) {
    options[key] = passedOptions[key]
  }
}
