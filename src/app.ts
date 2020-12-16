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


/// Ejercicio 1: Mappear los datos recibidos a la forma descrita por la interface CovidDataEntry ///

interface Mapper<T> {
    [key: string]: keyof T;
}

const mapper: Mapper<CovidDataEntry> = {
    'dateRep': 'date',
    'cases': 'cases',
    'deaths': 'deaths',
    'continentExp': 'continent',
    'countriesAndTerritories': 'country',
    'popData2019': 'population',
    'Cumulative_number_for_14_days_of_COVID-19_cases_per_100000': 'cumulativeCasesPer100KLast14Days'
};

const parseCovidData = (mapper: Mapper<CovidDataEntry>) => (item: any): CovidDataEntry =>
    Object.entries(item)
          .reduce((acc, [key, value]: [string, any]) => key in mapper ? { ...acc, [mapper[key]]: value } : acc, {}) as CovidDataEntry;


const dataset: Array<CovidDataEntry> = data.map(parseCovidData(mapper));


/// De los paises que tienen más de 1000 casos en alguna fecha, sacar su nombre y el porcentaje de población afectada ///

const select = (prop: keyof CovidDataEntry) => (data: CovidDataEntry) => data[prop];

const moreThan100Cases = (data: CovidDataEntry) => select('cases')(data) > 1000;


console.log(dataset.filter(moreThan100Cases));

type CovidGrouping = {
    [key in keyof CovidDataEntry]?: Array<CovidDataEntry>;
}

const groupByProperty = (prop: keyof CovidDataEntry) => (data: Array<CovidDataEntry>): CovidGrouping =>
    data.reduce((acc: CovidGrouping, cur: CovidDataEntry) => {
        const found: Array<CovidDataEntry> = acc[cur[prop]] || [];
        return { ...acc, [cur[prop]]: [...found, cur] };
    }, {}) as CovidGrouping;


const groupByCountry = groupByProperty('country')
(dataset.filter(moreThan100Cases));

console.log(groupByCountry);

type CovidGroupingReduceFunction = (acc: CovidGrouping, item: CovidDataEntry) => CovidGrouping;

const groupByReduceFunction = (reduceFunc: CovidGroupingReduceFunction) => (data: Array<CovidDataEntry>): CovidGrouping =>
    data.reduce(reduceFunc, {}) as CovidGrouping;

const reduceByProp = (prop: keyof CovidDataEntry): CovidGroupingReduceFunction => (acc: CovidGrouping, cur: CovidDataEntry) => {
    const found: Array<CovidDataEntry> = acc[cur[prop]] || [];
    return { ...acc, [cur[prop]]: [...found, cur] } as CovidGrouping;
};

const reduceByCountry: CovidGroupingReduceFunction = reduceByProp('country');
/*
console.log(groupByReduceFunction(reduceByCountry)
(dataset.filter(moreThan100Cases)));
*/
// Solución

const accumulatedByCountry = Object.entries(groupByCountry)
                                       .map(([country, covidData]: [string, Array<CovidDataEntry>]) => ({
                                           country,
                                           length: covidData.length,
                                           population: covidData[0].population,
                                           cases: covidData.reduce((acc, cur) => acc + cur.cases, 0),
                                           deaths: covidData.reduce((acc, cur) => acc + cur.deaths, 0),
                                       }));

console.log(accumulatedByCountry);

log('De los paises que tienen más de 1000 casos en alguna fecha, sacar su nombre y el porcentaje de población afectada',
    accumulatedByCountry
.map(_ => `${_['country']}: ${((_['cases'] / _['population']) * 100).toFixed(5)}%`));

