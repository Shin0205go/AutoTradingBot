import { Authorize, Options } from "./authorize";
import querystring, { ParsedUrlQueryInput } from "querystring";

// export abstract QPGetChildOrder extends ParsedUrlQueryInput {
//     _product_code: string
//     _count: number
//     _before?: any
//     _after?: any
//     _child_order_state: string
//     _child_order_id?: any
//     _child_order_acceptance_id?: any
// }

export class GetChildOrders {
    private _method: string;
    private _path: string;
    private _queryParameters: {
        product_code: string,
        count: number,
        before?: number,
        after?: number,
        child_order_state: string,
        child_order_id?: string,
        child_order_acceptance_id?: string
    }
    private auth: Authorize;

    constructor(auth: Authorize) {
        this._method = 'GET';
        this._path = '/v1/me/getchildorders?'
        this._queryParameters = {
            product_code: "BTC_JPY",
            count: 1,
            child_order_state: "COMPLETED"
        }
        this.auth = auth;

    }
    // 注文一覧を取得する。
    getChildOrder(): Promise<unknown> {
        const qs = querystring.stringify(this._queryParameters);
        const options = this.auth.initGet(this._path + qs, this._method);
        return this.auth.request(options);
    }

    //method
    get method(): string {
        return this._method;
    }
    set method(method: string) {
        this._method = method;
    }
    //path
    get path(): string {
        return this._path;
    }
    set path(path: string) {
        this._path = path;
    }
    get queryParameters(): {
        product_code: string
        count: number
        before?: number
        after?: number
        child_order_state: string
        child_order_id?: string
        child_order_acceptance_id?: string
    } {
        return this._queryParameters
    }
    set queryParameters(queryParameters: {
        product_code: string
        count: number
        before?: number
        after?: number
        child_order_state: string
        child_order_id?: string
        child_order_acceptance_id?: string
    }) {
        this._queryParameters = queryParameters;
    }
}