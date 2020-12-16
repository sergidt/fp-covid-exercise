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

//// Ejercicio 5

/*
            Debemos centrarnos en coger las entradas con una incidencia superior a 300.
            Para ello debemos crear el siguiente predicado que, a partir de la selección adecuada,
            filtrará los que tienen esa condición
 */

const incidenceOver300 = (data: CovidDataEntry) => +select('cumulativeCasesPer100KLast14Days')(data) > 300;

/*
            Agrupamos por continente todas las entradas.
            Tendrán la siguiente forma:
            {
                "America": [],
                "Europe": [],
                "Asia": []
            }
 */
const groupByContinentIncidenceOver300 = groupByProperty('continent')(dataset.filter(incidenceOver300));

/*
    Creamos dos alias hacia el type string
 */
type Continent = string;
type CountryName = string;

/*
    Tipo SummaryPerCountry, será una agrupación parecida a la anterior con los continentes
 */
type SummaryPerCountry = {
    [key in CountryName]?: Array<Partial<CovidDataEntry>>
};

/*
    Creamos el tipo final, SummaryPerContinent, que será un objeto con la siguiente forma (para ser más comprensible)
    {
        continent: "Asia",
        countries: {
            "Japan": [],
            "India": [],
            ...
        }
     }
 */
type SummaryPerContinent = {
    continent?: Continent,
    countries: SummaryPerCountry
};

/*
    El siguiente tipo nos ayuda a aplanar (simplificar) los typings
 */
type KeyAndEntries = [Continent | CountryName, Array<CovidDataEntry>];

/*
 * A partir de un par [CountryName, Array<CovidDataEntry>] devolverá un SummaryPerCountry, aprovechando la función pick,
 * que coge las props que queramos
 */
const appendSummaryPerCountry = (acc: SummaryPerCountry,
    [countryName, countryEntries]: KeyAndEntries): SummaryPerCountry => ({
    ...acc,
    [countryName]: countryEntries.map(pick<CovidDataEntry>(['date',
                                                            'cumulativeCasesPer100KLast14Days']))
});

/*
    Finalmente componemos el flujo final, que no es nada más que una agrupación de una agrupación, por eso parece tan complejo:
    De los que hemos filtrado anteriormente, reducimos:
        - Queremos la forma final de Array de SummaryPerContinent
        - ponemos el continent y como countries reducimos las entradas que recibimos mediante la función anterior
 */
const countriesByContinent = Object.entries(groupByContinentIncidenceOver300)
                                   .reduce((
                                       acc: Array<SummaryPerContinent>,
                                       [continent, entries]: KeyAndEntries) => {
                                       const entriesByCountry = groupByProperty('country')(entries);
                                       return [...acc, {
                                           continent, countries: Object.entries(entriesByCountry)
                                                                       .reduce(appendSummaryPerCountry, {})
                                       }];
                                   }, []);

console.log(
    countriesByContinent
);
