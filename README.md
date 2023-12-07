# Scrape-api

This is a scraping API based on Playwright that makes it easy to pull data from a website using HTTP requests. Playwright is a web automation tool that can control Chromium, Firefox, and WebKit browsers. It provides a high-level API for interacting with web pages, including filling out forms, clicking buttons, and extracting data.

This API makes it easy to use Playwright to scrape data from websites without having to learn Playwright itself while allowing for interoperability between code bases. To use the API, you simply send an HTTP request with the URL of the website you want to scrape and instructions for what data should be extracted and returned

## Contents:
1. [Usage](#usage)
2. [Scrape instructions](#scrape-instructions)
3. [Setup:](#local-running)
   1. [Docker](#docker)
   2. [Local running](#local-running)

## Usage:
This example shows how to scrape product data from an online retailer using the API. Collecting basic information about the product including its current price and sale status:
````
curl --location 'localhost:3000/api/scrape' \
--data '{
  "url": "https://www.alternate.de/LEGO/76419-Harry-Potter-Schloss-Hogwarts-mit-Schlossgel%C3%A4nde-Konstruktionsspielzeug/html/product/1906200",
  "navOptions": { "timeout": 30000 },
  "browser": "firefox",
  "steps": {
    "name": [{ "step": "page_title" }],
    "in_stock": [{ "step": "elem_exists", "args": "a.add-to-cart" }],
    "price": [{ "step": "get_price", "args": "div#product-top span.price" }],
    "price_was": [{ "step": "get_price", "args": "div#product-top span.line-through"}],
    "image": [
      { "step": "get_elem", "args": "div#product-gallery-big-slider > div:nth-child(1) img" },
      { "step": "get_attribute","args": "src" }
    ],
    "brandLink": [{ "step": "get_link", "args": "a.product-manufacturer-logo" }],
    "description": [{ "step": "get_text", "args": "div#product-description-tab div.card-body" }]
  }
}'
````
This request will return a JSON response with the following data:
````
{
  "id": "8667d730",
  "stats": {
    "request": 4599,
    "navigation": 800
  },
  "results": {
    "name": "LEGO 76419 Harry Potter Schloss Hogwarts mit Schlossgelände, Konstruktionsspielzeug",
    "price_was": {
      "warning": "div#product-top span.line-through not found"
    },
    "image": {
      "warning": "div#product-gallery-big-slider > div:nth-child(1) img not found"
    },
    "in_stock": true,
    "price": 129.9,
    "brandLink": "/LEGOShop",
    "description": "Produktbeschreibung\nDieses LEGO-Set ist mit 2660 Teilen ein anspruchsvolles Bauprojekt für Fans von Harry Potter. Das Modell zum Ausstellen bringt die magische Atmosphäre von Schloss Hogwarts in das heimische Wohnzimmer. Viele Details wie der Hauptturm, der Astronomieturm, die Große Halle, das Bootshaus, die Innenhöfe, die Gewächshäuser, die Wege, die Brücken, die felsige Landschaft und der große See begeistern nicht nur beim Bauen dieses Sets, das auch Nachbildungen der Kammer des Schreckens, der Kammer der geflügelten Schlüsse, des Klassenzimmers für Zaubertränke und des Schachbrettzimmers enthält. Hinzu kommen kleine Modelle des Durmstrang-Schiffs, der Beauxbatons-Kutsche und des Ford Anglia in den Ästen der Peitschenden Weide sowie eine goldene Minifigur des Architekten von Hogwarts und eine Tafel mit der Aufschrift \"Hogwarts Castle\".\nArt.-Nr.: 1906200"
  }
}
````

## Scrape instructions:

### Scrape requests:
Not all fields are required, but can allow for more customisation or compatibility with certain websites
<pre><code>{
  "url": the url to scrape,
  "navOptions": (optional) passed along to the <a href="https://playwright.dev/docs/api/class-page#page-goto">page.goto function</a>
  "browser": (optional) browser id that the scrape should run on
  "context": (optional) browser context to run the scrape on, should match <a href="https://playwright.dev/docs/api/class-browser#browser-new-context">newContext options</a>
  "waitFor": (optional) an array of selectors to find on the page before running the steps, the request will fail if not found
  "steps": { 
    an object describing the values to collect and steps of how to collect them
    "result name": [ scrapeFunction call objects, run in the order of the array ],
    ...
  }
}</code></pre>

### Ordering:
The API allows users to layer instructions, so they have better control over what is extracted and how it is manipulated. The order of these steps allowing for different operations to be performed. Following the example above, if we wanted to extract the Lego kit ID we could update the name field with an extra step to extract the value from the pages title:
````
{
    "steps": {
        "name": [
            { "step": "page_title" },
            { "step": "get_regex", "args": "\d{5}" }
        ]
    }
}
````

### Available steps:
* [sub_steps](functions/scrapeFunctions/sub_steps.js): Collect multiple fields for a field
* [elem_exists](functions/scrapeFunctions/elem_exists.js): Check if an element can be found on a page
* [get_elem](functions/scrapeFunctions/get_elem.js): Finds the first occurrence of a matching element
* [get_elems](functions/scrapeFunctions/get_elems.js): Finds all occurrences of matching elements
* [get_price](functions/scrapeFunctions/get_price.js): Extracts a price from elements text
* [get_regex](functions/scrapeFunctions/get_regex.js): Runs a regex pattern on an element and returns the first match
* [get_text](functions/scrapeFunctions/get_text.js): Collects text inside an element
* [page_title](functions/scrapeFunctions/page_title.js): Returns the page title
* [page_title](functions/scrapeFunctions/page_url.js): Returns the url of the page
* [xpath](functions/scrapeFunctions/xpath.js): Runs a xpath

### Sub-steps:
One of the available instructions allows for a set of instructions to be run for a single field, this can be useful if you're trying to pull multiple fields from multiple elements
````
{
    "steps": {
        "products": [
            { "step": "get_elems", "args": ".product-list > div" },
            { 
                "step": "sub_steps", "args": {
                    "title": [{ "step": "get_text", "args": ".name" }],
                    "price": [{ "step": "get_price", "args": ".price" }]
                }
            }
        ]
    }
}
````
Would return:
````
{
   "products": [
      { "title": "productA", "price": 5 },
      { "title": "productB", "price": 3.52 },
      { "title": "productC", "price": 25.2 },
   ]
}
````

### Browser management:
One of the main standout features of Playwright is its ability to work with multiple browsers, this is carried on into the api by: allowing you to select which browser to use per scrape request and create custom browser instances by passing in the same playwright browser parameters.

If a browser is unused for a set time period (5 minutes by default) the api will close the browser, but each instance is stored and can be reopened when a scrape request calls it.

### List all browsers:
To see the status along with parameters of all the browsers currently registered with the api, call a GET request on the `/browser/list` endpoint
````
{
  "total": 3,
  "browsers": [
    {
      "id": "chromium",
      "status": "closed",
      "type": "chromium",
      "used": 0,
      "last_used": null
    },
    {
      "id": "firefox",
      "status": "open",
      "type": "firefox",
      "used": 1,
      "last_used": "2023-12-07T21:05:01.924Z"
    },
    {
      "id": "webkit",
      "status": "closed",
      "type": "webkit",
      "used": 0,
      "last_used": null
    }
  ]
}
````

### Opening a new browser:
If you want to make a new browser instance you can send a POST request to `/browser/create`, the name parameter can be one of `chromium`, `firefox` or `webkit` and the args field matches the [playwright browser launch parameters](https://playwright.dev/docs/api/class-browsertype#browser-type-launch). From this request you will be given a browser ID you can pass in scrape requests to use the new browser.

````
{
  "name": "chromium",
  "args": {
    "proxy": {
      "server": "http://totallyRealProxy.com:5432",
      "username": "proxy-user",
      "password": "proxy-pass"
    }
  }
}
````
````
{ "id": "3507b3", "type": "chromium" }
````

## Setup:
### Docker:
For easier setup & management, this project can be run from a container
````
docker run -p 3000:3000 ghcr.io/benrf/scrape-api:master
````

### Local running:
To run the server locally from the repository code, do note that by running the api the machine will hold open the browsers used for scraping. This will impact the machines memory and network usage depending on the number of incoming requests
1. Pull the git repo
2. Install the necessary modules:`npm install`
3. Run the Playwright browser installation command `npx playwright install`
4. Run the start server script: `npm run run-server`
