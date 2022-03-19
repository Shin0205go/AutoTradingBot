import request from "request";
import crypto from "crypto";

export class Authorize {
    key: string;
    secret: string;

    constructor(key: string, secret: string) {
        this.key = key;
        this.secret = secret;
    }
    endpoint = 'https://api.bitflyer.com'
    //interface
    init(path: string, method: string): { url: string, method: string, headers: object }
    init(path: string, method: string, bodyInput?: object): { url: string, method: string, body?: string, headers: object }
    // implement
    init(path: string, method: string, bodyInput?: object) {
        var timestamp = Date.now().toString();
        var body = JSON.stringify(bodyInput);
        if (bodyInput) {
            var text = timestamp + method + path + body;
            var sign = crypto.createHmac('sha256', this.secret).update(text).digest('hex');
            return {
                url: this.endpoint + path,
                method: method,
                body: body,
                headers: {
                    'ACCESS-KEY': this.key,
                    'ACCESS-TIMESTAMP': timestamp,
                    'ACCESS-SIGN': sign,
                    'Content-Type': 'application/json'
                }
            };
        } else {
            var text = timestamp + method + path;
            var sign = crypto.createHmac('sha256', this.secret).update(text).digest('hex');
            return {
                url: this.endpoint + path,
                method: method,
                headers: {
                    'ACCESS-KEY': this.key,
                    'ACCESS-TIMESTAMP': timestamp,
                    'ACCESS-SIGN': sign,
                }
            };
        }
    }

    request(options: { url: string, method: string, headers: object }) {
        request(options, function (err: any, response: any, payload: any) {
            console.log(payload);
        })
    };
}