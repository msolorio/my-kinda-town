(function() {

  window.state = {
    currentView: 'noCity',
    message: null,
    cities: [
    ]
  };

  ///////////////////////////////////////////////////
  // UPDATE STATE
  ///////////////////////////////////////////////////
  function updateMessage(state, message) {
    state.message = message;
  };

  function clearInput() {
    $('.js-input').val('');
  };

  function getCityInputVal(state, formNum) {
    return $('[data-input=' + formNum + ']').val().trim()
      .replace(/[@#!$%^&*()_+|~=`{}\[\]:";'<>?.\/\\]/g, '').toLowerCase();
  };

  function updateViewInState(state) {
    switch(true) {
      case (state.cities.length === 0):
        state.currentView = 'noCity';
        break;
      case (state.cities.length === 1):
        state.currentView = 'singleCity';
        break;
      case (state.cities.length === 2):
        state.currentView = 'twoCities';
        break;
      default:
        console.error('no view to show');
        break;
    }
  };

  function getCityFirstName(cityFullName) {
    return cityFullName.split(', ')[0];
  };

  function addCityDataToState(state, cityFullName, urbanAreaData, formNum) {
    console.log('urbanAreaData:', urbanAreaData);
    var cityObj = {};
    cityObj.cityName = cityFullName;
    cityObj.urbanAreaFullName = urbanAreaData.full_name;
    cityObj.urbanAreaFirstName = getCityFirstName(urbanAreaData.full_name);
    cityObj.urbanAreaDescription = urbanAreaData._embedded['ua:scores'].summary;
    cityObj.qualityOfLifeData = urbanAreaData._embedded['ua:scores'].categories;
    state.cities[formNum] = (cityObj);
  };

  function makeCapitalCase(inputVal) {
    var wordsArr = inputVal.split(' ');
    var capsArr = wordsArr.map(function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return capsArr.join(' ');
  };

  function updateDataInState(state, data, cityInputVal, formNum) {
    var cityData = data._embedded['city:search-results'][0] || null;
    var cityFullName = cityData && cityData.matching_full_name || null;
    
    // if no urban area found for city, update message and exit function
    try {
      var urbanAreaData = cityData._embedded['city:item']._embedded['city:urban_area'];
    } catch(error) {
      updateMessage(state, 'No data found for ' + makeCapitalCase(cityInputVal));
      clearInput();
      return;
    }

    addCityDataToState(state, cityFullName, urbanAreaData, formNum);
  };

  function getCityData(state, cityInputVal, formNum) {
    var settings = {
      type: 'GET',
      url: 'https://api.teleport.org/api/cities/',
      dataType: 'json',
      data: {
        search: cityInputVal,
        embed: 'city:search-results/city:item/city:urban_area/ua:scores'
      }
    };

    $.ajax(settings)
      // will succeed even if invalid search term
      // data will include an empty array of possible cities
      .done(function(data){
        console.log('data:', data);
        updateMessage(state, '');
        updateDataInState(state, data, cityInputVal, formNum);
        updateViewInState(state);
        renderState(state);
      })
      // server encountered error processing request
      .fail(function(error) {
        console.log('error:', error);
        updateMessage('There was an issue with the server.');
      })
      .always(function() {
        console.log('request complete');
      });
  };

  function updateState(state, formNum) {
    var cityInputVal = getCityInputVal(state, formNum);
    console.log(cityInputVal);
    if (cityInputVal) {
      getCityData(state, cityInputVal, formNum);
    } else {
      updateMessage(state, 'Please enter a city.');
      renderState(state);
    }
  };

  ///////////////////////////////////////////////////
  // RENDER STATE
  ///////////////////////////////////////////////////
  function renderMessage(state) {
    $('.js-message').html(state.message);
  };

  function renderLayout(state) {
    console.log('in renderLayout');
    if (state.currentView === 'noCity') {
      $('.js-cityDescription').hide();
      $('.js-qualityOfLifeData').hide();
    } else if (state.currentView === 'cityDisplay') {
      $('.js-cityDescription').show();
      $('.js-qualityOfLifeData').show();
    } else {
      console.log('no view set');
    }
  };

  // TODO: break up into smaller functions, possibly refactor loops if needed for speed
  function renderQualityOfLifeData(state) {
    var resultString = '';
    var numOfCategories = state.cities[0].qualityOfLifeData.length;
    for (var i=0; i<numOfCategories; i++) {
      resultString += '<div class="category">';
      resultString += '<h3 class="categoryName">' + state.cities[0].qualityOfLifeData[i].name + '</h3>'
      resultString += state.cities.reduce(function(total, city, index) {
        var categoryData = city.qualityOfLifeData[i];
        var score = Math.round(categoryData.score_out_of_10 * 100)/100;
        return (
          total +
          '<div class="rating">\
            <div class="ratingBar-outer">\
              <div class="ratingBar-inner" data-cityNum="' + index + '"\
              style="width: ' + score * 10 + '%">\
              </div>\
            </div>\
            <div class="ratingVal">' + score + '</div>\
          </div>'
        )
      }, '<div class="categoryData">') + '</div>';
      resultString += '</div>';
    }
    $('.js-cityDescription').html(resultString);
  };

  function renderUrbanAreaName(state) {
    state.cities.forEach(function(city, index) {
      $('[data-input=' + index + ']').val(city.urbanAreaFirstName);
    });
  };

  function renderDescription(state) {
    if (state.currentView === 'singleCity') {
      $('.js-cityDescription').html(state.cities[0].urbanAreaDescription);
    } else {
      $('.js-cityDescription').html('');
    }
  };

  function renderState(state) {
    console.log('state', state);
    renderMessage(state);
    renderUrbanAreaName(state);
    renderDescription(state);
    renderQualityOfLifeData(state);

    // renderLayout(state);
  };

  ///////////////////////////////////////////////////
  // EVENT LISTENERS
  ///////////////////////////////////////////////////

  // all buttons exist on page load
  // don't need to worry about event delegation
  function listenForAddCityButtonClick() {
    $('.js-button-addCity').click(function(event) {
      event.preventDefault();
      var formNum = $(event.currentTarget).attr('data-addCity');
      console.log(formNum);
      updateState(state, formNum);
    });
  };

  // function listenForRemoveCityButtonClick() {
  //   $('.js-button-remove').click(function(event) {
  //     event.preventDefault();
  //   });
  // };

  ///////////////////////////////////////////////////
  // WINDOW LOAD
  ///////////////////////////////////////////////////
  $(function() {

    listenForAddCityButtonClick();

  });

}());
