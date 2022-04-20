import request, { get, post } from "request-promise";
import crypto from "crypto";

export interface Options {
    url: string,
    method: string,
    headers: object
}

export class Authorize {
    key: string;
    secret: string;

    constructor(key: string, secret: string) {
        this.key = key;
        this.secret = secret;
    }
    endpoint = 'https://api.bitflyer.com'

    //interface
    initPost(path: string, method: string): Options
    initPost(path: string, method: string, bodyInput?: object): Options & { body?: string }
    //implements
    initPost(path: string, method: string, bodyInput?: object): Options | (Options & { body?: string | undefined; }) {
        var timestamp = Date.now().toString();
        if (bodyInput) { //body部あり
            var body = JSON.stringify(bodyInput);
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
        } else { //body部なし
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

    //interface
    initGet(path: string, method: string, bodyInput?: object): Options & { body?: string } & { json: boolean }
    initGet(path: string, method: string): Options

    // implement
    initGet(path: string, method: string, bodyInput?: object): (Options & { json: boolean }) | (Options & { body?: string | undefined; } & { json: boolean }) {
        var timestamp = Date.now().toString();
        if (bodyInput) { //body部あり
            var body = JSON.stringify(bodyInput);
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
                },
                json: true
            }
        }
        else { //body部なし
            var text = timestamp + method + path;
            var sign = crypto.createHmac('sha256', this.secret).update(text).digest('hex');
            return {
                url: this.endpoint + path,
                method: method,
                headers: {
                    'ACCESS-KEY': this.key,
                    'ACCESS-TIMESTAMP': timestamp,
                    'ACCESS-SIGN': sign,
                },
                json: true
            };
        }
    }


    request(options: Options) {
        return new Promise((resolve, reject) => {
            request(options)
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                });
        })
    };
}