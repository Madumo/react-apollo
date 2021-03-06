import { Component, createElement } from 'react';
import * as PropTypes from 'prop-types';

const invariant = require('invariant');
const assign = require('object-assign');

const hoistNonReactStatics = require('hoist-non-react-statics');

import ApolloClient from 'apollo-client';

import { OperationOption } from './types';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export function withApollo<TProps, TResult>(
  WrappedComponent,
  operationOptions: OperationOption<TProps, TResult> = {},
) {
  const withDisplayName = `withApollo(${getDisplayName(WrappedComponent)})`;

  class WithApollo extends Component<any, any> {
    static displayName = withDisplayName;
    static WrappedComponent = WrappedComponent;
    static contextTypes = { client: PropTypes.object.isRequired };

    // data storage
    private client: ApolloClient<any>; // apollo client

    // wrapped instance
    private wrappedInstance: any;

    constructor(props, context) {
      super(props, context);
      this.client = context.client;
      this.setWrappedInstance = this.setWrappedInstance.bind(this);

      invariant(
        !!this.client,
        `Could not find "client" in the context of ` +
          `"${withDisplayName}". ` +
          `Wrap the root component in an <ApolloProvider>`,
      );
    }

    getWrappedInstance() {
      invariant(
        operationOptions.withRef,
        `To access the wrapped instance, you need to specify ` +
          `{ withRef: true } in the options`,
      );

      return this.wrappedInstance;
    }

    setWrappedInstance(ref) {
      this.wrappedInstance = ref;
    }

    render() {
      const props = assign({}, this.props);
      props.client = this.client;
      if (operationOptions.withRef) props.ref = this.setWrappedInstance;
      return createElement(WrappedComponent, props);
    }
  }

  // Make sure we preserve any custom statics on the original component.
  return hoistNonReactStatics(WithApollo, WrappedComponent, {});
}
