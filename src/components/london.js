import React, { useRef, useEffect, useState, useContext } from "react";
import { select, geoPath, geoTransverseMercator, scaleThreshold } from "d3";
import useResizeObserver from "./useResizeObserver";
import CovidContext from '../context/CovidContext';
// london data obtained at:
// https://data.london.gov.uk/dataset/statistical-gis-boundary-files-london
// and converted into GeoJSON using ogr2ogr
// Useful how-to here:
// https://lvngd.com/blog/using-ogr2ogr-convert-shapefiles-geojson/
import london from '../geo/london.json';

function London(covidData) {
    const svgRef = useRef();
    const wrapperRef = useRef();
    const dimensions = useResizeObserver(wrapperRef);
    const [selectedBorough, setSelectedBorough] = useState(null);
    const { state } = useContext(CovidContext);
    const { dataType, displayDate } = state;
    const [newCases, setNewCases] = useState(0);
    const [totalCases, setTotalCases] = useState(0);
    const [boroughName, setBoroughName] = useState("Greater London");
    const [domain, setDomain] = useState([1, 10, 20, 30, 40, 50]);
    
    useEffect(() => {
	if (dataType === "new_cases")
	    setDomain([1, 10, 20, 30, 40, 50]);//48
	else setDomain([1, 50, 100, 500, 1000, 1300]);//1482
    },[dataType]);
    useEffect(() => {
	const svg = select(svgRef.current);
	const colorScale = scaleThreshold()
	    .domain(domain)
	    .range(["#B8ADA9", "#FFBD6F", "#FFA500", "#FF8C00", "#f46f11", "#C23700", "#990000" ]);
	const getColor = (feature) => {
	    const boroughId = feature.properties["GSS_CODE"];
	    let propValue = null;
	    covidData.covidData.map(item => {
		if (item["area_code"] === boroughId){
		    propValue = item[dataType];
		}
		return null;
	    });
	    return colorScale(propValue);
	};
	svg
	    .selectAll(".borough")
	    .transition()
	    .attr("fill", feature => getColor(feature));
    }, [covidData, dataType, domain]
    );
    useEffect(() => {
	const boroughId = selectedBorough ? selectedBorough.properties["GSS_CODE"] :  null;
	if (boroughId) {
	    covidData.covidData.map(item => {
		if (item["area_code"] === boroughId){
		    setNewCases(item["new_cases"]);
		    setTotalCases(item["total_cases"]);
		    setBoroughName(item["area_name"]);
		};
		return null;
	    });
	} else {
	    setBoroughName("Greater London");
	    setNewCases(0);
	    setTotalCases(0);
	    covidData.covidData.map(item => {
		setNewCases(c => c + item["new_cases"]);
		setTotalCases(c => c + item["total_cases"]);		    
		return null;
	    });
	    
	    
	}
    }, [selectedBorough, covidData, boroughName]);
    // will be called initially and on every data change
    useEffect(() => {
	const svg = select(svgRef.current);
	// use resized dimensions
	// but fall back to getBoundingClientRect, if no dimensions yet.
	const { width, height } =
	    dimensions || wrapperRef.current.getBoundingClientRect();
	// projects geo-coordinates on a 2D plane
	const projection =  geoTransverseMercator()
	    .fitSize([width, height], selectedBorough || london)
	    .precision(100);
	// takes geojson data,
	// transforms that into the d attribute of a path element
	const pathGenerator = geoPath().projection(projection);
	// render each country
	const setOpacity = (feature) => {
	    if (feature === selectedBorough || !selectedBorough) {
		return "1";
	    } return "0.1";
	};
	const setStrokeWidth = (feature) => {
	    if (feature === selectedBorough) {
		return "2";
	    } return "1";
	};
	svg
	    .selectAll(".borough")
	    .data(london.features)
	    .join("path")
	    .on("click", feature => {
		setSelectedBorough(selectedBorough === feature ? null : feature);
	    })
	    .attr("class", "borough")
	    .attr("stroke", "black")
	    .attr("stroke-width", feature => setStrokeWidth(feature))
	    .attr("opacity", feature => setOpacity(feature))
	    .attr("d", feature => pathGenerator(feature));
	
    }, [dimensions, selectedBorough]);
    
    return (
	<>
	    <div ref={wrapperRef} style={{ marginBottom: "2rem", marginTop: "2rem" }}
	    >
		<svg ref={svgRef}></svg>
	    </div>
	    <div className="results">
		<h3>{boroughName}</h3>
		<ul>
		    <li>New Cases: {newCases}</li>
		    <li>Total Cases: {totalCases}</li>
		    <li>Date: {displayDate}</li>
		</ul>
	    </div>
	</>
    );
}   


export default London;
