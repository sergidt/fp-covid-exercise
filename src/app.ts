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

/////////////////////// Ejercicio 1

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
          .reduce((acc, [key, value]: [string, any]) => key in mapper
              ? { ...acc, [mapper[key]]: value }
              : acc, {}) as CovidDataEntry;

const dataset: Array<CovidDataEntry> = data.map(parseCovidData(mapper));

//console.log(dataset);

//// Ejercicio 2

const select = (prop: keyof CovidDataEntry) => (data: CovidDataEntry) => data[prop];

const moreThan1000Cases = (data: CovidDataEntry) => select('cases')(data) > 1000;

type CovidGrouping = Partial<{
    [key: string]: Array<CovidDataEntry>;
}>;

const groupByProperty = (prop: keyof CovidDataEntry) => (data: Array<CovidDataEntry>): CovidGrouping =>
    data.reduce((acc: CovidGrouping, cur: CovidDataEntry) => {
        const found: Array<CovidDataEntry> = acc[cur[prop]] || [];
        return { ...acc, [cur[prop]]: [...found, cur] };
    }, {}) as CovidGrouping;

const groupByCountry = groupByProperty('country')
(dataset.filter(moreThan1000Cases));
/*
console.log(groupByCountry);
*/
const accumulatedByCountry = Object.entries(groupByCountry)
                                   .map(([country, covidData]: [string, Array<CovidDataEntry>]) => ({
                                       country,
                                       length: covidData.length,
                                       population: covidData[0].population,
                                       cases: covidData.reduce((acc, cur) => acc + cur.cases, 0),
                                       deaths: covidData.reduce((acc, cur) => acc + cur.deaths, 0),
                                   }));
/*
log('De los paises que tienen más de 1000 casos en alguna fecha, sacar su nombre y el porcentaje de población afectada',
    accumulatedByCountry
        .map(_ => `${ _['country'] }: ${ ((_['cases'] / _['population']) * 100).toFixed(5) }%`));
*/
//// Ejercicio 3

const groupByCountry2 = groupByProperty('country')
(dataset);

//console.log(groupByCountry2);

const accumulatedByCountry2 = Object.entries(groupByCountry2)
                                    .map(([country, covidData]: [string, Array<CovidDataEntry>]) => ({
                                        country,
                                        length: covidData.length,
                                        population: covidData[0].population,
                                        cases: covidData.reduce((acc, cur) => acc + cur.cases, 0),
                                        deaths: covidData.reduce((acc, cur) => acc + cur.deaths, 0),
                                    }));
/*
console.log(
    accumulatedByCountry2
        .filter(({ deaths }: { deaths: number }) => !deaths)
        .map(({ country }) => country)
);
*/
//

/**
 export interface CovidDataEntry {
    date: string;
    cases: number;
    deaths: number;
    continent: string;
    country: string;
    population: number;
    cumulativeCasesPer100KLast14Days: string;
}

 [
 ["Asia": [[japan, []], []],
 "Europe": []
 ]

 }


 */

const groupByContinent = groupByProperty('continent')
(dataset);
console.log(
    Object.entries(groupByContinent)
);

type Continent = string;
type CountryName = string;

type SummaryPerContinent = {
    [key in Continent]?: Array<[CountryName, Array<CovidDataEntry>]>;
}

Object.entries(groupByCountry2)
      .map(([country, covidData]: [string, Array<CovidDataEntry>]) => ({
          country,
          length: covidData.length,
          population: covidData[0].population,
          cases: covidData.reduce((acc, cur) => acc + cur.cases, 0),
          deaths: covidData.reduce((acc, cur) => acc + cur.deaths, 0),
      }));

const countriesByContinent = Object.entries(groupByContinent)
                                   .reduce((
                                       acc: any,
                                       [continent, entries]: [Continent, Array<CovidDataEntry>]) => {
                                       const entriesByCountry = groupByProperty('country')(entries);
                                       return [...acc, [continent, entriesByCountry]];
                                   }, []);

console.log(
    countriesByContinent
//        .map(([continent, countries]) =>[continent, Object.entries(countries).map(([country, entries]) => )])
);

function transform(object, cb) {
    return Object.entries(object)
                 .map(([key, data]) => cb(data));
}
