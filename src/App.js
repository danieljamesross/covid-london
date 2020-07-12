import React, { useState, useEffect } from 'react';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css'
import London from './components/london';
import londonCovidData from './data/londonCovidData';
import './App.css';

function App() {
    //let dataDate = "2020-03-30";
    //let arr = londonCovidData[dataDate];
    const minDate = new Date("2020-01-30");
    const maxDate = Date.parse("2020-06-06");

    const [value,setValue] = useState(0);
    const handleChange = (val) => {
	setValue(val);

    };

    
    const [dataDate,setDataDate] = useState("2020-03-30");   
    useEffect(() => {
	const addDays = (date, days) => {
	    const copy = new Date(Number(date));
	    copy.setDate(date.getDate() + days);
	    return copy;
	}
	const dd = addDays(minDate, value)

	return setDataDate(dd.getFullYear() + '-' + ('0' + (dd.getMonth()+1)).slice(-2) + '-' + ('0' + dd.getDate()).slice(-2));

    },[dataDate, value]);
    
    const [arr, setArr] = useState(londonCovidData[dataDate]);
    useEffect(() => {
	setArr(londonCovidData[dataDate]);
    },[arr, dataDate, londonCovidData])


    /* const [ct, setCt] = useState("new_cases"); */
    /* useEffect(() => {
       setCt(ct => if (ct === "new_cases") {return "total_cases"} return "new_cases")
     * }, [ct]) */
    
    return (
	<React.Fragment>
	    <div className="App">
		<London covidData={arr} />
		<button
		    onClick={() => {}}
		>Date Type
		</button>

		<Slider
		    min={1}
		    max={128}
		    value={value}
		    onChange={(e) => handleChange(e)}
		/>
		<div className='value'><h1>{dataDate}</h1></div>
	    </div>
	</React.Fragment>
    );
}

export default App;
