(function() {

  ///////////////////////////////////////////////////
  // STATE
  ///////////////////////////////////////////////////
  window.state = {
    currentView: 'noCity',
    city1: null,
    urbanArea1: null,
    urbanAreaDescription1: null,
    urbanAreaQualityOfLifeData1: null,
    city2: null,
    urbanArea2: null,
    urbanAreaDescription2: null,
    urbanAreaQualityOfLifeData2: null
  };

  ///////////////////////////////////////////////////
  // UPDATE STATE
  ///////////////////////////////////////////////////

  function updateMessage() {
    console.log('in updateMessage');
  };

  function clearInput(formNum) {
    $('.js-input-' + formNum).val('');
  };

  function getCityInputVal(state, formNum, addInputToState) {
    return (
      $('.js-input-' + formNum)
        .val()
        .trim()
        // .replace(/[^a-zA-Z-,\s]/g, '')
        .toLowerCase()
    );
  };

  function addCityToState(state, formNum, cityFullName) {
    state['city' + formNum] = cityFullName;
  };

  function updateViewInState(state) {
    //
  };

  function addUrbanAreaDataToState(state, formNum, urbanAreaData) {
    console.log('urbanAreaData:', urbanAreaData);
    state['urbanArea' + formNum] = urbanAreaData.full_name;
    state['urbanAreaDescription' + formNum] = urbanAreaData._embedded['ua:scores'].summary;
    state['urbanAreaQualityOfLifeData' + formNum] = urbanAreaData._embedded['ua:scores'].categories;
  };

  function addDataToState(state, data, formNum) {
    // console.log('data:', data);
    var cityData = data._embedded['city:search-results'][0];
    var cityFullName = cityData.matching_full_name || null;
    
    // if no urban area found for city, update message and exit function
    try {
      var urbanAreaData = cityData._embedded['city:item']._embedded['city:urban_area'];
    } catch(error) {
      updateMessage();
      return;
    }

    addCityToState(state, formNum, cityFullName);
    addUrbanAreaDataToState(state, formNum, urbanAreaData);
    updateViewInState(state);
  };

  function getUrbanAreaData(state, formNum, cityInputVal) {
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
        console.log('data:', data);
        addDataToState(state, data, formNum);
      })
      .fail(function(error) {
        console.log('error:', error);
      })
      .always(function() {
        console.log('request complete');
      });
  };

  function updateState(state, formNum) {
    var cityInputVal = getCityInputVal(state, formNum);
    if (cityInputVal) {
      getUrbanAreaData(state, formNum, cityInputVal);
    } else {
      updateMessage();
    }
  };

  ///////////////////////////////////////////////////
  // RENDER STATE
  ///////////////////////////////////////////////////


  ///////////////////////////////////////////////////
  // EVENT LISTENERS
  ///////////////////////////////////////////////////

  // all buttons exist on page load
  // don't need to worry about event delegation
  function listenForAddCityButtonClick() {
    $('.js-button-addCity').click(function(event) {
      event.preventDefault();
      
      var formNum = $(event.target).attr('data-addCity-num');
      updateState(state, formNum);
    });
  };

  ///////////////////////////////////////////////////
  // WINDOW LOAD
  ///////////////////////////////////////////////////
  $(function() {

    listenForAddCityButtonClick();

  });

}());
