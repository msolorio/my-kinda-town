# My Kinda Town

This responsive web app was created to help prospective transplants make their next move by providing information about major cities around the world. Enter a city to get key metrics for that city. Enter more cities and compare your favorite picks side by side.

![alt text](./img/screenshot.png "desktop view")


## How To Get Started

Type a city into the search bar and view ratings for that city on a scale from 0 to 10 for a number of key quality of life factors. Enter more cities to compare your favorites side by side.

[Get Started](http://michaelsolorio.com/my-kinda-town/intro/index.html)

## Technologies Used

- HTML
- CSS
- JavaScript
- jQuery
- Bootstrap's grid

## Exploring the Code
### From Entering a City to Beautifully Rendered Data

The front end code follows a separation of concerns, organized into an object tracking application state, custom configurations on our incoming data,  functionality that updates state, functionality that renders state, and our event listeners.

The following illustrates the journey our program takes from entering in a city to seeing the data beautifully rendered to the screen.

### Entering a City

When a city is typed in and submitted, the initial event listener is triggered, ([listenForAddCityButtonClick](https://github.com/msolorio/my-kinda-town/blob/master/js/app.js#L358)) and we make an HTTP request passing in the sanitized input value ([getCityInputVal](https://github.com/msolorio/my-kinda-town/blob/master/js/app.js#L224)) as the search parameter and an embed query parameter ([getCityData](https://github.com/msolorio/my-kinda-town/blob/master/js/app.js#L304)).

The embed we pass in follows the [HAL standard](http://stateless.co/hal_specification.html) for designing APIs. It allows us to link together associated data from various API endpoints and retrieve all of that data in a single request. In our case, the embed query parameter we pass in specifies that we want to look up the specific city passed as the search parameter, find it's associated urban area, and find the quality of life data for that urban area. If a city exists for the passed in search term and an associated urban area is found for that city ([updateDataInState](https://github.com/msolorio/my-kinda-town/blob/master/js/app.js#L285)), that data is then passed to functionality to manipulate the data before it is added to state.

### Manipulating the Data

We build a new city object that will hold our data for that urban area. ([addCityDataToState](https://github.com/msolorio/my-kinda-town/blob/master/js/app.js#L266)) We then merge the incoming quality of life data with any specific configurations we've set. ([categoriesConfigurations](https://github.com/msolorio/my-kinda-town/blob/master/js/app.js#L35)) In our configurations we specify whether or not we want to display that category, if we want to replace an ambiguous category name, and also specify the position in the list that the category will be rendered in. Once the data is merged we add it to the city object along with the urban area name, add the city object to state.cities and continue on to rendering state. 

### Rendering the City Description Bars

Using JavaScript's reduce method we then loop through each object in state.cities and build a string including an urban area name and description bar for each urban area. ([renderDescription](https://github.com/msolorio/my-kinda-town/blob/master/js/app.js#L170)) We attach the array index of each city object to the buttons for jQuery to latch on to when either the remove city button is clicked or the show description button is clicked to display the city description in a dropdown. We calculate a color index with `index % 7`. The resulting color index value is associate with one of seven colors specified in our main.css file. The generated markup for the array of city description bars is then appended to the DOM.

### Rendering the Category Data

We then render our categories in much the same way as rendering our city name and description bars except this time we loop through our array of included categories. ([renderCategories](https://github.com/msolorio/my-kinda-town/blob/master/js/app.js#L153)) For each category we then loop through each included city and build a string for the rating bars. ([renderRatingBars](https://github.com/msolorio/my-kinda-town/blob/master/js/app.js#L129)) We pass in the score from our city data object as the width value for that inner rating bar. We also pass in the color index value for that city to the rating bar. In this way, the color for a given city's description bar will match the rating bars for that city. Once the string is built for all category data it is then inserted into the DOM.

**_And voil&agrave;!_** The user is presented with a beautiful, color coded array of data for each of their chosen cities laid out for them to easily compare, remove, and add new entries.

## Autocomplete

My Kinda Town uses [jQuery Easy Auotcomplete](http://easyautocomplete.com) to make it easier for users to find and enter the city they want. Autocomplete is making requests to a json file we provide that holds an array of urban area names that Teleport supports data for. On each keypress of the input, jQuery Easy Autocomplete will make a request to the json file and retrieve any matching results.

**[Get Started](http://michaelsolorio.com/my-kinda-town/intro/index.html)**