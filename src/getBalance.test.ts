import { GetBalance } from './getBalance';
const crypto = require('crypto');
const json = require('../requiredGetBalance.json');

// jest.mock()によってクラス全体をモック化できます
// jest.mock('./getBalance'); // パスを指定
// const GetBalanceMock = GetBalance as jest.Mock; // TypeScriptでは型変換する必要がある

describe('Robotのテスト', () => {
    test('クラス丸ごとモックになっているか', () => {
        // mockImplementationOnceで実装したいクラスを設定する
        // Robot.prototypeのhello関数をspyOnすることで、hello関数のモック化ができる
        // const balanceSpy = jest.spyOn(GetBalance.prototype, 'requestGetBalance').mockReturnValue(json);
        const balance = new GetBalance();

        //initAuthorize()の代わり
        const key = 'XXX';
        const secret = 'XXX';
        var timestamp = Date.now().toString();
        var method = 'GET';
        var path = '/v1/me/getbalance';
        var text = timestamp + method + path;
        var sign = crypto.createHmac('sha256', secret).update(text).digest('hex');

        var options = {
            url: 'https://api.bitflyer.com' + '/v1/me/getbalance',
            method: 'GET',
            headers: {
                'ACCESS-KEY': key,
                'ACCESS-TIMESTAMP': timestamp,
                'ACCESS-SIGN': sign
            }
        };
        // expect(balanceSpy).not.toHaveBeenCalled();
        expect(balance.requestGetBalance(options)).toBe(json);
        // expect(balanceSpy).toHaveBeenCalled();
    });
});