import { Options } from "../api/authorize";
import { Authorize } from "../api/authorize";
import { ChildOrder } from "../api/childOrder";
import { GetBalance } from "../api/getBalance";
import { GetChildOrders } from "../api/getChildOrders";

export interface Trader {
    auth: Authorize;
    childOrder: ChildOrder;
    getChildOrders: GetChildOrders;
    getBalance: GetBalance;
    
    initCondition(): Options & { body?: string }

    calcProfit(childOrderId: string): any;

    trade(): any;

}