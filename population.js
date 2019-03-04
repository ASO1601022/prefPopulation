class App extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        name: '',
      }
      this.onChangeField = this.onChangeField.bind(this)
    }
    
    componentWillMount(){
      axios.get('https://opendata.resas-portal.go.jp/api/v1/prefectures',
        {headers: {'X-API-KEY':'iMtlXvUOkWZEUnISRAiecSzMLz7UdbqsGngWViDH'}})
        .then((res) => { 
          var chart = Highcharts.chart('container', {
            title: {
              text: ''
            },
            yAxis: {
              title: {
                text: '人口数'
              },
              labels: {
                formatter: function() {
                  return Highcharts.numberFormat(this.value, 0, ',', ',')	
  　　　　　　　　}
              }
            },
            xAxis:{
              title:{
                text: '年度'
              },
              type: 'datetime'
            },
            legend: {
              layout: 'vertical',
              align: 'right',
              verticalAlign: 'middle'
            },
          
            plotOptions: {
              series: {
                label: {
                  connectorAllowed: false
                },
                pointStart: Date.UTC(1980),
                pointInterval: 1000 * 3600 * 24 * 3650,

              }
            },
            responsive: {
              rules: [{
                condition: {
                  maxWidth: 500
                },
                chartOptions: {
                  legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                  }
                }
              }]
            }
          })
          var row = document.createElement('tr')
          for(var i=0; i<res.data.result.length; i++){
            if(i%5 == 0){
              var row = document.createElement('tr')
            }
            var td = document.createElement('td')
            var prefCheck = document.createElement('input')
            prefCheck.type = 'checkbox'
            prefCheck.className = 'prefCheck'
            prefCheck.value = res.data.result[i].prefCode
            prefCheck.onchange = (e) => this.onChangeField(e, chart)
            td.append(prefCheck)
            var span = document.createElement('span')
            span.className = 'h5'
            span.append(res.data.result[i].prefName)
            td.append(span)
            row.append(td)
            document.getElementById('pref').append(row)
          }
        })
        .catch((err) => {
          console.log(err)
        })
    }

    onChangeField(e, chart) {
      this.setState({prefCode: e.target.value })
      axios.get('https://opendata.resas-portal.go.jp/api/v1/prefectures',
      {headers: {'X-API-KEY':'iMtlXvUOkWZEUnISRAiecSzMLz7UdbqsGngWViDH'}})
      .then((result) => {
        var prefName = result.data.result[this.state.prefCode-1].prefName
        axios.get('https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode='+this.state.prefCode,
        {headers: {'X-API-KEY':'iMtlXvUOkWZEUnISRAiecSzMLz7UdbqsGngWViDH'}})
        .then((res) => {
          var population = new Array()
          for(var i=0; i<res.data.result.data[0].data.length; i++){
            if(i == 0 || i%2 == 0){
              population.push(res.data.result.data[0].data[i].value)
            }
          }
          if(e.target.checked){
            chart.addSeries({
              name:prefName,
              data:population
            })
          }else{
            for(var i=0; i<chart.series.length; i++){
              if(prefName == chart.series[i].name){
                chart.series[i].remove()
                break
              }
            }
          }
        })
      })
      .catch((err) => {
        console.log(err);
      })
    }

    render() {
      return (
        <div className='container-fluid'>
          <nav className='navbar navbar-expand-md navbar-dark bg-dark fixed-top justify-content-md-center'>
            <a className='navbar-brand' href='#'>都道府県別総人口推移</a>
          </nav>
          <h4 className='mt-4 pt-5'><span className='border border-dark p-2'>都道府県</span></h4>
          <table className='table table-borderless' id='pref'></table>
          <div id='container'></div>
        </div>
      );
    }
  }

ReactDOM.render(
	<App />,
	document.getElementById('root')
)