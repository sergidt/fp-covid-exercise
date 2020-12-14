import { data } from './dataset';
import { mapper, parseCovidData } from './definitions';

console.clear();

const dataset = data.map(parseCovidData(mapper))
console.log(dataset);
function log(message: string, params: any) {
    console.log(`%c${ message }`, 'padding: 10px; background-color: black; color: white; font-size: 14px', params);
}


const pick = <T>(properties: Array<keyof T>) => (item: T) => properties.reduce((acc, cur) => ({
    ...acc,
    [cur]: item[cur]
}), {});



