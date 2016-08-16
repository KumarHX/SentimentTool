
$(function(){
  var ctx = $('.lineChart'),
  // endpointHost = 'https://sentiment-tool.herokuapp.com/api/articles/graphData/20009696';
  endpointHost = 'http://localhost:3000/api/articles/graphData/20009696';
  // data = {
  //   objectTitle: 'No Man\'s sky',
  //   objectCoverArt: "http://assets1.ignimgs.com/2014/06/16/nomanssky1jpg-b688bd.jpg",
  //   objectOverallGood: 344,
  //   objectOverallBad: 201,

  //   dataPoints: [
  //     {
  //       day: 'Monday',
  //       overall: 78,
  //       articles: [{
  //         name: "some cool article"
  //         url:
  //         image:
  //         sentiment:
  //         totalVotes:

  //         }, {name: "some cool article"}, {name: "some cool article"}]
  //     },{
  //       day: 'Tuesday',
  //       overall: 12,
  //       articles: [{name: "some cool article"}, {name: "some cool article"}, {name: "some cool article"}]
  //     },{
  //       day: 'Wednesday',
  //       overall: 100,
  //       articles: [{name: "some cool article"}, {name: "some cool article"}, {name: "some cool article"}]
  //     },{
  //       day: 'Thursday',
  //       overall: 95,
  //       articles: [{name: "some cool article"}, {name: "some cool article"}, {name: "some cool article"}, {name: "some cool article"}]
  //     },{
  //       day: 'Friday',
  //       overall: 54,
  //       articles: [{name: "some cool article"}, {name: "some cool article"}, {name: "some cool article"}, {name: "some cool article"}]
  //     },{
  //       day: 'Saturday',
  //       overall: 67,
  //       articles: [{name: "some cool article"}, {name: "some cool article"}]
  //     },{
  //       day: 'Sunday',
  //       overall: 75,
  //       articles: [{name: "some cool article"}]
  //     }
  //   ]
  // };

    var build = function (data) {
        $('.boxArt').attr('src', 'http://assets1.ignimgs.com/2014/06/16/nomanssky1jpg-b688bd.jpg' /*data.objectCoverArt*/ );
        $('.objectTitle').html(data.objectTitle);
        $('.statItem.good p').html(data.objectOverallGood);
        $('.statItem.bad p').html(data.objectOverallBad);


    var chartData = {
        labels: data.dataPoints.map(function(point){
          return point.day;
        }),
        datasets: [
            {
                label: 'Sentiment Data',
                fill: false,
                lineTension: 0.1,
                backgroundColor: "#FFF",
                fill: false,
                borderColor: "#BF1313",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#BF1313",
                pointBorderWidth: 10,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: data.dataPoints.map(function(point){
                    return point.overall;
                }),
                spanGaps: false
            }
        ]
    }
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: chartData
    });

    $('.lineChart').on('click', function(e){
      var index = myLineChart.getElementAtEvent(e)[0]._index,
          articleArray = data.dataPoints[index].articles,
          $articleCards = $('.articleCard');

          $articleCards.each(function(index){
            $(this).fadeOut(function(){
              $(this).remove();
            })
          })

      articleArray.forEach(function(articleObj, ind){
            var trendClass = articleObj.sentiment >= 50 ? 'happy' : 'sad',
            element= '<div class="articleCard"><a href="' + articleObj.url +'" target="#blank">\
                      <h3>' + articleObj.name + '</h3>\
                          <div class="article-stuff-container">\
                              <div class="rating ' + trendClass + '"><p class="percent">' + articleObj.sentiment + '%</p><p class="numVotes">' + articleObj.totalVotes + ' votes</p></div>\
                           </div>\
                          </a>\
                        </div>';
        setTimeout(function(){
          $('.articleCard-container').append(element)
          $('.articleCard:last-child').css('background-image', 'url("images/black.png"), url(' + articleObj.image + ')')

        }, (ind + 1) * 500)
      })

    })
  }

  var initChart = function(){
      $.ajax({
        url: endpointHost,
        method: 'GET',
        dataType: 'json',
        success: function(response){
          console.log(response);
          build(response);
        },
        error: function(a,b,c){
          console.log(a,b,c);
        }
      })
    }

    initChart();
})
