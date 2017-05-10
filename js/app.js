(function() {
  'use strict';

  var state = {
    currentView: 'noCity',
    message: null,
    cities: [
    ]
  };

  // object keys map to category names from api 
  var categoriesConfiguration = {
    'Leisure & Culture': {
      display: true,
      position: 0,
      dropdownOpen: true
    },
    'Education': {
      display: true,
      position: 1,
      dropdownOpen: true
    },
    'Housing': {
      name: 'Affordable Housing',
      display: true,
      position: 2,
      dropdownOpen: true
    },
    'Healthcare': {
      display: true,
      position: 3,
      dropdownOpen: true
    },
    'Cost of Living': {
      name: 'Low Cost of Living',
      display: true,
      position: 4,
      dropdownOpen: true
    },
    'Outdoors': {
      display: true,
      position: 5,
      dropdownOpen: true
    },
    'Environmental Quality': {
      display: true,
      position: 6,
      dropdownOpen: true
    },
    'Internet Access': {
      display: true,
      position: 7,
      dropdownOpen: true
    },
    'Safety': {
      display: true,
      position: 8,
      dropdownOpen: true
    },
    'Commute': {
      name: 'Short Commute Time',
      display: true,
      position: 9,
      dropdownOpen: true
    },
    'Travel Connectivity': {
      display: true,
      position: 10,
      dropdownOpen: true
    },
    'Startups': {
      display: true,
      position: 11,
      dropdownOpen: true
    },
    'Venture Capital': {
      display: false,
      position: 12,
      dropdownOpen: true
    },
    'Economy': {
      display: false,
      position: 10,
      dropdownOpen: true
    },
    'Taxation': {
      display: false,
      position: 11,
      dropdownOpen: true
    },
    'Business Freedom': {
      display: false,
      position: 12,
      dropdownOpen: true
    },
    'Tolerance': {
      display: false,
      position: 15,
      dropdownOpen: true
    },
  };

  ///////////////////////////////////////////////////
  // RENDER STATE
  ///////////////////////////////////////////////////
  function renderMessage(state) {
    var $jsMessage = $('.js-message');
    if (state.message) $jsMessage.css('display', 'block');  
    else $jsMessage.hide();

    $jsMessage.html(state.message);
  };

  /**
   * Hides and shows the larger sections
   * jQuery css() method used instead of show() to avoid setting display: inline-block
   */
  function renderLayout(state) {
    switch(true) {
      case (state.currentView === 'noCity'):
        $('.button-addCityCol0').removeClass('col-md-6');
        $('[data-description-container=0]').hide();
        $('.js-qualityOfLifeContainer').hide();
        $('.js-form0').removeClass('col-xs-6');
        $('.js-form1').hide();
        $('[data-remove=0]').hide();
        break;

      case (state.currentView === 'singleCity'):
        $('.button-addCityCol0').addClass('col-md-6');
        $('.button-addCityCol1').removeClass('col-md-6');
        $('[data-description-container=0]').css('display', 'block');
        $('[data-description-container=1]').hide();
        $('.js-qualityOfLifeContainer').css('display', 'block');
        $('.js-form0').addClass('col-xs-6');
        $('.js-form1').css('display', 'block');
        $('[data-remove=0]').css('display', 'block');
        $('[data-remove=1]').hide();
        break;

      case (state.currentView === 'twoCities'):
        $('.button-addCityCol1').addClass('col-md-6');
        $('[data-description-container=0]').css('display', 'block');
        $('[data-description-container=1]').css('display', 'block');
        $('.js-qualityOfLifeContainer').css('display', 'block');
        $('.js-form1').css('display', 'block');
        $('[data-remove=1]').css('display', 'block');
        break;

      default:
        console.error('no view set');
        break;
    }
  };


  /**
   * renders the ratings bars for each category by looping over
   * the cities array and using the score to determine the width of the colored bars
   */
  function renderRatingBars(state, categoryIndex) {
    return state.cities.reduce(function(resultString, city, index) {
      var score = city.categoriesArray[categoryIndex].score;

      return resultString += (
        '<div class="categoryData">' +
          '<div class="rating">' +
            '<div class="ratingBar-outer">' +
              '<div class="ratingBar-inner" data-cityNum="' + index + '"' +
              'style="width: ' + score * 10 + '%">' +
              '</div>' +
            '</div>' +
            '<div class="ratingVal">' + Math.round(score) + '/10</div>' +
          '</div>' +
        '</div>'
      );
    }, '');
  };

  /**
   * renders the categories section by looping over the
   * categoriesArray
   */
  function renderCategories(state) {
    var categoriesArray = state.cities[0] && state.cities[0].categoriesArray;

    // if categoriesArray exists render categories
    var resultString = categoriesArray &&
      categoriesArray.reduce(function(resultString, category, index) {
        return resultString += (
          '<div class="category col-xs-12 col-sm-6">' +
            '<h4 class="categoryName">' + category.name + '</h4>' +
            renderRatingBars(state, index) +
          '</div>'
        );
      }, '');

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
      } else {
        $('[data-description=' + index + ']').html('');
      }
    });
  };

  function renderState(state, formNum) {
    renderUrbanAreaName(state);
    renderDescription(state);
    renderCategories(state, formNum);
    renderMessage(state);
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

  // removes special characters and leaves accented and all letter characters
  function getCityInputVal(state, formNum) {
    return $('[data-input=' + formNum + ']')
      .val()
      .trim()
      .replace(/[0-9@#!$%^&*()_+|~=`{}\[\]:";'<>?.\/\\]/g, '')
      .toLowerCase();
  };

  // updates state.currentView based on length of cities array
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
    var cityFirstName = cityFullName.split(', ')[0];
    return cityFirstName === 'San Francisco Bay Area' ? 'San Francisco' : cityFirstName;
  };

  // pulls data from configuration w/data from api to build a processed categories array
  function processCategoriesData(categoriesApiArray, categoriesConfiguration) {

    var processedCategoriesArray = [];

    categoriesApiArray.forEach(function(categoryFromApi) {
      var categoryInConfig = categoriesConfiguration[categoryFromApi.name];
      // if category from api included in configuration
      if (categoryInConfig && categoryInConfig.display) {
        var categoryToKeep = $.extend(true, {}, categoryInConfig);
        // add score to configuration
        categoryToKeep.score = Math.round(categoryFromApi.score_out_of_10 * 100)/100;
        // use name specified in configuration, if none exists use name from api
        categoryToKeep.name = categoryToKeep.name || categoryFromApi.name;
        // inserts category at correct position
        processedCategoriesArray[categoryToKeep.position] = categoryToKeep;
      }
    });

    return processedCategoriesArray;
  }

  // build a city object and input as an item in the cities array
  function addCityDataToState(state, cityFullName, urbanAreaData, formNum) {
    var cityObj = {};
    cityObj.cityName = cityFullName;
    cityObj.urbanAreaFullName = urbanAreaData.full_name;
    cityObj.urbanAreaFirstName = getCityFirstName(urbanAreaData.full_name);
    cityObj.urbanAreaDescription = urbanAreaData._embedded['ua:scores'].summary;
    var categoriesArray = urbanAreaData._embedded['ua:scores'].categories;
    cityObj.categoriesArray = processCategoriesData(categoriesArray, categoriesConfiguration);
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
      /**
       * will succeed even if no match found
       * data would then include  an empty cities array
       */
      .done(function(data){
        updateMessage(state, '');
        updateDataInState(state, data, cityInputVal, formNum);
        updateViewInState(state);
        renderState(state, formNum);
        renderLayout(state);
      })
      // server encountered error processing request
      .fail(function(error) {
        console.error(error);
        updateMessage(state, 'There was an issue with the server.');
      });
  };

  
  // if value inputted make HTTP request to get city data
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
    $('.input0').focus();
    listenForAddCityButtonClick();
    listenForRemoveCityButtonClick();
    listenForDescriptionClick();
    listenForCityRatingsClick();
  });

}());
