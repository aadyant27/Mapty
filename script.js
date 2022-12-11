"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class Workout {
  //Public Fields
  date = new Date();
  id = (Date.now() + "").slice(-10); //Creating id by converting the Data into a string and then taking last 10 characters.
  constructor(coords, distance, duration) {
    this.coords = coords; // [latitude, longitude]
    this.distance = distance; // kilometer
    this.duration = duration; // minutes
  }
}

class Running extends Workout {
  //PUBLIC FIELD
  type = "running";

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    // this.type = 'running' //Instead we defined it as a public field
    this.calcPace();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([39, -12], 12, 6, 5.2);
// const cycle1 = new Cycling([39, -12], 12, 6, 125.2);
// console.log(cycle1);

///////////////////////////////////////////////////
////APPLICATION ARCHITECTURE
class App {
  //private class fields
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();
    form.addEventListener("submit", this._newWorkout.bind(this));

    inputType.addEventListener("change", this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function (err) {
          alert(err);
        }
      );
    }
  }

  _loadMap(pos) {
    console.log(pos);
    const { latitude } = pos.coords;
    const { longitude } = pos.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude},5z`);

    this.#map = L.map("map").setView([latitude, longitude], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");

    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    e.preventDefault();

    //helper function to check if input is valid or not
    const validInputs = (...inputs) => inputs.every((input) => isNaN(input));
    const allPositive = (...inputs) => inputs.every((input) => input > 0);
    //GET DATA FROM THE FORM
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    //LATITUDE & LONGITUDE
    const { lat, lng } = this.#mapEvent.latlng;
    //Defining workout object to store running / cycling workout object
    let workout;

    //CREATE RUNNING/CYCLING OBJECT BASED ON INPUT
    if (type === "running") {
      const cadence = +inputCadence.value;

      if (validInputs(duration, distance, cadence))
        return alert("Input must be a number");

      if (!allPositive(duration, distance, cadence))
        return alert("Inputs must be a Positive Number");

      //create running object(to add to the workouts array)
      workout = new Running([lat, lng], distance, duration, cadence);
    }
    if (type === "cycling") {
      const elevation = +inputElevation.value;

      if (validInputs(duration, distance, elevation))
        return alert("Inputs have to a number");
      if (!allPositive(duration, distance))
        return alert("Inputs except Elevation-Gain must be a Positive Number");

      //create cycling object(to add to the workouts array)
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    //ADD NEW OBJCT TO WORKOUT ARRAY
    this.#workouts.push(workout);
    console.log(this.#workouts);
    //RENDER WORKOUT ON MAP & LIST

    //HIDE FORM
    //Clearing the input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";

    //RENDERING THE WORKOUT ON THE DOM IN THE FORM OF A MARKER
    this._renderWorkoutMarker(workout);
  }

  _renderWorkoutMarker(workout) {
    const lat = workout.coords[0];
    const lng = workout.coords[1];
    console.log(workout.type);
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent("workout.distance")
      .openPopup();
  }
}

const app = new App();
