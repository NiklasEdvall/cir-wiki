/* Researcher–Project force-directed graph for the Active Projects page.
 * Requires D3 v7 to be loaded before this script.
 * Works with MkDocs Material instant navigation via document$.subscribe().
 */
(function () {
  "use strict";

  function init() {
    var svgEl = document.getElementById("researcher-graph-svg");
    if (!svgEl) return;

    // Clear previous render (triggered again on instant-navigation re-entry)
    d3.select("#researcher-graph-svg").selectAll("*").remove();

    var wrapper = svgEl.closest(".researcher-graph-wrapper");
    var width = (wrapper ? wrapper.clientWidth : 800) || 800;
    var height = 560;

    fetch("./data.json")
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        render(data, width, height);
      })
      .catch(function (err) {
        console.error("[researcher-graph] Failed to load data.json:", err);
      });
  }

  function render(rawData, width, height) {
    // Deep-copy so D3 can mutate freely across re-renders
    var nodes = rawData.nodes.map(function (d) { return Object.assign({}, d); });
    var links = rawData.links.map(function (d) { return Object.assign({}, d); });

    // ── Colour scheme (respects Material light / dark mode) ──────────────────
    var isDark = document.body.getAttribute("data-md-color-scheme") === "slate";
    var C = {
      researcher : isDark ? "#60a5fa" : "#2563eb",
      projectActive  : isDark ? "#fb923c" : "#ea580c",
      projectPlanning: isDark ? "#a78bfa" : "#7c3aed",
      link       : isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.14)",
      label      : isDark ? "#d1d5db" : "#1f2937",
      labelStroke: isDark ? "#0f172a" : "#ffffff",
      dim        : 0.12,
    };

    function nodeColor(d) {
      if (d.type === "researcher") return C.researcher;
      return d.status === "Planning" ? C.projectPlanning : C.projectActive;
    }

    // ── SVG setup ─────────────────────────────────────────────────────────────
    var svg = d3
      .select("#researcher-graph-svg")
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    var g = svg.append("g").attr("class", "rg-zoom-layer");

    svg.call(
      d3.zoom()
        .scaleExtent([0.35, 4])
        .on("zoom", function (event) { g.attr("transform", event.transform); })
    );

    // ── Force simulation ───────────────────────────────────────────────────────
    var simulation = d3.forceSimulation(nodes)
      .force("link",    d3.forceLink(links).id(function (d) { return d.id; }).distance(130))
      .force("charge",  d3.forceManyBody().strength(-420))
      .force("center",  d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(52));

    // ── Links ──────────────────────────────────────────────────────────────────
    var linkSel = g.append("g")
      .attr("class", "rg-links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", C.link)
      .attr("stroke-width", 1.8);

    // ── Nodes ──────────────────────────────────────────────────────────────────
    var drag = d3.drag()
      .on("start", function (event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
      })
      .on("drag", function (event, d) {
        d.fx = event.x; d.fy = event.y;
      })
      .on("end", function (event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
      });

    var nodeSel = g.append("g")
      .attr("class", "rg-nodes")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", function (d) { return "rg-node rg-node--" + d.type; })
      .style("cursor", "pointer")
      .call(drag);

    nodeSel.append("circle")
      .attr("r", function (d) { return d.type === "project" ? 26 : 19; })
      .attr("fill", nodeColor)
      .attr("stroke", C.labelStroke)
      .attr("stroke-width", 2);

    nodeSel.append("text")
      .text(function (d) { return d.label; })
      .attr("text-anchor", "middle")
      .attr("dy", function (d) { return d.type === "project" ? 43 : 35; })
      .attr("font-size", "11px")
      .attr("font-family", "var(--md-text-font, sans-serif)")
      .attr("fill", C.label)
      .attr("paint-order", "stroke")
      .attr("stroke", C.labelStroke)
      .attr("stroke-width", 3)
      .attr("stroke-linejoin", "round")
      .call(wrapText, 90); // wrap long labels

    // ── Tooltip ────────────────────────────────────────────────────────────────
    var tooltip = d3.select("#researcher-graph-tooltip");

    nodeSel
      .on("mouseover", function (event, d) {
        var html = "<strong>" + d.label + "</strong>";
        if (d.type === "researcher") {
          html += "<br><em>" + d.role + "</em><br>" + d.department;
        } else {
          html += "<br><em>Status: " + d.status + "</em><br>" + d.description;
        }
        tooltip.html(html).style("opacity", "1");
      })
      .on("mousemove", function (event) {
        var rect = document.getElementById("researcher-graph-svg").getBoundingClientRect();
        tooltip
          .style("left", (event.clientX - rect.left + 14) + "px")
          .style("top",  (event.clientY - rect.top  - 14) + "px");
      })
      .on("mouseout", function () {
        tooltip.style("opacity", "0");
      });

    // ── Click-to-highlight ─────────────────────────────────────────────────────
    var selectedId = null;

    function resetHighlight() {
      selectedId = null;
      nodeSel.style("opacity", 1);
      linkSel.style("opacity", 1);
    }

    function highlightNode(d) {
      selectedId = d.id;
      var neighbors = new Set([d.id]);
      links.forEach(function (l) {
        var s = l.source.id !== undefined ? l.source.id : l.source;
        var t = l.target.id !== undefined ? l.target.id : l.target;
        if (s === d.id) neighbors.add(t);
        if (t === d.id) neighbors.add(s);
      });
      nodeSel.style("opacity", function (n) {
        return neighbors.has(n.id) ? 1 : C.dim;
      });
      linkSel.style("opacity", function (l) {
        var s = l.source.id !== undefined ? l.source.id : l.source;
        var t = l.target.id !== undefined ? l.target.id : l.target;
        return (s === d.id || t === d.id) ? 1 : C.dim;
      });
    }

    svg.on("click", resetHighlight);

    nodeSel.on("click", function (event, d) {
      event.stopPropagation();
      if (selectedId === d.id) { resetHighlight(); } else { highlightNode(d); }
    });

    // ── Text filter ────────────────────────────────────────────────────────────
    var filterInput = document.getElementById("graph-filter");
    if (filterInput) {
      filterInput.value = "";
      // Use .oninput (property) to avoid stacking listeners on re-render
      filterInput.oninput = function () {
        var q = this.value.trim().toLowerCase();
        if (!q) { resetHighlight(); return; }
        var matchIds = new Set(
          nodes
            .filter(function (n) { return n.label.toLowerCase().includes(q); })
            .map(function (n) { return n.id; })
        );
        nodeSel.style("opacity", function (n) { return matchIds.has(n.id) ? 1 : C.dim; });
        linkSel.style("opacity", C.dim);
      };
    }

    // ── Tick ───────────────────────────────────────────────────────────────────
    simulation.on("tick", function () {
      linkSel
        .attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });
      nodeSel.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    });
  }

  // ── Utility: wrap SVG text to a max pixel width ────────────────────────────
  function wrapText(textSel, maxWidth) {
    textSel.each(function () {
      var text  = d3.select(this);
      var words = text.text().split(/\s+/).reverse();
      var lineHeight = 13; // px
      var dy = parseFloat(text.attr("dy")) || 0;
      var tspan = text.text(null)
        .append("tspan")
        .attr("x", 0)
        .attr("dy", dy + "px");

      var line  = [];
      var lineNum = 0;
      var word;

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > maxWidth && line.length > 1) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan")
            .attr("x", 0)
            .attr("dy", (++lineNum * lineHeight) + "px")
            .text(word);
        }
      }
    });
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  if (typeof document$ !== "undefined") {
    // MkDocs Material instant navigation
    document$.subscribe(init);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
