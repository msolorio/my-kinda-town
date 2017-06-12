(function() {
  'use strict';

  ///////////////////////////////////////////////////
  // JQUERY EASY AUTOCOMPLETE
  ///////////////////////////////////////////////////
  var options = {
    url: "js/urban-areas.json",
    getValue: "name",
    list: {
      match: {
        enabled: true
      }
    }
  };
  
  $('.js-input').easyAutocomplete(options);

  ///////////////////////////////////////////////////
  // STATE
  ///////////////////////////////////////////////////
  var state = {
    message: null,
    cities: [],
    inputError: false
  };
  
  ///////////////////////////////////////////////////
  // CONFIGURATIONS
  ///////////////////////////////////////////////////
/**
  * object keys map to category names from api
  * if name property is provided will override original when rendered
 */
  var categoriesConfiguration = {
    'Leisure & Culture': {
      display: true,
      position: 0
    },
    'Education': {
      display: true,
      position: 1
    },
    'Housing': {
      name: 'Affordable Housing',
      display: true,
      position: 2
    },
    'Healthcare': {
      display: true,
      position: 3
    },
    'Cost of Living': {
      name: 'Low Cost of Living',
      display: true,
      position: 4
    },
    'Outdoors': {
      display: true,
      position: 5
    },
    'Environmental Quality': {
      display: true,
      position: 6
    },
    'Internet Access': {
      display: true,
      position: 7
    },
    'Safety': {
      display: true,
      position: 8
    },
    'Commute': {
      name: 'Short Commute Time',
      display: true,
      position: 9
    },
    'Travel Connectivity': {
      display: true,
      position: 10
    },
    'Startups': {
      display: true,
      position: 11
    },
    'Economy': {
      display: true,
      position: 12
    },
    'Tolerance': {
      display: true,
      position: 13
    },
    'Venture Capital': {
      display: false,
      position: 14
    },
    'Taxation': {
      display: false,
      position: 15
    },
    'Business Freedom': {
      display: false,
      position: 16
    }
  };

  ///////////////////////////////////////////////////
  // RENDER STATE
  ///////////////////////////////////////////////////
  function renderMessage(state) {
    if (state.message) $('.js-message').css('display', 'block');  
    else $('.js-message').hide();

    $('.js-message').html(state.message);
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
            '<img class="removeCityButton js-removeCityButton" data-removecity=' + index + ' src="./img/cancel-button.svg" alt="delete city" title="delete city">' +
          '<div class="descriptionUnderline clearfix" data-citynamecolorindex=' + index % 7 + '></div>' +
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

  // removes special characters and leaves accented and all letter characters
  function getCityInputVal() {
    return $('.js-input')
      .val()
      .trim()
      .replace(/[0-9@#!$%^&*()_+|~=`{}\[\]:";'<>?.\/\\]/g, '')
      .toLowerCase();
  };

  // handles an exceptionally long full name to work on mobile layouts
  function handleFullNameExceptions(cityFullName) {
    switch(cityFullName) {
      case 'San Francisco Bay Area, California':
        return 'San Francisco, California';
      case 'Washington, District of Columbia':
        return 'Washington, DC';
      default:
        return cityFullName;
    }
  };

  // pulls data from configuration w/data from api to build a processed categories array
  function processCategoriesData(categoriesApiArray, categoriesConfiguration) {

    var processedCategoriesArray = [];

    categoriesApiArray.forEach(function(categoryFromApi) {
      var categoryInConfig = categoriesConfiguration[categoryFromApi.name];

      if (categoryInConfig && categoryInConfig.display) {
        var categoryToKeep = $.extend(true, {}, categoryInConfig);
        categoryToKeep.score = Math.round(categoryFromApi.score_out_of_10 * 100)/100;
        // use name specified in configuration, if none exists use name from api
        categoryToKeep.name = categoryToKeep.name || categoryFromApi.name;
        // inserts category at position specified
        processedCategoriesArray[categoryToKeep.position] = categoryToKeep;
      }
    });

    return processedCategoriesArray;
  }

  // build a city object and input as an item in the cities array
  function addCityDataToState(state, cityFullName, urbanAreaData) {
    var cityObj = {};
    cityObj.cityName = cityFullName;
    cityObj.urbanAreaFullName = handleFullNameExceptions(urbanAreaData.full_name);
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

    if (cityInputVal) {
      getCityData(state, cityInputVal);
    } else {
      updateMessage(state, 'Please enter a city.');
      renderState(state);
    }
  };

  function updateStateOnRemoveCity(state, removeCityIndex) {
    state.cities.splice(removeCityIndex, 1);
    updateMessage(state, '');
  };

  ///////////////////////////////////////////////////
  // EVENT LISTENERS
  ///////////////////////////////////////////////////
  function listenForAddCityButtonClick() {
    $('.js-button-addCity').click(function(event) {
      event.preventDefault();
      updateStateOnAddCity(state);
    });
  };

  function listenForRemoveCityButtonClick() {
    $('.js-descriptions').on('click', '.js-removeCityButton', function(event) {
      var removeCityIndex = $(event.currentTarget).attr('data-removecity');
      updateStateOnRemoveCity(state, removeCityIndex);
      renderState(state);
      renderLayout(state);
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
    $('.js-input').focus();
    listenForAddCityButtonClick();
    listenForRemoveCityButtonClick();
    listenForDescriptionClick();
    listenForCityRatingsClick();
  });

}());
