import { Authorize, Options } from "../authorize";

export class MockAuthorize extends Authorize {
    constructor(key: string = "mock-key", secret: string = "mock-secret") {
        super(key, secret);
    }

    override request(options: Options): Promise<any> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const url = options.url as string;
                
                if (url.includes('/v1/me/sendchildorder')) {
                    resolve({
                        child_order_acceptance_id: `MOCK-${Date.now()}`
                    });
                } else if (url.includes('/v1/me/getchildorders')) {
                    resolve(this.mockGetChildOrders(url));
                } else if (url.includes('/v1/me/getbalance')) {
                    resolve([
                        {
                            currency_code: "JPY",
                            amount: 1000000,
                            available: 900000
                        },
                        {
                            currency_code: "BTC",
                            amount: 0.5,
                            available: 0.5
                        }
                    ]);
                } else {
                    resolve({ status: "success", message: "Mock response" });
                }
            }, 100); // 100ms delay to simulate network
        });
    }

    private mockGetChildOrders(url: string): any[] {
        const queryParams = new URLSearchParams(url.split('?')[1]);
        const count = parseInt(queryParams.get('count') || '1');
        const childOrderAcceptanceId = queryParams.get('child_order_acceptance_id');
        
        const orders: any[] = [];
        
        if (childOrderAcceptanceId) {
            orders.push(this.createMockOrder(childOrderAcceptanceId));
            return orders;
        }
        
        for (let i = 0; i < count; i++) {
            orders.push(this.createMockOrder(`MOCK-${Date.now()}-${i}`));
        }
        
        return orders;
    }

    private createMockOrder(id: string): any {
        const side = Math.random() > 0.5 ? "BUY" : "SELL";
        const size = 0.001 + Math.random() * 0.01; // Random size between 0.001 and 0.011
        const price = 5000000 + (Math.random() - 0.5) * 200000; // Random price around 5,000,000 JPY
        
        return {
            id: Math.floor(Math.random() * 1000000),
            child_order_id: id,
            child_order_acceptance_id: id,
            product_code: "BTC_JPY",
            side: side,
            child_order_type: "MARKET",
            price: price,
            average_price: price,
            size: size,
            child_order_state: "COMPLETED",
            expire_date: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
            child_order_date: new Date().toISOString(),
            child_order_executed_date: new Date().toISOString(),
            total_commission: 0
        };
    }
}
