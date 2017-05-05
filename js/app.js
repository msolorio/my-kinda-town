(function() {

  state = {
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

  function clearInput(formNum) {
    $('[data-input=' + formNum + ']').val('');
  };

  /**
   * removes special characters and leaves accented and all letter characters
   * */
  function getCityInputVal(state, formNum) {
    return $('[data-input=' + formNum + ']')
      .val()
      .trim()
      .replace(/[0-9@#!$%^&*()_+|~=`{}\[\]:";'<>?.\/\\]/g, '')
      .toLowerCase();
  };

  /**
   * updates state.currentView based on length of cities array
   * */
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

  /** returns only the name of the city and removes the state or country
   * returned from the API
   */
  function getCityFirstName(cityFullName) {
    return cityFullName.split(', ')[0];
  };

  /**
   * quality of life categories from API we don't want to to display
   * */
  var unneededCategories = [
    'Business Freedom',
    'Taxation',
    'Venture Capital',
    'Cost of Living',
    'Tolerance'
  ];

  /** takes categories array from API and converts it to object so
   * it is easier to work with
   */
  function convertToObj(categoriesArray) {
    var categoriesObj = {};
    for (var i=0, j=categoriesArray.length; i<j; i++) {
      var category = categoriesArray[i];
      if (unneededCategories.indexOf(category.name) < 0) {
        categoriesObj[category.name] = category;
      }
    }
    return categoriesObj;
  }

  /**
   * categories from the api that we want to rename
   * */
  var categoriesToRename = {
    'Commute': 'Short Commute to Work',
    'Economy': 'Healthy Economy',
    'Housing': 'Affordable Housing',
    'Startups': 'Thriving Startup Scene'
  };

  /**
   * replaces original category names with desired names from categoriesToRename array
   * */
  function renameCategories(categoriesObj, categoriesToRename) {
    for (category in categoriesToRename) {
      categoriesObj[category].name = categoriesToRename[category];
    }
    return categoriesObj;
  };

  /** 
   * build a city object and input as an item in the cities array
  */
  function addCityDataToState(state, cityFullName, urbanAreaData, formNum) {
    var cityObj = {};
    cityObj.cityName = cityFullName;
    cityObj.urbanAreaFullName = urbanAreaData.full_name;
    cityObj.urbanAreaFirstName = getCityFirstName(urbanAreaData.full_name);
    cityObj.urbanAreaDescription = urbanAreaData._embedded['ua:scores'].summary;
    categoriesArray = urbanAreaData._embedded['ua:scores'].categories;
    categoriesObj = convertToObj(categoriesArray);
    cityObj.categoriesObj = renameCategories(categoriesObj, categoriesToRename);
    state.cities[formNum] = cityObj;
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
      clearInput(formNum);
      return;
    }

    // if urban area found add city data to state
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

    updateMessage(state, 'Retrieving data');
    renderMessage(state);

    $.ajax(settings)
      // will succeed even if invalid search term
      // data will include an empty array of possible cities
      .done(function(data){
        console.log('data:', data);
        updateMessage(state, '');
        updateDataInState(state, data, cityInputVal, formNum);
        updateViewInState(state);
        renderState(state, formNum);
        renderLayout(state);
      })
      // server encountered error processing request
      .fail(function(error) {
        console.log('error:', error);
        updateMessage(state, 'There was an issue with the server.');
      })
      .always(function() {
        //
      });
  };

  /**
   * if value inputted make HTTP request to get city data
   */
  function updateStateOnAddCity(state, formNum) {
    var cityInputVal = getCityInputVal(state, formNum);
    if (cityInputVal) {
      getCityData(state, cityInputVal, formNum);
    } else {
      updateMessage(state, 'Please enter a city.');
      renderState(state, formNum);
      renderLayout(state);
    }
  };

  function updateStateOnRemoveCity(state, formNum) {
    state.cities.splice(formNum, 1);
    updateMessage(state, '');
    updateViewInState(state);
  };

  ///////////////////////////////////////////////////
  // RENDER STATE
  ///////////////////////////////////////////////////
  function renderMessage(state) {
    if (state.message) $('.js-message').css('display', 'block');  
    else $('.js-message').hide();
    $('.js-message').html(state.message);
  };

  /**
   * Hides and shows the larger sections
   * jQuery css() method used instead of show() to avoid setting display: inline-block
   */
  function renderLayout(state) {
    switch(true) {
      case (state.currentView === 'noCity'):
        $('[data-description-container=0]').hide();
        $('.js-qualityOfLifeContainer').hide();
        $('.js-form0').removeClass('col-xs-6');
        $('.js-form1').hide();
        $('[data-remove=0]').hide();
        break;
      case (state.currentView === 'singleCity'):
        $('[data-description-container=0]').css('display', 'block');
        $('[data-description-container=1]').hide();
        $('.js-qualityOfLifeContainer').css('display', 'block');
        $('.js-form0').addClass('col-xs-6');
        $('.js-form1').css('display', 'block');
        $('[data-remove=0]').css('display', 'block');
        $('[data-remove=1]').hide();
        break;
      case (state.currentView === 'twoCities'):
        $('[data-description-container=0]').css('display', 'block');
        $('[data-description-container=1]').css('display', 'block');
        $('.js-qualityOfLifeContainer').css('display', 'block');
        $('.js-form1').css('display', 'block');
        $('[data-remove=1]').css('display', 'block');
        break;
      default:
        console.log('no view set');
        break;
    }
  };

  /**
   * renders the ratings bars for each category by looping over
   * the cities array and using the score to determine the width of the colored bars
   * */
  function renderRatingBars(state, category) {
    var resultString = '';
    var cities = state.cities;
    for (var i=0, j=cities.length; i<j; i++) {
      var categoryData = cities[i].categoriesObj[category];
      console.log('categoryData:', categoryData);
      var score = categoryData.score_out_of_10;
      resultString += (
        '<div class="categoryData">\
          <div class="rating">\
            <div class="ratingBar-outer">\
              <div class="ratingBar-inner" data-cityNum="' + i + '"\
              style="width: ' + score * 10 + '%">\
              </div>\
            </div>\
            <div class="ratingVal">' + Math.round(score) + '/10</div>\
          </div>\
        </div>'
      );
    }
    return resultString;
  };

  /**
   * renders the categories section by looping over the
   * categoriesObj
   * */
  function renderCategories(state) {
    var resultString = '';
    var categoriesObj = state.cities[0] && state.cities[0].categoriesObj;
      for (category in categoriesObj) {
        if (categoriesObj.hasOwnProperty(category)) {
          resultString += (
            '<div class="category col-xs-12 col-sm-6">\
              <h4 class="categoryName">' + categoriesObj[category].name + '</h4>' +
              renderRatingBars(state, category) +
            '</div>'  
          );
        }
      }
    $('.js-qualityOfLifeData').html(resultString);
  };

  function renderUrbanAreaName(state) {
    $('.js-input').val('');
    state.cities.forEach(function(city, index) {
      $('[data-input=' + index + ']').val(city.urbanAreaFirstName);
    });
  };


  function renderDescription(state) {
    state.cities.forEach(function(city, index) {
      if (city.urbanAreaDescription) {
        $('[data-description=' + index + ']').html(city.urbanAreaDescription);
        $('[data-cityName=' + index + ']').html(city.urbanAreaFirstName);
      }
      else $('[data-description=' + index + ']').html('');
    });
  };

  function renderState(state, formNum) {
    console.log('state', state);
    renderUrbanAreaName(state);
    renderDescription(state);
    renderCategories(state, formNum);
    renderMessage(state);
  };

  ///////////////////////////////////////////////////
  // EVENT LISTENERS
  ///////////////////////////////////////////////////
  /**
   * all buttons exist on page load
   * don't need to worry about event delegation
   */
  function listenForAddCityButtonClick() {
    $('.js-button-addCity').click(function(event) {
      event.preventDefault();
      var formNum = $(event.currentTarget).attr('data-addCity');
      updateStateOnAddCity(state, formNum);
    });
  };

  function listenForRemoveCityButtonClick() {
    $('.js-button-remove').click(function(event) {
      event.preventDefault();
      var formNum = $(event.currentTarget).attr('data-remove');
      updateStateOnRemoveCity(state, formNum);
      renderState(state, formNum);
      renderLayout(state);
    });
  };

  function listenForDescriptionClick() {
    $('.descriptionButton').click(function(event) {
      var descriptionNum = $(event.currentTarget).attr('data-description-button');
      $('[data-description=' + descriptionNum + ']').toggle(150);
      $('.js-toggleTriangle-description' + descriptionNum).toggleClass('toggleTriangle-down');
    })
  };

  function listenForCityRatingsClick() {
    $('.js-qualityOfLifeHeadlineContainer').click(function(event) {
      $('.js-qualityOfLifeHeadlineDesc').toggle(150);
      $('.js-toggleTriangle-qualityOfLifeHeadline').toggleClass('toggleTriangle-down');
    });
  }

  ///////////////////////////////////////////////////
  // WINDOW LOAD
  ///////////////////////////////////////////////////
  $(function() {
    listenForAddCityButtonClick();
    listenForRemoveCityButtonClick();
    listenForDescriptionClick();
    listenForCityRatingsClick();
  });

}());
