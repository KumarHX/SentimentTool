
$(function(){
  var ctx = $('.lineChart'),
  endpointHost = 'https://sentiment-tool.herokuapp.com/api/articles/',
  fakeData = {
    objectTitle: 'No Man\'s sky',
    objectCoverArt: "PICTURE",
    objectOverallGood: 344,
    objectOverallBad: 201,
    dataPoints: [
      {
        day: 'Monday',
        overall: 78,
        articles: [{name: "some cool article"}, {name: "some cool article"}, {name: "some cool article"}]
      },{
        day: 'Tuesday',
        overall: 12,
        articles: [{name: "some cool article"}, {name: "some cool article"}, {name: "some cool article"}]
      },{
        day: 'Wednesday',
        overall: 100,
        articles: [{name: "some cool article"}, {name: "some cool article"}, {name: "some cool article"}]
      },{
        day: 'Thursday',
        overall: 95,
        articles: [{name: "some cool article"}, {name: "some cool article"}, {name: "some cool article"}, {name: "some cool article"}]
      },{
        day: 'Friday',
        overall: 54,
        articles: [{name: "some cool article"}, {name: "some cool article"}, {name: "some cool article"}, {name: "some cool article"}]
      },{
        day: 'Saturday',
        overall: 67,
        articles: [{name: "some cool article"}, {name: "some cool article"}]
      },{
        day: 'Sunday',
        overall: 75,
        articles: [{name: "some cool article"}]
      }
    ]
  };



    var data = {
        labels: fakeData.dataPoints.map(function(point){
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
                data: fakeData.dataPoints.map(function(point){
                    return point.overall;
                }),
                spanGaps: false
            }
        ]
    }
  var myLineChart = new Chart(ctx, {
      type: 'line',
      data: data
  });

  $('.lineChart').on('click', function(e){
    var index = myLineChart.getElementAtEvent(e)[0]._index,
        articleArray = fakeData.dataPoints[index].articles,
        $articleCards = $('.articleCard');

        $articleCards.each(function(index){
          $(this).fadeOut(function(){
            $(this).remove();
          })
        })

    articleArray.forEach(function(articleObj, ind){
      var name = "No Man's Sky gets Game of the Year",
          sentiment = "75",
          votes = "450",
          imageUrl = "images/sky.jpg",
          trendClass = sentiment >= 50 ? 'happy' : 'sad',
          element= '<div class="articleCard"><a href="http://www.google.com" target="#blank">\
                    <h3>' + name + '</h3>\
                        <div class="article-stuff-container">\
                            <div class="rating ' + trendClass + '"><p class="percent">' + sentiment + '%</p><p class="numVotes">' + votes + ' votes</p></div>\
                         </div>\
                        </a>\
                      </div>';
      setTimeout(function(){
        $('.articleCard-container').append(element)
        $('.articleCard:last-child').css('background-image', 'url("images/black.png"), url(' + imageUrl + ')').fadeIn(ind*500)

      }, 500)
    })

  })

  var requestDataPoints = function(){
      $.ajax({
        url: endpoint,
        method: 'GET',
        success: function(response){
          console.log(response);
        },
        error: function(a,b,c){
          console.log(a,b,c);
        }
      })
    }
})