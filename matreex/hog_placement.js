
var start = Date.now();
var millis = Date.now() - start;

function defaultDict() {
    this.get = function (key) {
        if (this.hasOwnProperty(key)) {
            return this[key];
        } else {
            return 0;
        }
    }
}

class Hog_placement {

    constructor(div_id, data_species_tree, data_gene_tree) {

        // Settings
        this.cell_size = 30;
        this.gutter = 20;
        this.species_tree_width = 400;
        this.genes_tree_width = 400;
        this.gene_label_width = 240;
        this.species_label_width = 170;
        this.gene_name_width = 200;
        this.species_name_width = 200;
        this.start_collapse_depth= 2;
        this.max_depth = 0;
        this.show_image = true;


        // UI
        this.node_color = "#999"
        this.color_cell_zero = "#f8f8f8"

        // Data
        this.data_species_tree = data_species_tree
        this.data_gene_tree = data_gene_tree

        // Container
        this.container_id = div_id
        this.d3_container = d3.select("#" + this.container_id)
        this.container_size = this.d3_container.node().getBoundingClientRect()

    }

    start(){

        // Build species tree hierarchy
        this.hierarchy_species = d3.hierarchy(this.data_species_tree );
        this.cols = this.hierarchy_species.leaves().reverse()

        this.max_depth = 0
        this.hierarchy_species.each(d => {


            if (d.depth > this.max_depth){
                this.max_depth = d.depth
            }

        })

        document.getElementById('quantity').max = this.max_depth;
        document.getElementById('quantity').value = this.start_collapse_depth;

        // Build gene tree hierarchy
        this.hierarchy_genes = d3.hierarchy(this.data_gene_tree);
        this.rows = this.hierarchy_genes.leaves()

        // Build matrix
        this.data_matrix = this.build_matrix2()

        // PANEL LAYOUT
        this.gt_h = this.m_h = this.lgt_h =  this.cell_size * this.rows.length;
        this.m_w = this.lst_h =  this.st_h = this.cell_size * this.cols.length;
        this.gt_w = this.genes_tree_width;
        this.st_w = this.species_tree_width;
        this.lgt_w = this.gene_label_width;
        this.lst_w = this.species_label_width;
        this.ngt_w = this.gene_name_width;
        this.nst_w = this.species_name_width;

        // CREATE LABELS COLOR SCALE
        var list_label = []
        this.hierarchy_species.each(d => {d.data.description ? list_label.push(d.data.description): null})
        var dsc = [new Set(list_label)];
        this.speciesColor = d3.scaleOrdinal().domain(dsc).range(d3.schemePaired);


        var list_label = []
        this.hierarchy_genes.each(d => {d.data.description ? list_label.push(d.data.description): null})
        var dgc = [new Set(list_label)];
        this.genesColor = d3.scaleOrdinal().domain(dgc).range(d3.schemePaired);


        this.create_svg()

        this.add_legend()

        var start = Date.now();

        this.render()

        var millis = Date.now() - start;
        console.log(`seconds  render = ${(millis / 1000)}`);


        var start = Date.now();

        this.start_collapse()

        var millis = Date.now() - start;
        console.log(`seconds  collapse = ${(millis / 1000)}`);


        // Add action to button
        /*
        d3.select("#expandB").on("click", () => {
            this.expandAll()

            this.data_matrix = this.build_matrix2()
            this.render()
            this.recalibrate_position()
        })

         */
        d3.select("#collapseB").on("click", () => {
            this.expandAll()
            this.start_collapse()
            //this.data_matrix = this.build_matrix2()
            //this.render()
            //this.recalibrate_position()
        })

        d3.select("#smartB").on("click", () => {
            this.expandAll()
            this.smart_collapse()
        })


        d3.select("#show_species").on("click", () => {
            this.show_image = document.getElementById('show_species').checked;
            console.log(this.show_image)
        })


        d3.select("#quantity").on("change", () =>  {

            this.start_collapse_depth = document.getElementById('quantity').value;

            this.hierarchy_species.eachBefore(d => {
                if (d._children) {
                    d.children = d._children
                    d._children = null;
                }
            })

            this.hierarchy_species.eachAfter(d => {

                if (this.start_collapse_depth <= d.depth){

                    if (d.children) {
                        d._children = d.children;
                        d.children = null;
                    }

                }


            })

            this.data_matrix = this.build_matrix2()
            this.render()
            this.recalibrate_position()


        })

    }

    //

    create_svg(){

        const zoom = d3.zoom()
            .on('zoom', (event) => {
                this.G .attr('transform', event.transform);
            })
            .scaleExtent([0.1, 1]);

        this.SVG = this.d3_container
            .append("svg")
            .call(zoom)

        this.G =  this.SVG.attr("width", this.container_size.width)
            .attr("height", this.container_size.height)
            .append("g")

    }

    add_legend(){




        this.SVG.append("text")
            .text(function (d) {return "\u2731"
            })
            .attr('fill', '#555')
            .style("font-size", "25px")
            .attr('x', this.gutter)
            .attr('y', this.gutter + 20)
            .style("text-anchor", "start")




        this.SVG.append('text')
            .attr('x',  this.gutter + 20 + 8)
            .attr('y', this.gutter + 20 - 4 )
            .text('Duplication')



        this.SVG.append("text")
            .text(function (d) {return "\u274C"
            })
            .attr('fill', '#555')
            .style("font-size", "18px")
            .attr('x', this.gutter)
            .attr('y', 2*this.gutter + 38)
            .style("text-anchor", "start")

        this.SVG.append('text')
            .attr('x',  this.gutter + 20 + 8)
            .attr('y', 2*this.gutter + 40 - 4 )
            .text('Loss')


        this.SVG.append("text")
            .text(function (d) {return "\u21DD"
            })
            .attr('fill', '#555')
            .style("font-size", "32px")
            .attr('x', this.gutter)
            .attr('y', 3*this.gutter + 60)
            .style("text-anchor", "start")

        this.SVG.append('text')
            .attr('x',  this.gutter + 20 + 8)
            .attr('y', 3 * this.gutter + 60 - 4 )
            .text('HGT')


    }

    recalibrate_position(){

        //
        var g_gene = d3.select("#g_gene")
        var g_genes_names = d3.select("#g_genes_names")
        var g_species_names = d3.select("#g_species_names")
        var g_matrix = d3.select("#g_matrix")
        var g_species = d3.select("#g_species")

        //
        var size_gene = g_gene.node().getBBox()
        var size_species = g_species.node().getBBox()
        var size_matrix = g_matrix.node().getBBox()
        var size_colname = g_species_names.node().getBBox()
        var size_rowname = g_genes_names.node().getBBox()

        // X anchor
        var x_gt = this.gutter
        var x_gn = x_gt + parseInt(size_gene.width) + this.gutter
        var x_m = x_gn + parseInt(size_rowname.width) + this.gutter
        var x_gl = x_m + parseInt(size_matrix.width) + this.gutter

        // Y anchor
        var y_main = size_species.width + 3 * this.gutter + parseInt(size_colname.width)
        var y_gt = -this.hierarchy_genes.leaves()[0].x + this.cell_size/2  + y_main


        // if rotate(90) X and Y are inverted
        var y_offset_t =   -size_species.height + -this.hierarchy_species.leaves()[0].x - x_m - + this.cell_size/4
        var x_offset_sn =  size_species.width  + 2*this.gutter  //  size_gene.height
        var x_offset_sl =  x_offset_sn + size_matrix.height + parseInt(size_colname.width) + 2*this.gutter




        // HORIZONTAL

        this.g_mg.attr("transform", " translate (" + (x_m - 0.5*this.cell_size) +", " + (y_main- this.cell_size) + ") ");
        this.g_gtg.attr("transform", " translate (" + x_gt+", " + y_gt + ") ");
        this.rowName.attr("transform", "translate ("+ x_gn  +", " + y_main + ") ");
        this.rowLabels.attr("transform", " translate ("+ x_gl  +", " + y_main + ") ");


        // VERTICAL
        this.g_stg.attr("transform", " rotate (90) translate ("+ x_gt  +", " + y_offset_t + ") ");
        this.colName.attr("transform", " rotate (90)  translate ("+ x_offset_sn  +", " + (-x_gl  )+ ")  ");
        this.colLabels.attr("transform", " rotate (90)  translate ("+ x_offset_sl   +", " + (-x_gl   ) + ")  ");

    }

    //

    render() {

        d3.select('#g_species').remove()
        d3.select('#g_gene').remove()
        d3.select('#g_genes_labels').remove()
        d3.select('#g_genes_names').remove()
        d3.select('#g_matrix').remove()
        d3.select('#g_species_labels').remove()
        d3.select('#g_species_names').remove()

        var start = Date.now();


        this.g_stg = this.G.append('g').attr('id', 'g_species')
        this.render_species_tree()

        this.g_gtg = this.G.append('g').attr('id', 'g_gene')
        this.render_gene_tree()


        var millis = Date.now() - start;
        console.log(`seconds  tree = ${(millis / 1000)}`);


        var start = Date.now();

        this.g_mg = this.G.append('g').attr('id', 'g_matrix')
        this.render_matrix()

        var millis = Date.now() - start;
        console.log(`seconds  matrix = ${(millis / 1000)}`);


        var start = Date.now();

        this.rowLabels = this.G.append('g').attr('id', 'g_genes_labels')
        this.render_genes_labels()

        this.rowName = this.G.append('g').attr('id', 'g_genes_names')
        this.render_genes_names()

        var millis = Date.now() - start;
        console.log(`seconds  label = ${(millis / 1000)}`);


        this.colLabels = this.G.append('g').attr('id', 'g_species_labels')
        this.render_species_labels()

        this.colName = this.G.append('g').attr('id', 'g_species_names')
        this.render_species_names()

        var start = Date.now();

        this.recalibrate_position()


        var millis = Date.now() - start;
        console.log(`seconds  cal pos = ${(millis / 1000)}`);



    }

    render_species_tree(){

        this.root_species = d3.cluster()
            .nodeSize([this.cell_size, this.species_tree_width / (this.hierarchy_genes.height + 1)])
            .separation(() =>  { return 1})
            (this.hierarchy_species);


        this.g_stg.selectAll("path")
            .data(this.root_species.links())
            .join("path")
            .attr("fill", "none")
            .attr("stroke", (d) => {return d.target.data.color ? d.target.data.color : "#555"})
            .attr("stroke-opacity", 0.5)
            .attr("stroke-width", (d) => {
                var w = 2 + (d.target._children ? 2*this.dft(d.target).length : 0)
                return Math.min(this.cell_size/2, w)
            })
            .attr("d", d =>{
                var s = d.target;
                var d = d.source;
                return   "M" + s.y + "," + s.x + "L" + d.y + "," + s.x + "L" + d.y + "," + d.x;})


        this.g_stg.selectAll("circle")
            .data(this.root_species.descendants())
            .join("circle")
            .attr("cx", d => d.y )
            .attr("cy", d => d.x )
            .attr("fill", d => d.children || d._children ? "#555" : "#999")
            .attr("r", 6)
            /*
            .on("mouseover", (d,i) => {this.handleMouseOver(d.target)})
            .on("mouseout", (d,i) => this.handleMouseOut(d.target))

             */


        this.g_stg.append("g")
            .selectAll(".colLabelg")
            .data(this.root_species.descendants())
            .enter()
            .append("text")
            .filter(function(d) { return d._children || d.children })
            .text(function (d) {
                if (d._children){ return "\u002B";}
                else if (d.children){ return "\u2212";}

            })
            .attr('fill', 'white')
            .attr('cursor', 'pointer')
            .attr("x", d => d.y-5)
            .attr("y", d => d.x +5)
            .style("text-anchor", "start")
            .on("click", (event, d) => {
                this.collapse(d)
                this.collapse_gene_by_species_name(d)
            })

        /*
            .on("mouseover", (d,i) => {
                console.log(d)
                this.handleMouseOver(d.target)})
            .on("mouseout", (d,i) => this.handleMouseOut(d.target))

            */




    }

    render_matrix(){


        this.g_mg.selectAll("rect")
            .data(this.data_matrix, function (d) {
                return d.row + ":" + d.col;
            })
            .join("rect")
            .filter(d => {return d.value !== ''})
            .attr("x",  (d) => {
                return d.col * this.cell_size;
            })
            .attr("y",  (d) =>  {
                return d.row * this.cell_size;
            })
            .attr("class", function (d) {
                return "cell cell-border cr" + (d.row - 1) + " cc" + (d.col - 1);
            })
            .attr("width", this.cell_size)
            .attr("height", this.cell_size)
            .style("fill",  (d) => {
                if (d.value === "0.0") {return this.color_scale[d.c](0.0000001)}
                return this.color_scale[d.c](d.value)
            })



        var valuesText = this.g_mg.selectAll("text")
            .data(this.data_matrix, function (d) {
                return d.row + ":" + d.col;
            })
            .join('text')
            .filter(d => {return d.value !== ''})
            .text(function (d) {
                if (d.value === "0.0") {return '>0'}
                else if (d.value >=  10){
                    return parseFloat(d.value).toFixed(0)
                }
                return d.value;
            })
            .attr("x",  (d) => {
                if (d.value.toString().includes(".")) {
                    return d.col * this.cell_size + this.cell_size/2 -10 ;
                }
                if(d.value >= 10){
                    return d.col * this.cell_size + this.cell_size/2 -9 ;
                }
                return d.col * this.cell_size + this.cell_size/2 -4 ;
            })
            .attr("y",  (d) => {
                return d.row * this.cell_size + this.cell_size/2 +4;
            })
            .style("fill",  (d) => {
                if (d.value == 0 && d.c != 'red'){
                    return d.c
                }
                if (d.value === "0.0") {return this.scaleText(0.0000001)}
                return this.scaleText(d.value)
            })



        this.overlay = this.g_mg.append('rect')
            .attr("transform", "translate(30,30)")
            .attr("class", 'crosshair')
            .attr("width", this.root_species.leaves().length * this.cell_size)
            .attr("height", this.root_genes.leaves().length * this.cell_size)
            .style('fill', 'white')
            .attr('opacity', '0')
            .on("mousemove", (event) => {
                var xy = d3.pointer(event);


                xy[0] = Math.floor((xy[0]/this.cell_size)) * this.cell_size
                xy[1] = Math.ceil((xy[1]/this.cell_size)) * this.cell_size

                d3.select('.vline').remove()
                d3.select('.vline2').remove()
                d3.select('.hline').remove()
                d3.select('.hline2').remove()


                this.g_mg.append("line")
                    .attr("class", "vline")
                    .attr("x1", xy[0]+ this.cell_size )  //<<== change your code here
                    .attr("y1", - this.species_name_width )
                    .attr("x2", xy[0] +this.cell_size)  //<<== and here
                    .attr("y2", this.root_genes.leaves().length * this.cell_size + this.species_label_width)
                    .style("stroke-width", 2)
                    .style("stroke", "grey")
                    .style("fill", "none");

                this.g_mg.append("line")
                    .attr("class", "hline")
                    .attr("x1", -this.gene_name_width)  //<<== change your code here
                    .attr("y1", xy[1] + this.cell_size)
                    .attr("x2", this.root_species.leaves().length * this.cell_size + this.gene_label_width)  //<<== and here
                    .attr("y2", xy[1]+ this.cell_size)
                    .style("stroke-width", 2)
                    .style("stroke", "grey")
                    .style("fill", "none");

                this.g_mg.append("line")
                    .attr("class", "hline2")
                    .attr("x1", xy[0] + 2*this.cell_size)  //<<== change your code here
                    .attr("y1", xy[1] + this.cell_size)
                    .attr("x2", xy[0] + 2*this.cell_size)  //<<== and here
                    .attr("y2", xy[1] )
                    .style("stroke-width", 2)
                    .style("stroke", "grey")
                    .style("fill", "none");

                this.g_mg.append("line")
                    .attr("class", "vline2")
                    .attr("x1", xy[0] + this.cell_size)  //<<== change your code here
                    .attr("x2", xy[0] + 2*this.cell_size)
                    .attr("y1", xy[1] )
                    .attr("y2", xy[1] )
                    .style("stroke-width", 2)
                    .style("stroke", "grey")
                    .style("fill", "none");
            })
            .on("mouseout", (event) => {


                d3.select('.vline').remove()
                d3.select('.vline2').remove()
                d3.select('.hline').remove()
                d3.select('.hline2').remove()

            })

    }

    render_gene_tree(){

        this.root_genes = d3.cluster().nodeSize([this.cell_size, this.genes_tree_width/ (this.hierarchy_genes.height + 1)]).separation(() =>  { return 1})(this.hierarchy_genes);

        // annotate whole tree with placement tag
        // annotate whole tree with losses tag
        this.root_genes.eachBefore(d => {
            //if (d.data.placed) {
            //    d.descendants().forEach(element => {
            //        element.data.placed = d.data.placed
            //    });
            //}
            if (d.data.event == 'loss') {
                d.descendants().forEach(element => {
                    element.data.loss = true
                });

            }

        })


        this.g_gtg.selectAll("path")
            .data(this.root_genes.links())
            .join("path")
            .attr("fill", "none")
            .attr("stroke", (d) => {return d.target.data.color ? d.target.data.color : "#555"})
            .attr("stroke-opacity", (d) => {return d.target.data.event === 'loss' || d.target.parent.data.event === 'loss'  ? 0.2 : 0.5})
            .attr("stroke-width", (d) =>{
                var w = 2 + (d.target._children ? 2*this.dft(d.target).length : 0)
                return Math.min(this.cell_size/2, w)
            })
            .attr("d", d =>{
                var s = d.target;
                var d = d.source;
                return   "M" + s.y + "," + s.x + "L" + d.y + "," + s.x + "L" + d.y + "," + d.x;
            })


        this.g_gtg.append("g")
            .selectAll("circle")
            .data(this.root_genes.descendants())
            .join("circle")
            .attr("cx", d => d.y )
            .attr("cy", d => d.x )
            .attr("fill", d => d.children || d._children ? "#555" : "#999")
            .attr("r", d=>  d.parent && (d.data.event == 'hgt' || d.data.event == 'duplication' || (d.data.event == 'loss'  && d.parent.data.event != 'loss' ))  ? 1 : 6)
            .on("click", (event, d) => {

                if (d.data.event != 'loss'){
                    this.collapse(d)
                }

            })

        this.g_gtg.append("g")
            .selectAll(".rowLabelg")
            .data(this.root_genes.descendants())
            .join("g")
            .append("text")
            .filter(function(d) {return d.data.event == 'duplication' })
            .text(function (d) {return "\u2731"
            })
            .attr('fill', '#555')
            .style("font-size", "40px")
            .attr("x", d => d.y )
            .attr("y", d => d.x + 15)
            .style("text-anchor", "middle")

        this.g_gtg.append("g")
            .selectAll(".rowLabelg")
            .data(this.root_genes.descendants())
            .join("g")
            .append("text")
            .filter(function(d) {return d.data.event == 'loss'  && d.parent.data.event != 'loss' })
            .text(function (d) {return "\u274C"
            })
            .attr('fill', 'black')
            .style("font-size", "20px")
            .attr("x", d => d.y )
            .attr("y", d => d.x + 8)
            .style("text-anchor", "middle")
            .on("click", (event, d) => {
                //this.collapse( d)
            })


        this.g_gtg.append("g")
            .selectAll(".rowLabelg")
            .data(this.root_genes.descendants())
            .join("g")
            .append("text")
            .filter(function(d) {return d.data.event == 'hgt' })
            .text(function (d) {return "\u21DD"
            })
            .attr('fill', '#555')
            .style("font-size", "3em")
            .attr("x", d => d.y )
            .attr("y", d => d.x + 13)
            .style("text-anchor", "middle")


        this.g_gtg.append("g")
                    .selectAll(".rowLabelg")
                    .data(this.root_genes.descendants())
                    .join("g")
                    .append("text")
                    .filter(function(d) { return (d._children || d.children) && d.data.event != 'loss'})
                    .text(function (d) {
                        if (d._children){ return "\u002B";}
                        else if (d.children){ return "\u2212";}

                    })
                    .attr('fill', 'white')
                    .attr("x", d => d.y-5)
                    .attr("y", d => d.x +4)
                    .style("text-anchor", "start")
                    .on("click", (event, d) => {
                        this.collapse(d)
                    })


    }

    render_genes_labels(){


        this.rowLabels.selectAll(".rowLabelg")
            .data(this.hierarchy_genes.leaves())
            .enter()
            .append("text")
            .attr("font-weight", (d) => {return d._children ? 700 : 300})
            .text( (d) => { //d.name or aggregate leaves name

                return d.data.description;
            })

            .attr("x", 0)
            .attr("y", (d, i) => {
                return (i + 1) * this.cell_size -14;
            })
            .style("text-anchor", "start")



    }

    render_genes_names() {

        var set_name = function (d) {
            if (d.parent && (d.data.event == 'loss' || d.parent.data.event == "loss")) {
                return d.data.taxon
            }
            if (d._children && d.data.event !== 'loss') {
                if (d.data.HOG) {
                    return d.data.HOG
                }
                var name = ""
                this.dft(d).forEach(function (d) {
                    name += d.data.gene
                })
                return name

            }
            return d.data.gene;
        }

        this.rowName.selectAll(".rownameg")
            .data(this.hierarchy_genes.leaves())
            .enter()
            .append("text")
            .attr("font-weight", (d) => {
                return d._children  ? 700 : 300
            })
            .style("fill", (d) => {
                if(d.parent){
                    return d.parent.data.event == "loss" || d.data.event == "loss"  ? 'lightgrey'  : 'black';
                }
                else {

                    return 'black';
                }
            })
            .text((d) => {
                return set_name(d)
            })
            .attr("x", 0)
            .attr("y", (d, i) => {
                return (i + 1) * this.cell_size - 14;
            })
            .style("text-anchor", "start")

            .each((d, i, nodes) => {
                this.wrap(nodes[i], this.gene_name_width)
            })
        .on("mouseover", (event, d) => {
            event.target.innerHTML = set_name(d)
        })
        .on("mouseout", (event) => {
            this.wrap(event.target, this.gene_name_width)
        })


    }

    render_species_labels(){

        function hasUnicode (str) {
            for (var i = 0; i < str.length; i++) {
                if (str.charCodeAt(i) > 127) return true;
            }
            return false;
        }


        this.colLabels.selectAll(".colLabelg")
            .data(this.hierarchy_species.leaves())
            .enter()
            .append("text")
            .attr("font-weight", (d) => {return d._children ? 700 : 300})
            .text((d)  => {
                return d.data.description;
            })
            .style("fill", (d) => {return this.speciesColor(d.data.description)})
            .attr("x", 0)
            .attr("y",  (d, i) => {
                return (i + 1) * this.cell_size;
            })
            .style("text-anchor", "start")
            .attr("transform", (d, i) => {
                if (hasUnicode(d.data.description) ) {
                    return "translate(" + ((i +0.5) * -this.cell_size) +"," + ((i + 1) * this.cell_size) +") rotate(-90)";
                }
                return "rotate(0)";
            } )

    }

    render_species_names(){

        d3.select(".tooltip").remove()

        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        this.colName.selectAll(".colnameg")
            .data(this.hierarchy_species.leaves())
            .enter()
            .append("text")
            .style("fill", (d) => {
                if(d.data.matrix_color){
                  return d.data.matrix_color
                }
                else {

                    return 'black';
                }
            })
            .attr("font-weight", (d) => {return d._children ? 700 : 300})
            .text(function (d) {
                return d.data.taxon;
            })
            .attr("x", 0)
            .attr("y",  (d, i) => {
                return (i + 1) * this.cell_size;
            })
            .style("text-anchor", "start")
            .each((d,i,nodes) => this.wrap(nodes[i],this.species_name_width))
            .on("mouseover", (event, d) => {
                if (this.show_image){ (async() => {

        const endpoint = encodeURI('http://en.wikipedia.org/w/api.php?action=query&titles=' + d.data.taxon +'&prop=pageimages&origin=*&format=json&pithumbsize=200');
        const img = await d3.json(endpoint, {crossOrigin: "anonymous"});

        var idimg,j= null;
        j = JSON.parse(JSON.stringify(img.query.pages))
        for (var k in j ) { idimg = k; break;}


        try {
            j[idimg].thumbnail.source
        }
        catch (e) {
            return
        }


        div.html('')



        div.transition()
            .duration(200)
            .style("opacity", 1);

        div.html("<b>" + d.data.taxon + "</b>" )
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");



        div.html("<b>" + d.data.taxon + "</b>" + '<img src="' + j[idimg].thumbnail.source + '">')
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");






    })();
                event.target.innerHTML = d.data.taxon}
            })
            .on("mouseout", (event) => {
                this.wrap(event.target, this.gene_name_width)
                div.transition()
                    .duration(250)
                    .style("opacity", 0);
            })
    }

    build_matrix2(){

        this.cols = this.hierarchy_species.leaves().reverse()
        this.rows = this.hierarchy_genes.leaves()
        this.color_scale = {}

        for (var h = 0; h < this.cols.length; h++) {
            this.cols[h].empty= true

            if (this.cols[h].data.matrix_color){
                this.color_scale[this.cols[h].data.matrix_color] = null
            }
        }


        var values = []
        var data_matrix = [];
        var max = 1

        for (var r = 0; r < this.rows.length; r++) {

            let row_profile = (this.rows[r]._children || this.rows[r].children) ? this.rows[r].profile : this.rows[r].data.profile
            for (var c = 0; c < this.cols.length; c++) {

                let val = null
                let cpt = 0

                if (this.cols[c]._children || this.cols[c].children) {

                    var collapse_cols = this.dft(this.cols[c])


                    for (var j = 0; j < collapse_cols.length; j++) {

                        var v = row_profile[collapse_cols[j].data.taxon]

                        if (v || parseInt(v)==0){
                            if (val==null){val = 0}
                            val += parseInt(v)
                            cpt  +=1
                        }


                    }

                   if (val!=null){

                    val = val/cpt

                    val = val % 1 === 0 ? val : val.toFixed(1)

                    }


                }

                else {
                    val = row_profile[this.cols[c].data.taxon]
                }

                if (val!=null) {
                    max = val > max ?  val : max
                    var color = this.cols[c].data.matrix_color ? this.cols[c].data.matrix_color : this.color_cell_default;
                    data_matrix.push({row: r + 1, col: c + 1, value: val, c: color});
                    values.push(parseFloat(val));

                    val > 0 ? this.cols[c].empty = false : null
                }
            }




        }


        const median = arr => {
            let middle = Math.floor(arr.length / 2);
            arr = [...arr].sort((a, b) => a - b);
            return arr.length % 2 !== 0 ? arr[middle] : (arr[middle - 1] + arr[middle]) / 2;
        };


        var med = median(values.filter(x => x !== 0))

        if (max < 3*med){


            for (var key in this.color_scale) {

                var color = d3.color(key);

                this.color_scale[key] = d3.scaleLinear()
                    .domain([0, 0.000000000001, 1, max])
                    .range([this.color_cell_zero, color.darker(-2), color.darker(-1), color]);
            }

            this.color_scale[this.color_cell_default] = d3.scaleLinear()
                .domain([0, 0.000000000001, 1, max])
                .range([this.color_cell_zero,'lightsalmon', 'salmon', 'red']);
        }

        else{


            for (var key in this.color_scale) {

                var color = d3.color(key);

                this.color_scale[key] = d3.scaleLinear()
                    .domain([0, 0.000000000001,1, 3*med,max])
                    .range([this.color_cell_zero, color.darker(-2), color.darker(-1), color, color.darker()]);
            }

            this.color_scale[this.color_cell_default] = d3.scaleLinear()
                .domain([0, 0.000000000001,1, 3*med,max])
                .range([this.color_cell_zero,'lightsalmon', 'salmon', 'red',  'brown']);

        }

        this.scaleText = d3.scaleLinear()
            .domain([0, 0.000000000001, max])
            .range(['black', 'white','white']);


        this.hierarchy_species.eachAfter((d) => {
            if (d.children) {

                 d.children.every( e  => e.empty == true) ? d.empty = true : d.empty = false

                }
        })

        return data_matrix

    }

    collapse(d ){
        if (d.children) {
            d._children = d.children;
            d.children = null;
        }
        else {
            d.children = d._children;
            d._children = null;


        }

        if (d.data.HOG){this.update_profile_to_collapse_node(d)}
        this.data_matrix = this.build_matrix2()



        this.render()

        this.recalibrate_position()


    }

    collapse_gene_by_species_name(d, render_loop=true){

        var hog  = []
        var stack=[];
        stack.push(this.hierarchy_genes);
        while(stack.length!==0){
            var element = stack.pop();
            if ( element.data.taxon === d.data.taxon && element.data.event === "speciation" ){
                hog.push(element)
            }

            if(element.children != null){
                for(let i=0; i<element.children.length; i++){
                    var c = element.children[element.children.length-i-1]
                    stack.push(c)
                }
            }
            else if(element._children != null){
                for(let i=0; i<element._children.length; i++){
                    var c = element._children[element._children.length-i-1]
                    stack.push(c)

                }
            }

        }


        var to_collapse = d.children ? false : true

        hog.forEach(e => {


            if (to_collapse) {
                if (e._children) {if (e.data.HOG){this.update_profile_to_collapse_node(e)};return}
                e._children = e.children;
                e.children = null;

            }
            else {
                if (e.children) {if (e.data.HOG){this.update_profile_to_collapse_node(e)};return}
                e.children = e._children;
                e._children = null;
            }

            if (e.data.HOG){this.update_profile_to_collapse_node(e)}


        })

        if(render_loop){this.data_matrix = this.build_matrix2()

            this.render()

            this.recalibrate_position()}



}

    update_profile_to_collapse_node(d){

        if (d.children) {
            d.profile = null;
        }
        else {
            d.profile = new defaultDict();

            var collapsed_rows = this.dft(d)

            for (var c = 0; c < collapsed_rows.length; c++) {

                var p = collapsed_rows[c].data.profile

                for (var [key, value] of Object.entries(p)) {

                    if (value){
                        d.profile[key] = d.profile.get(key) + parseInt(value);}
                }

            }

        }
    }

    wrap(node, size) {


        var self = d3.select(node),text = self.text();

        var l = Math.floor(this.gene_name_width/10)

        if (text.length > l){
            text = text.slice(0,l)
            self.text(text + '...');
        }


        /*
        var self = d3.select(node),
            textLength = self.node().getComputedTextLength(),
            text = self.text();
        while (textLength > (size-10) && text.length > 0) {
            text = text.slice(0, -8);
            self.text(text + '...');
            textLength = self.node().getComputedTextLength();
        }

         */
    }

    handleMouseOver(d){
        d3.select(d).attr('fill', "green")
    }

    handleMouseOut(d){
        d3.select(d).attr('fill', this.node_color)
    }

    //
    dft(root){
        var leaves = []
        var stack=[];
        stack.push(root);
        while(stack.length!==0){
            var element = stack.pop();
            if(element.children != null){
                for(let i=0; i<element.children.length; i++){
                    var c = element.children[element.children.length-i-1]
                    stack.push(c)
                }
            }
            else if(element._children != null){
                for(let i=0; i<element._children.length; i++){
                    var c = element._children[element._children.length-i-1]
                    stack.push(c)

                }
            }
            else{leaves.push(element)}
        }
        return leaves
    }

    expandAll(){

        this.root_species.each(d => {
            if (d._children) {
                d.children = d._children;
                d._children = null;
            }
        })

        this.root_genes.each(d => {
            if (d._children && d.data.event != 'loss') {
                d.children = d._children;
                d._children = null;
            }
        })


    }

    start_collapse(){

        // All collapse at start (one row) inside subtree with no hgt/duplication are fully collapsed and duplicated node are collapse
        //species specific duplication are collapse at the duplication node


        this.root_species.each(d => {

            if (d.children && (d.empty === true || this.start_collapse_depth <= d.depth)){
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                }
                else {
                    d.children = d._children;
                    d._children = null;
                }
                this.collapse_gene_by_species_name(d, false)

            }
        })


        this.root_genes.eachAfter(d => {


            if (d.data.event === 'duplication' || d.data.event === 'hgt' ) {


                if (d.data.event === 'duplication' && d.children) {

                    var all_extant_species = true

                    d.children.forEach(c => {
                        if (c.children != null || c._children != null) {
                            all_extant_species = false
                        }
                    })

                    if (!all_extant_species) {
                        d.has_event = true

                        d.ancestors().forEach(element => {
                            element.has_event = true
                        });
                    }
                }

                else {
                    d.has_event = true

                    d.ancestors().forEach(element => {
                    element.has_event = true
                    });
                }

            }

            else {

                if (d.has_event != true){
                    d.has_event = false}
                }

        })

        this.root_genes.eachAfter(d => {



            if ((d.data.event == 'loss' || !d.has_event) && d.children ){
                d._children = d.children;
                d.children = null;
            }


            if (d.parent == null && d.children ) {

                if (d.data.event != "duplication"){
                    d._children = d.children;
                    d.children = null;
                }
            }

            else {
                if (d.children && d.parent.data.event == "duplication") {
                    d._children = d.children;
                    d.children = null;
                }

                if (d.data.event == "duplication") {

                    if (d.children){
                        var all_extant_species = true

                        d.children.forEach(c => {
                            if (c.children != null || c._children != null ) {
                                all_extant_species= false
                            }
                        } )

                        if (all_extant_species){
                            d._children = d.children;
                            d.children = null;
                        }
                    }



                }
            }





            if (d.data.HOG){this.update_profile_to_collapse_node(d)}

        })

        this.data_matrix = this.build_matrix2()
        this.render()
        this.recalibrate_position()


    }

    smart_collapse(){

        this.root_species.each(d => {
                if (d.children && (d.empty === true || this.start_collapse_depth <= d.depth)){
                    if (d.children) {
                        d._children = d.children;
                        d.children = null;
                    }
                    else {
                        d.children = d._children;
                        d._children = null;


                    }
                    this.collapse_gene_by_species_name(d, false)

                }
            })

        this.root_genes.eachAfter(d => {


            if (d.data.event === 'duplication') {

                if (d.children){
                    var all_extant_species = true

                    d.children.forEach(c => {
                        if (c.children != null || c._children != null ) {
                            all_extant_species= false
                        }
                    } )

                    if (!all_extant_species){
                        d.dontcol = true

                        d.ancestors().forEach(element => {
                            element.dontcol= true
                        })
                    }
                }




            }

        })

        this.root_genes.eachAfter(d => {


            if (d.dontcol !== true || d.data.event === 'loss') {

                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                }


                if (d.data.HOG){this.update_profile_to_collapse_node(d)}
            }

            if (d.data.event == "duplication") {

                if (d.children){
                    var all_extant_species = true

                    d.children.forEach(c => {
                        if (c.children != null || c._children != null ) {
                            all_extant_species= false
                        }
                    } )

                    if (all_extant_species){
                        d._children = d.children;
                        d.children = null;
                    }
                }



            }

            })

        this.data_matrix = this.build_matrix2()
        this.render()
    }
}