import React, { useState, useEffect, useReducer } from 'react';
import Slider from 'react-rangeslider';
import London from './components/london';
import londonCovidData from './data/londonCovidData';
import SliderOptions from './components/SliderOptions'

import {
    SET_DATA_TYPE, SET_DISPLAY_DATE, TOGGLE_AUTO
} from './reducers/Types.js';
import CovidReducer from './reducers/CovidReducer';
import CovidContext from './context/CovidContext';
import './css/App.css';
import './css/rangeSlider.css';

function App() {
    const initialState = {
	dataType: "total_cases",
	displayDate: "31 January",
	autoPlay: false
    };
    const [ state, dispatch ] = useReducer(CovidReducer, initialState);
    const { dataType, autoPlay } = state;
    
    const minDate = new Date("2020-01-30");
    /* const maxDate = Date.parse("2020-06-06"); */

    const [value,setValue] = useState(0);
    const handleChange = (val) => {
	setValue(val);
    };
    const [dataDate,setDataDate] = useState("2020-03-30");

    useEffect(() => {
	dispatch({type: SET_DISPLAY_DATE,
		  displayDate: new Date(dataDate).toLocaleDateString(
		      "en-GB", {day: "numeric", month: "long"}
		  )})
	},[dataDate])

    useEffect(() => {
	const addDays = (date, days) => {
	    const copy = new Date(Number(date));
	    copy.setDate(date.getDate() + days);
	    return copy;
	};
	const dd = addDays(minDate, value);
	return setDataDate(dd.getFullYear() + '-'
			 + ('0' + (dd.getMonth()+1)).slice(-2) + '-'
			 + ('0' + dd.getDate()).slice(-2));
    },[minDate, dataDate, value]);
    
    const [arr, setArr] = useState(londonCovidData[dataDate]);
    useEffect(() => {
	setArr(londonCovidData[dataDate]);
    },[arr, dataDate]);

    const setDataType = () => {
	if (dataType === "new_cases") {
	    return dispatch({type: SET_DATA_TYPE, dataType: "total_cases"});
	} return dispatch({type: SET_DATA_TYPE, dataType: "new_cases"});
    };
    
    const dataDisplay = () => {
	if (dataType === "new_cases") {
	    return "Number of new cases per day";
	}   return "Total cases since 30 January";
    };

    const toggleAuto = () => {
	return dispatch({type: TOGGLE_AUTO});
    }

    useEffect(() => {
	if (autoPlay) {
	    setValue(1);
	    const id = setInterval(() => {
		setValue(c => c + 1);
	    }, 80);
	    
	    
	    return () => clearInterval(id);
	}
    }, [autoPlay]);

    useEffect(() => {
	if (value >= 128){
	    return dispatch({type: TOGGLE_AUTO});
	}
    }, [value])
    
    return (
	<React.Fragment>
	    <div className="App">
		<h1>Covid in London</h1>
		<h3>An interactive map of Covid-19 cases in London </h3>
		<CovidContext.Provider value={{state, dispatch}}>
		    <div className="side-matter">
			<p>This map has two display modes:</p>
			<ol>
			    <li>Total number of cases of Covid-19 per borough, over the time frame.</li>
			    <li>Number of new cases of Covid-19 per borough, per day</li>
			</ol>
			<p>Click the button below to change the view.</p>
			<button
			    onClick={setDataType}
			>{dataDisplay()}
			</button>
			<button
			    onClick={toggleAuto}
			>Auto Play
			</button>
		    </div>
		    <div className="map">
			<London covidData={arr} />
		    </div>
		    <div className="date-slider">
			<Slider
			min={1}
			max={128}
			value={value}
			tooltip={false}
			onChange={(e) => handleChange(e)}
			labels={SliderOptions.labels}
			/>
		    </div>
		</CovidContext.Provider>
	    </div>
	</React.Fragment>
    );
}

export default App;
