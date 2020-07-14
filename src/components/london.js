import React, { useRef, useEffect, useState, useContext } from "react";
import { select, geoPath, geoTransverseMercator, scaleLinear, format } from "d3";
// https://d3-legend.susielu.com/ 
import { legendColor } from "d3-svg-legend";
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
    const [margin, setMargin] = useState("results");
    const [transform, setTransform ] = useState("translate(1100,0)");
    
    useEffect(() => {
	if (dataType === "new_cases")
	    setDomain([0, 1, 50]);//48
	else setDomain([0, 1, 1500]);//1482
    },[dataType]);
    
    
    useEffect(() => {
	const boroughId = selectedBorough ? selectedBorough.properties["GSS_CODE"] :  null;
	if (boroughId) {
	    covidData.covidData.map(item => {
		if (item["area_code"] === boroughId){
		    setNewCases(item["new_cases"]);
		    setTotalCases(item["total_cases"]);
		    setBoroughName(item["area_name"]);
		    setMargin("results-borough");
		};
		setTransform("translate(400,200)");
		return null;
	    });
	} else {
	    setBoroughName("Greater London");
	    setNewCases(0);
	    setTotalCases(0);
	    setMargin("results");

	    setTransform("translate(1100,0)");
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
	svg.selectAll(".borough")
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
	
	svg.select(".legend")
	   .attr("transform", transform);
	
    }, [dimensions, selectedBorough, transform]);

    useEffect(() => {
	const svg = select(svgRef.current);
	const colorScale = scaleLinear()
	    .domain(domain)
	    .range(["#B8ADA9", "#FFBD6F", "#990000" ]);
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
	const getLegendTitle = () => {
	    if (dataType === "new_cases")
		return "No. New Cases"
	    return "No. Total Cases";
	}
	// add color to the features
	svg.selectAll(".borough")
	   .transition()
	   .attr("fill", feature => getColor(feature));
	// add a legend
	svg.select(".legend").remove();

	svg.append("g")
	   .attr("class", "legend")
	   .attr("fill", "#B8ADA9")
	   .attr("transform", transform);

	svg.select(".legend")
	   .append("rect")
	   .attr("opacity", 0.7)
	   .attr("fill", "#023754")
	   .attr("x",-10)
           .attr("y", -10)
	   .attr("width", 200)
	   .attr("height", 230);
	
	
	// define the legend
	const legend = legendColor()
	    .shapeWidth(20)
	    .cells(11)
	    .labelFormat(format("0"))
	    .orient('vertical')
	    .ascending(true)
	    .shapePadding(-4)
	    .scale(colorScale);

	// apply the legend
	svg.select(".legend")
	   .call(legend);

	//remove any egend title
	svg.select(".legend-title").remove();
	//add new legend title
	svg.select(".legend")
	   .append("text")
	   .attr("class", "legend-title")
	   .attr("x", 0)
	   .attr("y", 200)
	   .attr("font-size", 24)
	   .text(getLegendTitle());
    }, [covidData, dataType, domain, transform]
    );
    return (
	<>
	    <div ref={wrapperRef} style={{ marginBottom: "2rem", marginTop: "2rem" }}
	    >
		<svg ref={svgRef}></svg>
	    </div>
	    <div className={margin}>
		<h3>{boroughName}</h3>
		<ul>
		    <li>Date: {displayDate}</li>
		    <li>New Cases: {newCases}</li>
		    <li>Total Cases: {totalCases}</li>

		</ul>
	    </div>
	</>
    );
}   


export default London;
