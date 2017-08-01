# My Kinda Town

A responsive web app that helps prospective transplants make their next move by providing information about major cities around the world. Enter a city to get key metrics for that city. Enter more cities and compare your favorite picks side by side.

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

When a city is typed in and submitted, the initial event listener is triggered, ([`listenForAddCityButtonClick`](https://github.com/msolorio/my-kinda-town/blob/master/js/app.js#L358)) and we make an HTTP request passing in the sanitized input value ([`getCityInputVal`](https://github.com/msolorio/my-kinda-town/blob/master/js/app.js#L224)) as the search parameter and an embed query parameter ([`getCityData`](https://github.com/msolorio/my-kinda-town/blob/master/js/app.js#L304)).

The embed we pass in follows the [HAL standard](http://stateless.co/hal_specification.html) for designing APIs. It allows us to link together associated data from various API endpoints and retrieve all of that data in a single request. In our case, the embed query parameter we pass in specifies that we want to look up the specific city passed as the search parameter, find it's associated urban area, and find the quality of life data for that urban area. If a city exists for the passed in search term and an associated urban area is found for that city ([`updateDataInState`](https://github.com/msolorio/my-kinda-town/blob/master/js/app.js#L285)), that data is then passed to functionality to manipulate the data before it is added to state.

### Manipulating the Data

We build a new city object that will hold our new city data. ([`addCityDataToState`](https://github.com/msolorio/my-kinda-town/blob/master/js/app.js#L266)) We then merge the incoming quality of life data with any specific configurations we've set. ([`categoriesConfigurations`](https://github.com/msolorio/my-kinda-town/blob/master/js/app.js#L35)) In our configurations we specify whether or not we want to display that category, if we want to replace an ambiguous category name, and the position in the list the category will be rendered in. Once the data is merged we add it to the city object along with the city name, push the city object into the state.cities array and continue on to rendering state. 

### Rendering the City Description Bars

Using JavaScript's reduce method we then loop through each object in state.cities and build a string including an city name and description bar for each city. ([`renderDescription`](https://github.com/msolorio/my-kinda-town/blob/master/js/app.js#L170)) We attach the array index of each city object to the bars for jQuery to latch on to when either the remove city button is clicked or the show description button is clicked. We calculate a color index with `index % 7`. The resulting color index value is associate with one of seven colors specified in our [main.css](https://github.com/msolorio/my-kinda-town/blob/master/css/main.css#L302) file. The generated markup for the description bars is then appended to the DOM.

### Rendering the Category Data

We render our categories in much the same way as rendering our description bars except this time we loop through the array of categories. ([`renderCategories`](https://github.com/msolorio/my-kinda-town/blob/master/js/app.js#L153)) For each category we loop through each city and build a string for the rating bars. ([`renderRatingBars`](https://github.com/msolorio/my-kinda-town/blob/master/js/app.js#L129)) We pass in the score from our city data object as the width value for that inner rating bar as well as the color index. Because the color index is based on the city's index in the state.cities array, the description bars and rating bars will match for each city. Once the markup is generated for all category data it is then inserted into the DOM.

**_And voil&agrave;!_** The user is presented with a beautiful, color coded array of data for each of their chosen cities laid out for them to easily compare, remove, and add new entries.

## Autocomplete

My Kinda Town uses [jQuery Easy Auotcomplete](http://easyautocomplete.com) to make it easier for users to find and enter the city they want. Autocomplete is making requests to a json file we provide that holds an array of urban area names that Teleport supports data for. On each keypress of the input, jQuery Easy Autocomplete will make a request to the json file and retrieve any matching results.

**[Get Started](http://michaelsolorio.com/my-kinda-town/intro/index.html)**
