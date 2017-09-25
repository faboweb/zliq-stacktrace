import {diff, createNode, render} from '../../src'

export function test({vdom$}, schedule, done) {
    let container = document.createElement('div');
    return test$(render({vdom$}, container, 0), schedule, done);
}

export function test$(stream, schedule, done = () => null) {
    return stream.reduce((iteration, value) => {
        // tests produce async behaviour often syncronous
        // this can cause race effects on stream declarations
        // here the iterations are made asynchronous to prevent this
        setTimeout(() => {
            if (schedule[iteration] === undefined) {
                throw new Error('Unexpected Update!');
            }
            schedule[iteration](value);
            if (schedule.length === iteration + 1 && done) {
                done();
            }
        })

        return iteration + 1;
    }, 0);
}