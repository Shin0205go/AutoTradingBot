export class ChildOrder {
    method = 'POST';
    path = '/v1/me/sendchildorder';
    body = {
        "product_code": "BTC_JPY",
        "child_order_type": "LIMIT",
        "side": "BUY",
        "price": 4500000,
        "size": 0.001,
        "minute_to_expire": 10000,
        "time_in_force": "GTC"
    };
}