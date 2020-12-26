# Simple Weather Application

## Open Weather API

This weather app uses:

- fetch method to get data from the API
- Uses local storage to store multiple cities that the user has displayed on the screen, so that they appear again in the next session.
- Makes use of higher order functions to update the metric values to imperial and vice versa, when user has clicked the temperature toggle.

- Keeps track of all the changes in the local storage:
  - such as whether the temperature toggle was checked or unchecked in the previous session
  - whether the city is displayed on the screen, preventing the user to create duplicates
  - Cities can be removed from the screen by pressing the trash icon, and local storage is updated instantly

Website is responsive.

It uses string literals to update the DOM and calculates different values that are returned directly inside the string literals.

Makes minor fixes to the data returned by the API, such as capitalizing first letter from each word that describes the weather. The function below accomplishes this.

```javascript
function changeCase(weatherDesc) {
    return weatherDesc.split(" ").map(word => word.charAt(0).toUpperCase().concat(word.slice(1))).join(" ");
}
```
