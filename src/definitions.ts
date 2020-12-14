export interface CovidDataEntry {
    date: string;
    cases: number;
    deaths: number;
    continent: string;
    country: string;
    population: number;
    cumulativeCasesPer100KLast14Days: string;
}

interface Mapper<T> {
    [key: string]: keyof T;
}

export const mapper: Mapper<CovidDataEntry> = {
    'dateRep': 'date',
    'cases': 'cases',
    'deaths': 'deaths',
    'continentExp': 'continent',
    'countriesAndTerritories': 'country',
    'popData2019': 'population',
    'Cumulative_number_for_14_days_of_COVID-19_cases_per_100000': 'cumulativeCasesPer100KLast14Days'
};

/// UTILS

export const parseCovidData = (mapper: Mapper<CovidDataEntry>) => (item: any) =>
    Object.entries(item)
          .reduce((acc, [key, value]: [string, any]) => key in mapper ? { ...acc, [mapper[key]]: value } : acc, {});

const intFrom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
