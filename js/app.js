(function() {
  'use strict';

  window.state = {
    message: null,
    cities: [
    ],
    inputError: false
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
    'Economy': {
      display: true,
      position: 12,
      dropdownOpen: true
    },
    'Tolerance': {
      display: true,
      position: 13,
      dropdownOpen: true
    },
    'Venture Capital': {
      display: false,
      position: 14,
      dropdownOpen: true
    },
    'Taxation': {
      display: false,
      position: 15,
      dropdownOpen: true
    },
    'Business Freedom': {
      display: false,
      position: 16,
      dropdownOpen: true
    }
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

  function renderLayout(state) {
    if (state.cities.length) $('.js-qualityOfLifeContainer').css('display', 'block');
    else $('.js-qualityOfLifeContainer').hide();
  };


  /**
   * renders the ratings bars for each category by looping over
   * the cities array and using the score to determine the width of the colored bars
   */
  function renderRatingBars(state, categoryIndex) {
    return state.cities.reduce(function(resultString, city, index) {
      var score = city.categoriesArray[categoryIndex].score;
      var cityFullName = city.urbanAreaFullName;
      return resultString += (
        '<div class="categoryData">' +
          '<div class="rating">' +
            '<div class="categoriesCityName">' + cityFullName + '</div>' +
            '<div class="ratingBar-outer">' +
              '<div class="ratingBar-inner" data-categoryColorIndex="' + index % 7 + '"' +
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
    var resultString = state.cities.reduce(function(result, city, index) {
      return result += (
        '<div class="descriptionContainer" ' +
          'data-description-container=' + index + '>' +
          '<div ' + 
            'class="descriptionButton" ' +
            'data-description-button=' + index + '>' +
            '<span data-cityName=' + index + '>' + city.urbanAreaFullName + '</span>' +
            '<span class="toggleTriangle js-toggleTriangle-description' + index + '">' +
              '&nbsp;&#9656' +
            '</span>' +
          '</div>' +
          '<div class="descriptionUnderline" data-citynamecolorindex=' + index % 7 + '></div>' +
          '<div ' +
            'class="cityDescription hide" ' +
            'data-description=' + index + '>' +
            city.urbanAreaDescription + 
          '</div>' +
        '</div>'
      );
    }, '');

     $('.js-descriptions').html(resultString);
  };

  function clearInput() {
    $('.js-input').val('');
  };

  function renderInputState(state) {
    if (state.inputError) {
      $('.js-input').addClass('input-error');
    } else {
      $('.js-input').removeClass('input-error');
    }
  }

  function renderState(state, formNum) {
    renderDescription(state);
    renderCategories(state, formNum);
    renderMessage(state);
    renderInputState(state);
  };

  ///////////////////////////////////////////////////
  // UPDATE STATE
  ///////////////////////////////////////////////////
  function updateMessage(state, message) {
    state.message = message;
  };

  // *** KEEP
  // removes special characters and leaves accented and all letter characters
  function getCityInputVal() {
    return $('.js-input')
      .val()
      .trim()
      .replace(/[0-9@#!$%^&*()_+|~=`{}\[\]:";'<>?.\/\\]/g, '')
      .toLowerCase();
  };

  // updates state.currentView based on length of cities array

  // *** REMOVE
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
  // function getCityFirstName(cityFullName) {
  //   var cityFirstName = cityFullName.split(', ')[0];
  //   return cityFirstName === 'San Francisco Bay Area' ? 'San Francisco' : cityFirstName;
  // };

  function getCityFullName(cityFullName) {
    if (cityFullName === 'San Francisco Bay Area, California') {
      cityFullName = 'San Francisco, California';
    }
    return cityFullName;
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
  function addCityDataToState(state, cityFullName, urbanAreaData) {
    var cityObj = {};
    cityObj.cityName = cityFullName;
    cityObj.urbanAreaFullName = getCityFullName(urbanAreaData.full_name);
    // cityObj.urbanAreaFirstName = getCityFirstName(urbanAreaData.full_name);
    cityObj.urbanAreaDescription = urbanAreaData._embedded['ua:scores'].summary;
    var categoriesArray = urbanAreaData._embedded['ua:scores'].categories;
    cityObj.categoriesArray = processCategoriesData(categoriesArray, categoriesConfiguration);
    state.cities.push(cityObj);
  };

  function makeCapitalCase(inputVal) {
    var wordsArr = inputVal.split(' ');
    var capsArr = wordsArr.map(function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });

    return capsArr.join(' ');
  };

  function updateDataInState(state, data, cityInputVal) {
    var cityData = data._embedded['city:search-results'][0] || null;
    var cityFullName = cityData && cityData.matching_full_name || null;
    
    // if no urban area found for city, update message and exit function
    try {
      var urbanAreaData = cityData._embedded['city:item']._embedded['city:urban_area'];
    } catch(error) {
      updateMessage(state, 'No data found for ' + makeCapitalCase(cityInputVal));
      state.inputError = true;
      return;
    }

    // if urban area found add city data to state
    addCityDataToState(state, cityFullName, urbanAreaData);
    state.inputError = false;
    clearInput();
    console.log('state:', state);
  };

  function getCityData(state, cityInputVal) {
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
      .done(function(data) {
        console.log('data:', data);

        updateMessage(state, '');
        updateDataInState(state, data, cityInputVal);
        renderState(state);
        renderLayout(state);
      })
      // server encountered error processing request
      .fail(function(error) {
        console.error(error);
        updateMessage(state, 'There was an issue with the server.');
      });
  };

  
  // if value inputted make HTTP request to get city data
  function updateStateOnAddCity(state) {
    var cityInputVal = getCityInputVal();

    // *** KEEP
    if (cityInputVal) {
      getCityData(state, cityInputVal);
    } else {
      updateMessage(state, 'Please enter a city.');
      renderState(state);
      // renderLayout(state);
    }
  };

  function updateStateOnRemoveCity(state, formNum) {
    state.cities.splice(formNum, 1);
    updateMessage(state, '');
    // updateViewInState(state);
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
      // var formNum = $(event.currentTarget).attr('data-addCity');
      updateStateOnAddCity(state);
    });
  };

  function listenForRemoveCityButtonClick() {
    $('.js-button-remove').click(function(event) {
      event.preventDefault();
      var formNum = $(event.currentTarget).attr('data-remove');
      updateStateOnRemoveCity(state, formNum);
      renderState(state);
      // renderLayout(state);
    });
  };

  function listenForDescriptionClick() {
    $('.js-descriptions').on('click', '.descriptionButton', function(event) {
      console.log('description button clicked');
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
