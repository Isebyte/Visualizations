var desired_maximum_marker_size = 400;
var size = [1, 2, 2, 5, 10, 30, 90, 200, 400, 800];

var trace1 = {
  x: [0.00000748, 0.00088, 0.01, 0.10, 0.94, 3.06, 9.41, 19.61, 24.94, 41.93],
  y: [0.73, 17.49, 20.47, 21.90, 28.02, 7.92, 2.84, 0.53, 0.09, 0.01],
  text: [
    '0.00000748% of the addresses<br>own 0.73% of BTC',
    '0.00088% of the addresses<br>own 17.49% of BTC',
    '0.01% of the addresses<br>own 20.47% of BTC',
    '0.10% of the addresses<br>own 21.90% of BTC',
    '0.94% of the addresses<br>own 28.02% of BTC',
    '3.06% of the addresses<br>own 7.92% of BTC',
    '9.41% of the addresses<br>own 2.84% of BTC',
    '19.61% of the addresses<br>own 0.53% of BTC',
    '24.94% of the addresses<br>own 0.09% of BTC',
    '41.93% of the addresses<br>own 0.01% of BTC'
  ],
  mode: 'markers',
  marker: {
    size: size,
    color: ['rgb(36, 57, 167)', 'rgb(74, 105, 198)', 'rgb(125, 181, 255)', 'rgb(96, 202, 205)', 'rgb(45, 96, 184)', 'rgb(82, 128, 247)', 'rgb(111, 15, 64)', 'rgb(159, 56, 102)', 'rgb(255, 142, 199)', 'rgb(205, 61, 113)'],
    sizeref: 4.0 * Math.max(...size) / (desired_maximum_marker_size**2),
    sizemode: 'area'
  }
};

var data = [trace1];

var layout = {
  title: 'The Bitcoin Wealth Distribution',
  showlegend: false,
  height: 700,
  width: 900,
  xaxis: {
    title: {
      text: '% of Addresses',
      font: {
        family: 'Courier New, monospace',
        size: 18,
        color: '#7f7f7f'
      }
    },
  },
  yaxis: {
    title: {
      text: '% of BTC Owned',
      font: {
        family: 'Courier New, monospace',
        size: 18,
        color: '#7f7f7f'
      }
    }
  }
};

Plotly.newPlot('myDiv', data, layout, {
  showSendToCloud: true
});
