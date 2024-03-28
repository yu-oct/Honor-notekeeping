
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';
export const SEARCH_REQUEST = 'SEARCH_REQUEST';
export const SEARCH_SUCCESS = 'SEARCH_SUCCESS';
export const SEARCH_FAILURE = 'SEARCH_FAILURE';

export const loginRequest = () => ({
    type: LOGIN_REQUEST,
});

export const loginSuccess = (user: any) => ({
    type: LOGIN_SUCCESS,
    payload: user,
});

export const loginFailure = (error: string) => ({
    type: LOGIN_FAILURE,
    payload: error,
});

export const logout = () => ({
    type: LOGOUT,
});


export const searchRequest = (keyword: string) => ({
    type: SEARCH_REQUEST,
    payload: keyword,
});

export const searchSuccess = (results: any) => ({
    type: SEARCH_SUCCESS,
    payload: results,
});

export const searchFailure = (error: string) => ({
    type: SEARCH_FAILURE,
    payload: error,
});