(function() {

  ///////////////////////////////////////////////////
  // STATE
  ///////////////////////////////////////////////////
  // window.state = {
  //   currentView: 'noCity',
  //   message: null,
  //   city: null,
  //   urbanArea: null,
  //   urbanAreaDescription: null,
  //   qualityOfLifeData: null
  // };

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

  // function addCityToState(state, cityFullName) {
  //   state.city = cityFullName;
  // };

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
    // if (!state.cities.length) state.currentView = 'noCity';
    // else state.currentView = 'cityDisplay';
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
    // state.urbanArea = urbanAreaData.full_name;
    // state.urbanAreaDescription = urbanAreaData._embedded['ua:scores'].summary;
    // state.qualityOfLifeData = urbanAreaData._embedded['ua:scores'].categories;
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

    // addCityToState(state, cityFullName);
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

  // function renderQualityOfLifeData(state) {
  //   var resultString = state.qualityOfLifeData.reduce(function(total, category) {
  //     return (
  //       total +
  //       '<div class="category">\
  //         <div class="categoryName">' + category.name + '</div>\
  //           <div class="ratingBar-outer">\
  //             <div class="ratingBar-inner js-ratingBar-inner" \
  //             style="background-color:' + category.color + '; width:' + 
  //             Math.round(category.score_out_of_10 * 10) +
  //             '%;">\
  //           </div>\
  //         </div>\
  //         <span class="ratingVal">' + Math.round(category.score_out_of_10 * 100) / 100 + '</span>\
  //       </div>'  
  //     );
  //   }, '');
  //   $('.js-qualityOfLifeData').html(resultString);
  // };

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

  function renderUrbanAreaName(state) {
    state.cities.forEach(function(city, index) {
      $('[data-input=' + index + ']').val(city.urbanAreaFirstName);
    });
  };

  function renderState(state) {
    console.log('state', state);
    renderMessage(state);
    renderUrbanAreaName(state);
    $('.js-cityDescription').html(state.cities[0].urbanAreaDescription);
    // if (state.qualityOfLifeData) {
    //   $('.js-input').val(state.urbanArea);
    //   $('.js-cityDescription').html(state.urbanAreaDescription);
    //   renderQualityOfLifeData(state);
    // }

    renderLayout(state);
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
