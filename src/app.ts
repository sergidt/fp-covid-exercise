import { data } from './dataset';

console.clear();

export interface CovidDataEntry {
    date: string;
    cases: number;
    deaths: number;
    continent: string;
    country: string;
    population: number;
    cumulativeCasesPer100KLast14Days: string;
}



// utils

export function log(message: string, params: any) {
    console.log(`%c${ message }`, 'padding: 10px; background-color: black; color: white; font-size: 14px', params);
}

const pick = <T>(properties: Array<keyof T>) => (item: T) => properties.reduce((acc, cur) => ({
    ...acc,
    [cur]: item[cur]
}), {});


///////////////////////







