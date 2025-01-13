import { Correlation } from '@/@types/parseable/api/correlation';
import { Axios } from './axios';
import { DELETE_SAVED_CORRELATION_URL, GET_SAVED_CORRELATION_URL, LIST_CORRELATIONS } from './constants';

export const getCorrelations = () => {
	return Axios().get<Correlation[]>(LIST_CORRELATIONS);
};

export const getCorrelationById = (correlationId: string) => {
	return Axios().get(GET_SAVED_CORRELATION_URL(correlationId));
};

export const deleteSavedCorrelation = (correlationId: string) => {
	return Axios().delete(DELETE_SAVED_CORRELATION_URL(correlationId));
};

export const saveCorrelation = (correlationData: Correlation) => {
	return Axios().post(LIST_CORRELATIONS, correlationData);
};
