# Fillout Responses Filterer API

- Fillout API is a RESTful API server designed to interact with Fillout.com’s API to fetch form responses with an option to filter based on specific answers.

  ## Features

    - Fetch form responses with various query parameters for flexible data retrieval.
    - Apply custom filters to responses based on specific question answers.

  ## Getting Started

  These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

  ### Prerequisites

    - Node.js
    - npm (Node Package Manager)

  ### Installing

    1. Clone the repository to your local machine.

    2. Navigate to the project directory.

    3. Install dependencies:

       ```bash
       npm install
       ```

    4. To start the server in development mode:

       ```bash
       npm run watch
       ```

    5. To build for production:

       ```bash
       npm run build
       ```

    6. To start the server in production mode:

       ```bash
       npm start
       ```

  ## API Reference

  ### Filtered Responses Endpoint

  **GET** `/:formId/filteredResponses`

  Fetches form responses with the option to apply custom filters.

  #### Query Parameters

    - **status** (string): The status of the form submissions to filter by.
    - **beforeDate** (string): Upper date limit for submissions in ISO format.
    - **afterDate** (string): Lower date limit for submissions in ISO format.
    - **filter** (string): Comma-separated strings for each filter. Format: `id,condition,value`.
    - **sort** (string): Sorting criteria for the responses.
    - **limit** (string): Number of responses per page (for pagination).
    - **offset** (string): Starting point for pagination.
    - **includeEditLink** (boolean): Flag to include edit link in responses.

  #### Filter Format and Usage

  The `filter` parameter accepts comma-separated strings, each representing a filter clause in the format `id,condition,value`. It supports multiple filter clauses, each provided as a separate `filter` query parameter.

    - **id** (string): The ID of the question to apply the filter on.
    - **condition** (string): The condition for filtering (equals, does_not_equal, greater_than, less_than).
    - **value** (string | number): The value to compare against the question's answer.

  #### Example

  ```http
  GET /cLZojxk94ous/filteredResponses/v1/api/forms/cLZojxk94ous/filteredResponses?filter=dSRAe3hygqVwTpPK69p5td,less_than,2024-04-01&filter=bE2Bo4cGUv49cjnqZ4UnkW,equals,Johnny
  ```

  This request fetches responses for form ID `cLZojxk94ous` where the answer to the question with ID `id1` equals `Timmy` and the answer to the question with ID `id2` is less than `2024-01-01`.



#### Filtering Behavior

- If no filter is included, all submissions for the specified form are returned.

- The API filters submissions to include only those containing the specified question IDs.
- Each submission is then further filtered to ensure it matches all provided filter criteria.
- A submission is included in the final response only if it meets all filter conditions for the specified question IDs.

## Deployment

The API is dockerized and deployed on Render. It can be accessed at the following URL:

```http
https://fillout-filter-7hzg.onrender.com/
```

## Built With

- [Express.js](https://expressjs.com/) - The web framework used
- [Axios](https://axios-http.com/) - HTTP client
- [TypeScript](https://www.typescriptlang.org/) - Static type definitions
- Other notable dependencies: express-validator, morgan, winston
