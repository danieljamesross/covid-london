import React, { useRef, useEffect, useState } from "react";
import { select, geoPath, geoTransverseMercator, min, max, scaleLinear } from "d3";
import useResizeObserver from "./useResizeObserver";
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
    const [caseType, setCaseType] = useState("total_cases");
    const [maxProp, setMaxProp] = useState();
    useEffect(() => {
	if (caseType === "new_cases") setMaxProp(50)
	else setMaxProp(1482);
    },[maxProp, caseType]);
    console.log(caseType)
    useEffect(() => {
	const svg = select(svgRef.current);
	const minProp = 0;//min(london.features, feature => feature.properties[property]);
	/* const maxProp = 50;//max(data.features, feature => feature.properties[property]); */
	const colorScale = scaleLinear()
	    .domain([minProp, maxProp])
	    .range(["#fff", "red"]);
	const getColor = (feature) => {
	    const boroughId = feature.properties["GSS_CODE"];
	    let propValue = null;
	    covidData.covidData.map(item => {
		if (item["area_code"] === boroughId){
		    propValue = item[caseType];
		}
	    })
	    return colorScale(propValue);
	}
	svg
	    .selectAll(".borough")
	    .transition()
	    .attr("fill", feature => getColor(feature))
	
    }, [covidData, caseType, maxProp]
    );

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
	svg
	    .selectAll(".borough")
	    .data(london.features)
	    .join("path")
	    .on("click", feature => {
		setSelectedBorough(selectedBorough === feature ? null : feature);
	    })
	    .attr("class", "borough")
	/* .attr("fill", "palevioletred") */
	    .attr("stroke", "black")
	    .attr("stroke-width", "2")
	/* .transition()
	   .attr("fill", feature => getColor(feature)) */
	    .attr("d", feature => pathGenerator(feature));

	// render text
	svg
	    .selectAll(".label")
	    .data([selectedBorough])
	    .join("text")
	    .attr("class", "label")
	    .text(
		feature =>
		    feature &&
			 feature.properties.NAME
	    )
	    .attr("x", 10)
	    .attr("y", 25);
    }, [dimensions, selectedBorough]);

    return (
	<div ref={wrapperRef} style={{ marginBottom: "2rem" }}>
	    <svg ref={svgRef}></svg>
	</div>
    );
}   


export default London;
