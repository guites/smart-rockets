/* metrics */
var metrics = {};
metrics.iteration = 1;
metrics.avgFitness = 0;
metrics.numCrashed = 0;
metrics.numCompleted = 0;
metrics.recordFrames = lifespan;
metrics.recordFitness = 0;
metrics.currentHighestFitness = 0;
metrics = new Proxy(metrics, {
  set: function(target, property, value) {
    if (property == 'avgFitness') {
      target[property] = value;
      Object.keys(target).forEach((key) => {
        if (key != 'iteration') {
          addData(myChart, target.iteration, target[key], key);
        }
      });
      myChart.update(); //{duration:0}
    } else {
      target[property] = value;
    }
  }
});

/* graphs */
function addData(chart, label, data, datasetLabel) {
  if (chart.data.labels.length < label) {
    chart.data.labels.push(label);
  }
  chart.data.datasets.forEach((dataset) => {
    if (dataset.label == datasetLabel) {
      dataset.data.push(data);
    }
  });
}
var datasetses = [
  {
    label: 'avgFitness',
    data: [],
    borderWidth: 2,
    backgroundColor: '#f08d49',
    borderColor: '#f08d49'
  },
  {
    label: 'numCompleted',
    data: [],
    borderWidth: 2,
    backgroundColor: '#7ec699',
    borderColor: '#7ec699'
  },
  {
    label: 'numCrashed',
    data: [],
    borderWidth: 2,
    backgroundColor: '#e2777a',
    borderColor: '#e2777a'
  },
  {
    label: 'recordFrames',
    data: [],
    borderWidth: 2,
    backgroundColor: '#cc99cd',
    borderColor: '#cc99cd'
  },
  {
    label: 'recordFitness',
    data: [],
    borderWidth: 2,
    backgroundColor: '#f8c555',
    borderColor: '#f8c555'
  },
  {
    label: 'currentHighestFitness',
    data: [],
    borderWidth: 2,
    backgroundColor: '#00a1d3',
    borderColor: '#00a1d3'
  }
];
var labelses = [];

var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labelses,
      datasets: datasetses
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
myChart.height = 400;
myChart.width = 400;
