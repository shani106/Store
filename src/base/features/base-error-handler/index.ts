import { AxiosResponse } from 'axios';
import _ from 'lodash';
import Store from '@base/features/base-store';
import ErrorHandlerConfig from 'configurations/error.config.json';
import { TypesNames } from './reducer';

const { pathToErrorCode, handlers } = ErrorHandlerConfig;

export interface ErrorHandlerRequest<T> {
	component: string;
	level?: string;
	payload: T;
}

export enum ComponentLevels {
	COMPONENT = 'component'
}

export enum BaseComponentTypes {
	IGNORE = 'ignore',
	ERROR_PAGE = 'errorPage'
}

export const clearErrorHandler = () => {
	Store.dispatch({ type: TypesNames.ERROR_HANDLER_HANDLED });
};

export const dispatchErrorHandler = (response: AxiosResponse) => {
	try {
		const { status } = response;
		const errorCode = _.get(response, pathToErrorCode);

		if (errorCode) {
			const errorData = handlers[`${errorCode}_${status}`];

			if (errorData && errorData.component.toLocaleLowerCase() !== BaseComponentTypes.IGNORE) {
				Store.dispatch({
					payload: {
						...errorData,
						status,
						errorCode
					},
					type: TypesNames.ERROR_HANDLER_INVOKE
				});
			}
		} else {
			Store.dispatch({
				payload: {
					component: BaseComponentTypes.ERROR_PAGE,
					status,
					errorCode
				},
				type: TypesNames.ERROR_HANDLER_INVOKE
			});
		}
	} catch (e) {
		// eslint-disable-next-line max-len,no-console
		console.error('There was an error with dispatch error handler, please make sure you define properly your error handler config', e);
		Store.dispatch({
			payload: { component: BaseComponentTypes.ERROR_PAGE },
			type: TypesNames.ERROR_HANDLER_INVOKE
		});
	}
};
