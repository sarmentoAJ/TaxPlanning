import { inject, NewInstance, children } from 'aurelia-framework';
import { ValidationRules, ValidationController } from 'aurelia-validation';
import noUiSlider from 'nouislider';
import wNumb from 'wnumb';

@inject(NewInstance.of(ValidationController))
export class Home {
  counter: number = 0;
  assets = [];
  name: string = '';
  type: string = '';
  value: string = '';
  filingStatus: string;
  income: string = '';
  retirementDate: string;
  endOfPlan: string;
  message = '';
  errors = []
  desiredAdditions: string = '';
  match: string = '';
  cap: string = '';
  children: string = '';
  currentAge: string = '';
  tChildren = [];
  age: number;
  childId: number = 0;

  addButton() {
    //create a new asset and add it to the assets array
    let asset = { "name": this.name, "type": this.type, "value": this.value, "match": this.match, "cap": this.cap, "id": this.counter }
    this.assets = [...this.assets, asset]
    this.counter++;
    //reset the fields
    this.name = ''
    this.type = ''
    this.value = ''
    this.match = ''
    this.cap = ''
  }

  removeButton(id) {
    let i = 0;
    //console.log("Removing",id);
    this.assets.splice(id, 1);         //remove the element that you clicked
    this.assets.forEach(element => {  //fix the array index
      element.id = i
      i++;
    });
    this.counter--;
  }

  //stores data so that it can be used on the results page
  jsonify() {
    if (this.name.length != 0 && this.type.length != 0 && this.value.length != 0) {
      this.addButton()
    }
    sessionStorage.userData = JSON.stringify(
      {
        "filingStatus": this.filingStatus,
        "income": this.income,
        "retirementDate": this.retirementDate,
        "endOfPlanDate": this.endOfPlan,
        "assets": this.assets,
        "desiredAdditions": this.desiredAdditions,
        "childrensAges": this.tChildren
      });
  }

  bind() {
    return this.assets
  }

  constructor(private controller: ValidationController) {
    ValidationRules
      .ensure((m: Home) => m.filingStatus).displayName("Filing Status").required()
      .ensure((m: Home) => m.income).displayName("Income value").required().matches(new RegExp(/[0-9]/))
      .ensure((m: Home) => m.desiredAdditions).displayName("Additions").required().matches(new RegExp(/[0-9]/))
      .ensure((m: Home) => m.currentAge).displayName("Current Age").required().matches(new RegExp(/[0-9]/))
      .on(this);
  }

  validateButton() {
    this.jsonify()
    this.controller
      .validate()
      .then(v => {
        if (v.valid)
          window.location.href = "http://localhost:8080/results"
        else
          this.message = "You have errors!";
        this.errors = v.results;
      })
  }



// sliders starts here
attached() {
  var from = new Date().getFullYear() + 1
  var to = from + 80
  var dates = [];
  var range: noUiSlider = <noUiSlider>document.getElementById("range");
  var Matchtext = document.getElementById("Matchtext")
  var Ematch = document.getElementById("Ematch")
  var Ecap = document.getElementById("Ecap")
  var Captext = document.getElementById("Captext")
  var typeSelector: HTMLSelectElement;
  var statusSelector: HTMLSelectElement;
  var incomeText = document.getElementById("incomeRange")

  for (let i = from; i <= to; i += 5) {
    dates.push(i) //get all the years from now for 80 years
  }

  //create slider
  noUiSlider.create(range, {
    start: [from, to],
    range: {
      min: from,
      max: to
    },
    tooltips: true,
    connect: true,
    step: 1,
    format: wNumb({
      decimals: 0
    }),
    pips: {
      mode: 'values',
      values: dates,
      steped: true,
      density: 12
    }
  });

  //save the data when the slider changes value
  range.noUiSlider.on('change', function () {
    this.retirementDate = range.noUiSlider.get()[0]
    this.endOfPlan = range.noUiSlider.get()[1]
  });

  //if they are adding a 401k have options for employer match
  typeSelector = <HTMLSelectElement>document.getElementById("Atype")
  typeSelector.addEventListener("change", function (event) {
    if (this.value == "Roth 401k" || this.value == "401k") {
      Matchtext.style.display = "block"
      Ematch.style.display = "block"
      Ecap.style.display = "block"
      Captext.style.display = "block"
    }
    else {
      Matchtext.style.display = "none"
      Ematch.style.display = "none"
      Ecap.style.display = "none"
      Captext.style.display = "none"
    }
  });

  //if they are filing jointly we need combined income
  statusSelector = <HTMLSelectElement>document.getElementById("filing")
  statusSelector.addEventListener("change", function (event) {
    if (this.value == "Joint") {
      incomeText.innerText = "Enter Joint Income:"
    }
    else {
      incomeText.innerText = "Enter Income:"
    }
  })
}

  
  addChildren() {
    var child = {"age":this.age,"id":this.childId}
    this.tChildren = [...this.tChildren, child]
    this.childId++;
    }
     
    removeChild(id){
    let i = 0;
    this.tChildren.splice(id, 1); //remove the element that you clicked
    this.tChildren.forEach(element => { //fix the array index
    element.id = i
    i++;
    });
    this.childId--;
    }
}
