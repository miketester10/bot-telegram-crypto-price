import { AxiosError, AxiosResponse } from "axios";

export interface APIResponse {
    symbol: string;
    price: string;
}

export interface APIResponseError extends AxiosError {
    response: AxiosResponse<unknown, any> & { data: {
        errore: string;
    };
}
}