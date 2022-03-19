export class ChildOrder {
    private _method = 'POST';
    private _path = '/v1/me/sendchildorder';
    private _body = {
        "product_code": "BTC_JPY",
        "child_order_type": "LIMIT",
        "side": "BUY",
        "size": 0.001,
        "minute_to_expire": 10000,
        "time_in_force": "GTC"
    };

    get method(): string {
        return this._method;
    }
    set method(method: string) {
        this._method = method;
    }

    get path(): string {
        return this._path;
    }
    set path(path: string) {
        this._path = path;
    }

    get body(): {
        product_code: string;
        child_order_type: string;
        side: string;
        size: number;
        minute_to_expire: number;
        time_in_force: string;
    } {
        return this._body;
    }

    set body(body: {
        product_code: string;
        child_order_type: string;
        side: string;
        size: number;
        minute_to_expire: number;
        time_in_force: string;
    }) {
        this._body = body;
    }
}