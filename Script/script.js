var vertices = [],
    links = [],
    stability = false,
    itr = 0,
    oldVertices = [];


var margin = {
        top: 50,
        left: 50,
        bottom: 40,
        right: 30
    },
    h = 600 - margin.top - margin.bottom,
    w = 1200 - margin.left - margin.right;

var dataset = {
    nodes: [],
    links: []
};
var chooseClicked = 0,
    goClicked = 0;


var i = 0;


function init() {

    if (chooseClicked == 0) {
        graphSize = d3.select("#graphSize").property("value");

        // filling this array for further use
        for (let i = 0; i < graphSize; i++) {
            oldVertices.push("v" + 0);
        }

        // filling nodes
        for (let i = 0; i < graphSize; i++) {
            dataset.nodes.push({
                "id": i,
                "name": "v" + i
            });
        }

        // For each node we create a label 
        for (let c = 0; c < graphSize - 1; c++) {
            d3.select("#graphLinks")
                .append("label")
                .attr("class", function (d) {
                    return 'v' + c;
                })
                .attr("for", function (d) {
                    return 'vLink' + c;
                })
                .text(function (d) {
                    return 'v' + c;
                })
                .style("text-anchor", "middle")
                .style("font", "2c3d63")
                .style("font-weight", "bold")
                .append("br");

            //then for that node we create checkboxes to each one of the remaining nodes to select its neighbours
            for (var cpt = c + 1; cpt < graphSize; cpt++) {
                d3.select("#graphLinks")
                    .append("label")
                    .attr("for", function (d) {
                        return 'v' + cpt;
                    })
                    .text(function (d) {
                        return 'v' + cpt;
                    })
                    .append("input")
                    .attr("type", "checkbox")
                    .attr("class", "myCheckbox")
                    .attr("name", "vertices")
                    .attr("value", function (d) {
                        return 'v' + c + cpt;
                    });

            }

            d3.select("#graphLinks").append("br");

        }

        choices = []
        // on click on button go: we select all checkboxes, check if they're checked then fill the links in dataset
        d3.select("#button").append("button")
            .attr("type", "button")
            .text("go")
            .on("click", function () {

                if (goClicked == 0) {
                    d3.selectAll(".myCheckbox").each(function (d) {
                        liens = d3.select(this);

                        if (liens.property("checked")) {
                            choices.push(liens.property("value"));
                        }
                    });
                    console.log(choices)
                    choices.forEach(function (choice) {
                        dataset.links.push({
                            "source": choice[1],
                            "target": choice[2]
                        });

                    });

                    // we add a link from each node to itself
                    for (let i = 0; i < graphSize; i++) {
                        dataset.links.push({
                            "source": i,
                            "target": i
                        });
                    }

                    goClicked = 1;
                    arcGraph();
                }

            });
    }
    chooseClicked = 1;


}

function arcGraph() {

   
    // Fillig the vertices array
    dataset.nodes.forEach(function (data, i) {

        vertices.push(data.name);

    });

    //Filling the links array
    dataset.links.map(function (l) {
        links.push(l);
    })

    // mapping the ids to nodes
    var idToNode = {};

    dataset.nodes.forEach(function (n) {
        idToNode[n.id] = n;
    });

    // Creating the svg canvas
    var canvas = d3.select("#graphBlock")
        .append("svg")
        .attr("width", (w + margin.left + margin.right))
        .attr("height", (h + margin.top + margin.bottom))
        .style("background", "#f7f8f3");

    // Setting a scale
    var xScale = d3.scalePoint()
        .domain(vertices)
        .range([100, w - 100]);

    var colors = d3.scaleOrdinal(d3.schemeCategory10);

    //creating a circle for each node
    var nodes = canvas.selectAll("circle")
        .data(vertices)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return (xScale(d))
        })
        .attr("cy", h - 30)
        .attr("r", 8)
        .style("fill", function (d, i) {
            return colors(d);
        });

    // Label them
    var labels = canvas.selectAll("myLabels")
        .data(vertices)
        .enter()
        .append("text")
        .attr("x", function (d) {
            return (xScale(d))
        })
        .attr("y", h - 5)
        .text(function (d) {
            return (d)
        })
        .style("text-anchor", "middle")
        .style("font", "2c3d63");



    // Add the links
    var linkss = canvas.selectAll('mylinks')
        .data(dataset.links)
        .enter()
        .append('path')
        .attr('d', function (d) {
            start = xScale(idToNode[d.source].name) // X position of start node on the X axis
            end = xScale(idToNode[d.target].name) // X position of end node
            return ['M', start, h - 30, // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
                    'A', // This means we're gonna build an elliptical arc
                    (start - end) / 2, ',', // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
                    (start - end) / 2, 0, 0, ',',
                    start < end ? 1 : 0, end, ',', h - 30
                ] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
                .join(' ');
        })
        .style("fill", "none")
        .attr('stroke-width', "2")
        .attr("stroke", function (d, i) {
            return colors(d)
        });





    //update after calculating distances
    canvas.on("click", function () {
        console.log("old verticies " + vertices)

        // calculating distances
        if (stability == false) {
            vertices = distanceCalculation(vertices, links);
        } else {
            alert("You've reached stability");
        }

        //Updating the scale domain
        xScale.domain(vertices);
        console.log("we're updating mathafak " + vertices)

        // updating labels
        labels.style("opacity", 0)
            .data(vertices)
            .transition()
            .delay(100)
            .duration(800)
            .style("opacity", 1)
            .attr("x", function (d) {
                return (xScale(d));
            })
            .attr("y", h - 5)
            .text(function (d) {
                return (d);
            });


        //updating vertices
        nodes
            .data(vertices)
            .transition()
            .delay(100)
            .duration(800)
            .attr("cx", function (d) {
                return (xScale(d));
            })
            .style("fill", function (d, i) {
                return colors(d);
            });



        //updating the links
        linkss.data(links)
            .transition()
            .delay(500)
            .duration(800)
            .attr('d', function (d) {
                start = xScale(idToNode[d.source].name) // X position of start node on the X axis
                end = xScale(idToNode[d.target].name) // X position of end node
                return ['M', start, h - 30, // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
                        'A', // This means we're gonna build an elliptical arc
                        (start - end) / 2, ',', // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
                        (start - end) / 2, 0, 0, ',',
                        start < end ? 1 : 0, end, ',', h - 30
                    ] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
                    .join(' ');
            });


    });






}

function distanceCalculation(vertices, links) {

    // Array that will contain all d(vk)

    let distances = [];
    let neighbors = [];
    let d = 0;

    vertices.forEach(vertex => {
        neighbors = [];
        d = 0;
        //for each vertex
        links.forEach(function (l) {
            if (vertex[1] == l.source) {
                neighbors.push(vertices.indexOf("v" + l.target));
            }
            if (vertex[1] == l.target) {
                neighbors.push(vertices.indexOf("v" + l.source));
            }
        });

        //removing duplicates 
        neighbors = [...new Set(neighbors)]
        // we calculate the sum of neighbors' ids
        neighbors.forEach(neigh => {
            d = d + neigh;
        });

        // d(Vk)
        d = d / neighbors.length;
        distances.push([d, vertex[1]]);
    });

    // we sort the distances
    distances.sort();


    // we create the new vertices array
    vertices = [];
    for (let i = 0; i < graphSize; i++) {
        vertices.push("v" + distances[i][1])
    }


    // we then test to see if the array has changed in this itteration, if yes, we return true to stop the calculations
    cpt = 0;
    for (let i = 0; i < graphSize; i++) {
        if (vertices[i][1] == oldVertices[i][1])
            cpt++;
    }

    if (cpt == graphSize) {
        stability = true;
    } else
        stability = false;

    // else we put the new array in the old array
    if (!stability) {
        oldVertices = [];
        for (let i = 0; i < graphSize; i++) {
            oldVertices.push(vertices[i])
        }
    }

    return vertices;


}