import { Secret } from "../interface/secret";
import { Authorize, Options } from "../api/authorize";
import { ChildOrder } from "../api/childOrder";
import { GetChildOrders } from "../api/getChildOrders";
import { Trader } from "../interface/trader";
import { SampleTrader } from "./sampleTrader";
import fs from "fs";
import { OneHalfTrader } from "./oneHalfTrader";
import path from "path";
import { fileURLToPath } from "url";

export class TraderFactory {
    static path = require('path');
    static filePath: string = path.join(__dirname, '..', 'secret', 'secret.json');
    private static readonly secretData: Secret = JSON.parse(fs.readFileSync(TraderFactory.filePath, 'utf8'));
    public static readonly key: string = TraderFactory.secretData.key;
    public static readonly secret: string = TraderFactory.secretData.secret;
  
    public static create(): Trader{
        const auth = new Authorize(this.key, this.secret);
        const childOrder = new ChildOrder();
        const getChildOrders = new GetChildOrders(auth);
        
        if ( true ) { //TODO: 条件を考える
        return new OneHalfTrader(auth, childOrder, getChildOrders);
        } else {
            return new SampleTrader(auth, childOrder, getChildOrders)
        }
    }



}