import request from "request";
import crypto from "crypto";

export class GetBalance {

    initAuthorize() {
        const key = 'XXX'
        const secret = 'XXX';
        var timestamp = Date.now().toString();
        var method = 'GET';
        var path = '/v1/me/getbalance';
        var text = timestamp + method + path;
        var sign = crypto.createHmac('sha256', secret).update(text).digest('hex');

        var options = {
            url: 'https://api.bitflyer.com' + path,
            method: method,
            headers: {
                'ACCESS-KEY': key,
                'ACCESS-TIMESTAMP': timestamp,
                'ACCESS-SIGN': sign
            }
        };
        return options;
    }

    requestGetBalance(options: any) {
        request(options, function (err: any, response: any, payload: any) {
            console.log(payload);
        })
    };
}