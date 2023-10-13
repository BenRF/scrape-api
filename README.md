# Scrape-api

This is a scraping API based on Playwright that makes it easy to pull data from a website using HTTP requests. Playwright is a web automation tool that can control Chromium, Firefox, and WebKit browsers. It provides a high-level API for interacting with web pages, including filling out forms, clicking buttons, and extracting data.

This API makes it easy to use Playwright to scrape data from websites without having to learn Playwright itself while allowing for interoperability between code bases. To use the API, you simply send an HTTP request with the URL of the website you want to scrape and instructions for what data should be extracted and returned

## Contents:
1. [Usage](#usage)
2. [Scrape instructions:](#scrape-instructions)
   1. [get_elem](#getelem)
   2. [elem_exists](#elemexists)
   3. [page_title](#pagetitle)
   4. [get_text](#gettext)
   5. [get_price](#getprice)
   6. [get_regex](#getregex)
3. [Setup:](#local-running)
   1. [Local running](#local-running)

## Usage:
This example shows how to scrape product data from an online retailer using the API. Collecting basic information about the product including its current price and sale status:
````
curl --location 'localhost:3000/api/scrape' \
--data '{
    "url": "https://www.alternate.de/LEGO/76419-Harry-Potter-Schloss-Hogwarts-mit-Schlossgel%C3%A4nde-Konstruktionsspielzeug/html/product/1906200",
    "navOptions": {
        "timeout": 30000
    },
    "steps": {
        "name": [  { "step": "page_title" } ],
        "in_stock": [ { "step": "elem_exists", "args": "a.add-to-cart" } ],
        "price": [ { "step": "get_price", "args": "div#product-top span.price" } ],
        "price_was": [ { "step": "get_price", "args": "div#product-top span.line-through" } ],
        "description": [ { "step": "get_text", "args": "div#product-description-marketingtext > span" } ]
    }
}'
````
This request will return a JSON response with the following data:
````
{
    "name": "LEGO 76419 Harry Potter Schloss Hogwarts mit Schlossgelände, Konstruktionsspielzeug",
    "in_stock": true,
    "price": 132.9,
    "price_was": {
        "error": "div#product-top span.line-through not found"
    },
    "description": "Dieses LEGO-Set ist mit 2660 Teilen ein anspruchsvolles Bauprojekt für Fans von Harry Potter. Das Modell zum Ausstellen bringt die magische Atmosphäre von Schloss Hogwarts in das heimische Wohnzimmer. Viele Details wie der Hauptturm, der Astronomieturm, die Große Halle, das Bootshaus, die Innenhöfe, die Gewächshäuser, die Wege, die Brücken, die felsige Landschaft und der große See begeistern nicht nur beim Bauen dieses Sets, das auch Nachbildungen der Kammer des Schreckens, der Kammer der geflügelten Schlüsse, des Klassenzimmers für Zaubertränke und des Schachbrettzimmers enthält. Hinzu kommen kleine Modelle des Durmstrang-Schiffs, der Beauxbatons-Kutsche und des Ford Anglia in den Ästen der Peitschenden Weide sowie eine goldene Minifigur des Architekten von Hogwarts und eine Tafel mit der Aufschrift \"Hogwarts Castle\"."
}
````

## Scrape instructions:
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

### get_elem:
This step takes a css selector and collects the first occurrence on the page that matches, these can be chained together for extracting sub-elements and will return the innerHtml if the final step. If the element isn't found on the page an error will be returned.
````
{
    "steps": {
        "first_link": [
            { "step": "get_elem", "args": "div.product" },
            { "step": "get_elem", "args": "a[href]" }
        ]
    }
}
````
````
{ "first_link": "<a href="https://www.shop.com/product/12345" class="product-link">View this product</a>" }
````

### get_elems:
Collects all elements matching the selector, any step that occurs after will then be looped through
````
{
   "steps": {
        "prices": [
            { "step": "get_elems", "args": "span.price" },
            { "step": "get_price" }
        ]
    }
}
````
````
{ "prices": [ 329, 484, 174.9, 134.9, 40.99, 35.99, 144.9, 89.9, 69.9 ] }
````

### elem_exists:
A simple boolean instruction that allows the user to check if a selector is present on a page. Will return `true` if the element is found, otherwise will be `false`

### page_title:
Collects the page name from the site, otherwise this can be collected from the `<title></title>` element

### get_text:
Extract the innerText from an element, by default takes no argument. Can be run as the first step if a selector is passed and will extract the text
````
{
    "steps": {
        "name": [
            { "step": "get_elem", "args": "h1.product-title" },
            { "step": "get_text" }
        ]
    }
}
````
Is the same as:
````
{
    "steps": {
        "name": [ { "step": "get_text", "args": "h1.product-title" } ],
    }
}
````

### get_price:
Pulls the first match of `/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})/g` from text, similar to `get_text` it takes no argument by default and can be used in short_hand to collect an element

### get_regex:
Collects the first regex match from an elements text, takes the regex pattern as an argument


## Setup:
### Local running:
To run the server locally from the repository code, do note that by running the api the machine will hold open the browsers used for scraping. This will impact the machines memory and network usage depending on the number of incoming requests
1. Pull the git repo
2. Install the necessary modules:`npm install`
3. Run the Playwright browser installation command `npx playwright install`
4. Run the start server script: `npm run run-server`
