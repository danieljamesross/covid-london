const fs = require('fs');
const file = require('/Users/danieljross/ReactApps/covid-london/src/data/phe_cases_london_boroughs.json');

// https://stackoverflow.com/questions/38575721/grouping-json-by-values
const groupBy = (xs, key) => {
    return xs.reduce((rv, x) => {
	(rv[x[key]] = rv[x[key]] || []).push(x);
	return rv;
    }, {});
};

const londonCovidData = JSON.stringify(groupBy(file, 'date'));

fs.writeFile('/Users/danieljross/ReactApps/covid-london/src/data/londonCovidData.json', londonCovidData, (err)=>console.log(err));
