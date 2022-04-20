import { ChildOrder } from "./childOrder";
import { Authorize } from "./authorize";
import { OneHalfTrader } from "./oneHalfTrader";

// describe('通信を送る場合のテスト', () => {
//     let httpRequestGetMock: jest.SpyInstance;

//     const authMock = {
//         init: (path: string, method: string, bodyInput?: object) => {
//             return {
//                 url: 'https://localhost/v1/me/sendchildorder',
//                 method: 'POST',
//                 body: JSON.stringify(bodyInput),
//                 headers: {
//                     'ACCESS-KEY': "this.key",
//                     'ACCESS-TIMESTAMP': jest.spyOn(Date, "now"),
//                     'ACCESS-SIGN': "sign",
//                     'Content-Type': 'application/json'
//                 }
//             }
//         }
//     }
//     const childOrderMock = {
//         private _method = 'POST',
//         private _path = '/v1/me/sendchildorder',
//         private _body = {
//             "product_code": "BTC_JPY",
//             "child_order_type": "LIMIT",
//             "side": "BUY",
//             "size": 0.001,
//             "minute_to_expire": 10000,
//             "time_in_force": "GTC"
//         }
//     };

//     beforeEach(() => {
//         httpRequestGetMock = jest.spyOn(OneHalfTrader, 'trade');
//         httpRequestGetMock.mockResolvedValue({ "child_order_acceptance_id": "JRF20220320-131629-154272" });
//     });

//     it('mockで意図したURLに通信を送り、返ってくるはずのものを確認するテスト', async () => {
//         const res = new OneHalfTrader();
//         expect(res.message).toBe('');
//         expect(httpRequestGetMock).toHaveBeenCalledWith('http://localhost:5678');
//     });
// });

// describe('oneHalfTraderのユニットテスト', () => {
test('trade()', async () => {
    const { ChildOrder: MockedChildOrder } = jest.requireActual(
        "./childOrder"
    );
    const { Authorize: MockedAuthorize } = jest.requireActual(
        "./authorize"
    );

    const mockedChilOrder: ChildOrder = new ChildOrder();
    const mockedAuthorize: Authorize = new Authorize("testKey", "testSecret");
    //mockedAuthorizeのモックrequestメソッドを作成
    mockedAuthorize.request = jest.fn().mockImplementation(() => {
        return { "child_order_acceptance_id": "JRF20220320-131629-154272" }
    }
    );
    const oneHalfTrader = new OneHalfTrader(mockedAuthorize, mockedChilOrder);

    //ここからtrade()の実装
    var n = 1;
    mockedChilOrder.body.size = 0.001;
    // console.log('スタート');
    // for (var i = 0; i < 100; i++) {
    //TODO: forループをやめる。
    oneHalfTrader.half = oneHalfTrader.oneHalf();
    var childOrderOption = oneHalfTrader.initCondition();
    // 1分待つ;            
    await new Promise(resolve => setTimeout(resolve, 600))
    // 注文
    var resp = oneHalfTrader.auth.request(childOrderOption); //TODO: レスポンス取得するようにする → デバッグしたい → テスト書きたい

    // console.log(n + "回目の注文は、" + oneHalfTrader.childOrder.body.side + "注文" + "結果:" + resp)
    // n++;
    expect(resp).toStrictEqual({ "child_order_acceptance_id": "JRF20220320-131629-154272" });

    //{"child_order_acceptance_id":"JRF20220320-131629-154272"}
    // 注文の一覧を取得
    // var result = getChildOrder.getChild(child_order_acceptance_id);
    //　損益計算
    // this.calcProfit();
    // }
    // return trade().then() => {
    //     expect(new OneHalfTrader(authMock, childOrderMock).trade().toBe(0));
    // }
});
// })
