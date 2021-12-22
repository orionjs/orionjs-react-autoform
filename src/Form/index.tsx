import React from 'react'
import {Form, FormRef} from 'simple-react-form'
import {CleanFunction, dotGetSchema, getValidationErrors, Schema} from '@orion-js/schema'

export interface ButtonRef {
  setOnClick: (onClick: Function) => void
  click: Function
}

export interface AutoFormFormProps {
  params: any
  children: React.ReactNode
  doc: object
  onChange: (doc: object) => any
  setRef: (form: AutoFormForm) => void
  mutate: (variables: object) => Promise<any>
  getErrorFieldLabel: (key: string) => React.ReactNode
  onSuccess: (result: object) => Promise<any> | any
  onValidationError: (errors: object) => void
  schema: Schema
  clean: CleanFunction
  validate: typeof getValidationErrors
  onError: (error: any) => any
  getErrorText: (errorCode: string, keySchema: string) => React.ReactNode | string
  getDefaultLabel: () => React.ReactNode | null
  buttonRef: {current?: ButtonRef}
  useFormTag: boolean
}

export interface AutoFormFormState {
  validationErrors?: object
  doc?: object
}

export default class AutoFormForm extends React.Component<AutoFormFormProps, AutoFormFormState> {
  static defaultProps = {
    onChange: () => {},
    getErrorFieldLabel: key => key,
    useFormTag: true
  }

  state: AutoFormFormState = {}
  form: FormRef = null

  // constructor with bind functions
  constructor(props) {
    super(props)
    this.submit = this.submit.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.submitForm = this.submitForm.bind(this)
    this.validate = this.validate.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  componentDidMount() {
    this.setOnClick()
    // set on click the bad way
    setTimeout(this.setOnClick, 10)
    setTimeout(this.setOnClick, 100)
  }

  setOnClick = () => {
    const ref = this.props.buttonRef
    if (ref && ref.current) {
      ref.current.setOnClick(this.submit)
    }
  }

  componentWillUnmount() {
    const ref = this.props.buttonRef
    if (ref && ref.current) {
      ref.current.setOnClick(null)
    }
  }

  submit() {
    return this.submitForm()
  }

  handleError(error, doc) {
    if (error.graphQLErrors) {
      for (const graphQLError of error.graphQLErrors) {
        if (graphQLError.validationErrors) {
          console.log('Validation errors', graphQLError.validationErrors)
          this.setState({validationErrors: graphQLError.validationErrors, doc})
          this.props.onValidationError(graphQLError.validationErrors)
        } else if (
          graphQLError.error === 'PermissionsError' &&
          graphQLError.type === 'missingRoles'
        ) {
          const roles = graphQLError.roles
          alert(`Client is unauthorized, missing roles: ${roles.join(', ')}`)
        } else {
          console.log(graphQLError)
          this.props.onError(graphQLError)
        }
      }
    } else {
      alert(error.message)
    }
  }

  async onSubmit() {
    const ref = this.props.buttonRef
    if (ref && ref.current) {
      return ref.current.click()
    } else {
      return this.submit()
    }
  }

  async submitForm() {
    const data = this.form.getValue()
    try {
      const errors = await this.validate(data)
      if (errors) {
        return {error: new Error('validationError'), result: null}
      } else {
        const cleaned = await this.props.clean(this.props.schema, data)
        const result = await this.props.mutate(cleaned)
        const mutationResult = await this.props.onSuccess(result)
        return {error: null, result: mutationResult}
      }
    } catch (error) {
      this.handleError(error, data)
      return {error, result: null}
    }
  }

  async validate(doc: object) {
    this.setState({validationErrors: null})
    try {
      const cleaned = await this.props.clean(this.props.schema, doc)
      const validationErrors = (await this.props.validate(this.props.schema, cleaned)) as object
      this.setState({validationErrors, doc})
      if (validationErrors) {
        console.log('validationErrors:', validationErrors)
        this.props.onValidationError(validationErrors)
      }
      return validationErrors
    } catch (error) {
      console.error('Error validating', error)
    }
  }

  onChange(doc) {
    this.setState({doc})
    this.props.onChange(doc)
  }

  getErrorMessages() {
    const {validationErrors} = this.state
    if (!validationErrors) return
    const messages = {}
    for (const key of Object.keys(validationErrors)) {
      const code = validationErrors[key]
      let keySchema = dotGetSchema(this.props.schema, key)
      if (!keySchema) continue
      keySchema = {label: this.props.getDefaultLabel(), ...keySchema}
      const text = this.props.getErrorText(code, keySchema) || code
      messages[key] = text
    }
    return messages
  }

  render() {
    this.props.setRef(this)

    return (
      <Form
        ref={form => (this.form = form)}
        state={this.props.doc}
        errorMessages={this.getErrorMessages()}
        onChange={this.onChange}
        useFormTag={this.props.useFormTag}
        onSubmit={this.onSubmit}>
        {this.props.children}
      </Form>
    )
  }
}
