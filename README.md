# A Node.js API for Chicago's Divvy bikesharing service

# To run

1. `npm install`
2. `npm start`

# Authentication

You need to get your API token before accessing any endpoints.

1. Call `http://localhost:3000/auth/token` in Postman and copy the value of the token field.

2. Go to the Headers tab in Postman and add `Authorization` as a header key and `Bearer <your token here>` as the value.

3. Without your token, you will get a `403 Forbidden` response from the server.

# Endpoints

### 1. Get a bike station's info by its ID

- Each station has an ID from 2 - 673, though not all values are valid IDs.
- Send a GET request to `http://localhost:3000/station/:id` where `:id` is a number within the stated range. For example: `http://localhost:3000/station/2`

### 2. Given one or more bike stations, return the number of riders in the age groups [0-20, 21-30, 31-40, 41-50, 51+, unknown] who ended their trip at that station for a given day

- In Postman, go to the Body tab and select `x-www-form-urlencoded` and enter a key called `day` with a value in the format `YYYY-MM-DD`. Dates are valid from 2019-04-02 to 2019-06-30.
- Send a POST request to `http://localhost:3000/trip/ageGroups`
