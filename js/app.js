(function() {

  ///////////////////////////////////////////////////
  // STATE
  ///////////////////////////////////////////////////
  window.state = {
    currentView: 'noCity',
    message: null,
    city: null,
    urbanArea: null,
    urbanAreaDescription: null,
    qualityOfLifeData: null
  };

  ///////////////////////////////////////////////////
  // UPDATE STATE
  ///////////////////////////////////////////////////

  function updateMessage(state, message) {
    console.log('in updateMessage');
    state.message = message;
  };

  function clearInput() {
    $('.js-input').val('');
  };

  function getCityInputVal(state, addInputToState) {
    return $('.js-input').val().trim().toLowerCase();
    // .replace(/[^a-zA-Z-,\s]/g, '')
  };

  function addCityToState(state, cityFullName) {
    state['city'] = cityFullName;
  };

  function updateViewInState(state) {
    if (state.city === null) state.currentView = 'noCity';
    else state.currentView = 'cityDisplay';
  };

  function addUrbanAreaDataToState(state, urbanAreaData) {
    console.log('urbanAreaData:', urbanAreaData);
    state.urbanArea = urbanAreaData.full_name;
    state.urbanAreaDescription = urbanAreaData._embedded['ua:scores'].summary;
    state.qualityOfLifeData = urbanAreaData._embedded['ua:scores'].categories;
  };

  function updateDataInState(state, data) {
    var cityData = data._embedded['city:search-results'][0];
    var cityFullName = cityData.matching_full_name || null;
    
    // if no urban area found for city, update message and exit function
    try {
      var urbanAreaData = cityData._embedded['city:item']._embedded['city:urban_area'];
    } catch(error) {
      updateMessage('No data found for city.');
      return;
    }

    addCityToState(state, cityFullName);
    addUrbanAreaDataToState(state, urbanAreaData);
  };

  function getUrbanAreaData(state, cityInputVal) {
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
      .done(function(data){
        updateDataInState(state, data);
        updateViewInState(state);
        renderState(state);
      })
      .fail(function(error) {
        console.log('error:', error);
      })
      .always(function() {
        console.log('request complete');
      });
  };

  function updateState(state) {
    var cityInputVal = getCityInputVal(state);
    if (cityInputVal) {
      getUrbanAreaData(state, cityInputVal);
    } else {
      updateMessage(state, 'Please enter a city.');
      renderState(state);
    }
  };

  ///////////////////////////////////////////////////
  // RENDER STATE
  ///////////////////////////////////////////////////
  function renderQualityOfLifeData(state) {
    var resultString = state.qualityOfLifeData.reduce(function(total, category) {
      return (
        total +
        '<div class="category">' + category.name + '</div>\
          <div class="ratingBar-outer">\
            <div class="ratingBar-inner js-ratingBar-inner" data-percent="' + 
            Math.round(category.score_out_of_10 * 100) / 100 + 
            '">\
          </div>\
        </div>'  
      );
    }, '');
    $('.js-qualityOfLifeData').html(resultString);
  };

  function renderView(state) {
    console.log('in renderView');
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

  function renderState(state) {
    console.log('state', state);
    $('.js-input').val(state.urbanArea);
    $('.js-cityDescription').html(state.urbanAreaDescription);
    renderQualityOfLifeData(state);

    renderView(state);
  };

  ///////////////////////////////////////////////////
  // EVENT LISTENERS
  ///////////////////////////////////////////////////

  // all buttons exist on page load
  // don't need to worry about event delegation
  function listenForAddCityButtonClick() {
    $('.js-button-addCity').click(function(event) {
      event.preventDefault();

      updateState(state);
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
