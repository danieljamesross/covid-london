import React, { useState } from 'react';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css'
import London from './components/london';
import londonCovidData from './data/londonCovidData';
import './App.css';

function App() {
    const arr = londonCovidData["2020-03-26"];
    const [value,setValue] = useState(0);
    const handleChange = (val) => {
	setValue(val);
    };
    let sliderVal = 0;
    return (
	<React.Fragment>
	    <div className="App">
		<London covidData={arr} />


		<div className="slider">
		    <Slider
			min={0}
			max={100}
			value={value}
			onChange={(e) => handleChange(e)}
		    />
		</div>
		<div className='value'><h1>{value}</h1></div>
	    </div>
	</React.Fragment>
    );
}

export default App;
