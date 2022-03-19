import { Main } from './index';

test('basic', () => {
    expect(new Main().childorder.toBe(0));
});