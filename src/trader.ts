import { Authorize, Options } from "./authorize";
import { ChildOrder } from "./childOrder";
import { GetChildOrders } from "./getChildOrders";

export interface Trader {
    auth: Authorize;
    childOrder: ChildOrder;
    getChildOrders: GetChildOrders;

    initCondition(): Options & { body?: string }

    calcProfit(childOrderId: string): any;

    trade(): any;

}