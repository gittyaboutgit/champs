function setupAllData() {

	var teams = {};
	var everySingleMatch = [];
	window.trees = [];

	for (var i = 2008; i <= 2013; i++) {
		everySingleMatch = everySingleMatch.concat(Util.allMatches[i]);
	}

	window.everyMatch = everySingleMatch;
	console.log("Every match", everySingleMatch[0]);

	for (var team in Util.Teams) {
		var nodes = [];
		if (Util.Teams.hasOwnProperty(team)) {
			var focusTeam = Util.Teams[team];
			var focusTeamId = Util.Teams[team].id;
			for (var team in Util.Teams) {
				if (Util.Teams.hasOwnProperty(team) && Util.Teams[team].id != focusTeamId) {
					var focusWins = 0;
					var focusLosses = 0;
					var matchesAgainstFocus = everySingleMatch.filter(function (m) {
							return (m.homeTeam.id == Util.Teams[team].id && m.awayTeam.id == focusTeamId) ||
							(m.awayTeam.id == Util.Teams[team].id && m.homeTeam.id == focusTeamId);
						});

					matchesAgainstFocus = matchesAgainstFocus.filter(function (m) {
							return m.winner() != undefined
						});

					focusWins = matchesAgainstFocus.filter(function (m) {
							return m.winner().id == focusTeamId
						}).length;
					focusLosses = matchesAgainstFocus.filter(function (m) {
							return m.winner().id != focusTeamId
						}).length;
					console.log("THings", focusWins, focusLosses);
					var node = {
						name : Util.Teams[team].name,
						children : [{
								name : "wins",
								size : focusWins
							}, {
								name : "losses",
								size : focusLosses
							}
						]
					};

					nodes.push(node);
				}
			}
		}
		trees.push(nodes);
	}
}

function displayEverything() {

	var root = {
		name : Util.getTeamByIndex(currentIndex).name,
		children : window.trees[currentIndex]
	};
	window.root = root;
	console.log(root);
	var width = 960,
	height = 700,
	radius = Math.min(width, height) / 2,
	color = d3.scale.category20c();

	d3.select("body").selectAll("#sunburst").remove();

	var svg = d3.select("body").append("svg")
		.attr("id", "sunburst")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height * .52 + ")");

	var partition = d3.layout.partition()
		.sort(null)
		.size([2 * Math.PI, radius * radius])
		.value(function (d) {
			return d.size;
		});

	var arc = d3.svg.arc()
		.startAngle(function (d) {
			return d.x;
		})
		.endAngle(function (d) {
			return d.x + d.dx;
		})
		.innerRadius(function (d) {
			return Math.sqrt(d.y);
		})
		.outerRadius(function (d) {
			return Math.sqrt(d.y + d.dy);
		});

	console.log("Starting...", partition.nodes);
	var path = svg.datum(root).selectAll("path")
		.data(partition.nodes)
		.enter().append("path")
		.attr("display", function (d) {
			return d ? null : "none";
		}) // hide inner ring
		.attr("d", arc)
		.style("stroke", "#fff")
		.style("fill", function (d) {
			return color((d.children ? d : d.parent).name);
		})
		.style("fill-rule", "evenodd")
		.each(stash);

	// Stash the old values for transition.
	function stash(d) {
		d.x0 = d.x;
		d.dx0 = d.dx;
	}

	// Interpolate the arcs in data space.
	function arcTween(a) {
		var i = d3.interpolate({
				x : a.x0,
				dx : a.dx0
			}, a);
		return function (t) {
			var b = i(t);
			a.x0 = b.x;
			a.dx0 = b.dx;
			return arc(b);
		};
	}
	d3.select(self.frameElement).style("height", height + "px");
}
window.onload = function () {
	d3.selectAll("select").on("change", function change() {
		window.currentIndex = this.value;
		displayEverything();
	});
	window.currentIndex = 0;
	setupAllData();
	displayEverything();
}