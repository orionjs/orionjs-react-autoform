import React from 'react'
import PropTypes from 'prop-types'
import WithParams from './WithParams'
import Form from './Form'
import createGetFieldComponent from './createGetFieldComponent'
import autobind from 'autobind-decorator'
import Fields from './Fields'
import WithMutation from './WithMutation'
import getFragment from './getFragment'
import {getValidationErrors, clean} from '@orion-js/schema'

export default passedOptions => {
  const defaultOptions = {
    fields: {},
    onError: error => alert(error.message),
    getErrorText: (code, field) => code,
    loading: null,
    getDefaultLabel: () => 'This field'
  }
  const options = {...defaultOptions, ...passedOptions}

  const getFieldComponent = createGetFieldComponent(options.fields)

  class AutoForm extends React.Component {
    static propTypes = {
      mutation: PropTypes.string,
      doc: PropTypes.object,
      onChange: PropTypes.func,
      children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
      fragment: PropTypes.any,
      getErrorFieldLabel: PropTypes.func,
      onSuccess: PropTypes.func,
      onValidationError: PropTypes.func,
      onError: PropTypes.func,
      clean: PropTypes.func,
      validate: PropTypes.func,
      schema: PropTypes.object,
      omit: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
      only: PropTypes.string,
      getErrorText: PropTypes.func,
      getDefaultLabel: PropTypes.func,
      refetchQueries: PropTypes.array
    }

    static defaultProps = {
      children: props => <Fields getFieldComponent={getFieldComponent} {...props} />,
      clean: async (schema, doc) => await clean(schema, doc),
      validate: async (schema, doc) => await getValidationErrors(schema, doc),
      omit: [],
      onSuccess: () => {},
      onValidationError: () => {},
      onError: options.onError,
      getErrorText: options.getErrorText,
      getDefaultLabel: options.getDefaultLabel
    }

    @autobind
    submit() {
      return this.form.submit()
    }

    renderChildren({params}) {
      if (typeof this.props.children === 'function') {
        return this.props.children({
          params,
          parent: this,
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
      return (
        <WithParams name={this.props.mutation} loading={options.loading}>
          {({name, result, basicResultQuery, params}) => (
            <WithMutation
              refetchQueries={this.props.refetchQueries}
              params={params}
              fragment={this.getFragment({name, result, basicResultQuery, params})}
              mutation={this.props.mutation}>
              {mutate => (
                <Form
                  setRef={form => (this.form = form)}
                  doc={this.props.doc}
                  mutate={mutate}
                  onChange={this.props.onChange}
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

  AutoForm.getFieldComponent = getFieldComponent

  return AutoForm
}
