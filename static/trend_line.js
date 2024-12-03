<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flu Activity Trend Over Time</title>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>
<body>

  <h1>Flu Activity Level Trend by State</h1>
  <div id="plot" style="width:800px;height:500px;"></div>

  <script>
    fetch('data/output.json')
      .then(response => response.json())
      .then(fluData => {
        
        const states = [...new Set(fluData.map(item => item.STATENAME))];
        const traces = states.map(state => {
          const stateData = fluData.filter(item => item.STATENAME === state);

          return {
            x: stateData.map(item => item.WEEKEND),
            y: stateData.map(item => item["ACTIVITY LEVEL"]),
            mode: 'lines+markers',
            type: 'scatter',
            name: state
          };
        });

        const layout = {
          title: 'Flu Activity Level Trend by State',
          xaxis: {
            title: 'Date',
            type: 'date'
          },
          yaxis: {
            title: 'Activity Level',
            range: [0, 10]
          }
        };

        Plotly.newPlot('plot', traces, layout);
      });
  </script>

</body>
</html>