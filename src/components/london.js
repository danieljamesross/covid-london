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
    const [domain, setDomain] = useState([0, 1, 60]);
    const [margin, setMargin] = useState("results");
    const [highestStats, setHighestStats] = useState("highestStats");
    const [transform, setTransform ] = useState("translate(1100,0)");
    const [highestNew, setHighestNew] = useState(0);
    const [highestTotal, setHighestTotal] = useState(0);
    const [highestNewBorough, setHighestNewBorough] = useState(null);
    const [highestTotalBorough, setHighestTotalBorough] = useState(null);
    
    useEffect(() => {
	if (dataType === "new_cases")
	    setDomain([0, 1, 60]);//55
	else setDomain([0, 1, 1600]);//1514
    },[dataType]);

    useEffect(() => {
	setHighestNew(0);
	setHighestTotal(0);
	setHighestNewBorough(null);
	setHighestTotalBorough(null);
	covidData.covidData.map(item => {
	    setHighestNew(c => {
		setHighestNewBorough(d => {
		    if (c > item["new_cases"])
			return d;
		    return item["area_name"];
		});
		return Math.max(c, item["new_cases"]);
	    });
	    setHighestTotal(c => {
		setHighestTotalBorough(d => {
		    if (c > item["total_cases"])
			return d;
		    return item["area_name"];
		});
		return Math.max(c, item["total_cases"]);
	    });
	    return null;
	});
    },[covidData]);

    const showHighestNew = () => {
	if (highestNew > 0)
	    return (<li>Highest no. new cases is <span className="bold">{highestNew}</span> in <span className="bold">{highestNewBorough}</span></li>);
	return null;
    };

    const showHighestTotal = () => {
	if (highestTotal <= 0) return null;
	return (<li>Highest no. total cases is <span className="bold">{highestTotal}</span> in  <span className="bold">{highestTotalBorough}</span></li>);
    };
    
    useEffect(() => {
	const boroughId = selectedBorough ? selectedBorough.properties["GSS_CODE"] :  null;
	// use resized dimensions
	// but fall back to getBoundingClientRect, if no dimensions yet.
	const { width } =
	    dimensions || wrapperRef.current.getBoundingClientRect();
	if (boroughId) {
	    covidData.covidData.map(item => {
		if (item["area_code"] === boroughId){
		    setNewCases(item["new_cases"]);
		    setTotalCases(item["total_cases"]);
		    setBoroughName(item["area_name"]);
		    setMargin("results-borough");
		    setHighestStats("highestStats-hidden");
		};
		return null;
	    });
	} else {
	    setBoroughName("Greater London");
	    setNewCases(0);
	    setTotalCases(0);
	    setMargin("results");
	    setHighestStats("highestStats");
	    setTransform("translate(" + width/1.3 + ", 0)");
	    covidData.covidData.map(item => {
		setNewCases(c => c + item["new_cases"]);
		setTotalCases(c => c + item["total_cases"]);		    
		return null;
	    });
	}
    }, [selectedBorough, covidData, boroughName, wrapperRef, dimensions]);
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
		return "No. New Cases";
	    return "No. Total Cases";
	};

	const cellNum = () => {
	    if (dataType === "new_cases")
		return 7;
	    return 17;
	};
	const getY = () => {
	    if (dataType === "new_cases")
		return 130;
	    return 280;
	};
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
	   .attr("width", 160)
	   .attr("height", getY() + 20);
	
	
	// define the legend
	const legend = legendColor()
	    .shapeWidth(20)
	    .cells(cellNum())
	    .labelFormat(format("0"))
	    .orient('vertical')
	    .ascending(true)
	    .shapePadding(-4)
	    .scale(colorScale);

	// apply the legend
	svg.select(".legend")
	   .call(legend);

	//remove any legend title
	svg.select(".legend-title").remove();
	//add new legend title
	svg.select(".legend")
	   .append("text")
	   .attr("class", "legend-title")
	   .attr("x", 0)
	   .attr("y", getY())
	   .attr("font-size", 18)
	   .text(getLegendTitle());
    }, [covidData, dataType, domain, transform]
    );
    return (
	<>
	    <div ref={wrapperRef}
		 style={{ marginBottom: "2rem", marginTop: "2rem" }}
	    >
		<svg ref={svgRef}></svg>
	    </div>
	    <div className={margin}>
		<h3>{boroughName}</h3>
		<ul>
		    <li>Date: <span className="bold">{displayDate}</span></li>
		    <li>New Cases:  <span className="bold">{newCases}</span></li>
		    <li>Total Cases:  <span className="bold">{totalCases}</span></li>
		    <span className={highestStats}>
			{showHighestNew()}
			{showHighestTotal()}
		    </span>
		</ul>
	    </div>
	</>
    );
};

export default London;
