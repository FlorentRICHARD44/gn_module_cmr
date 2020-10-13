import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { BaseChartDirective,  } from 'ng2-charts';

/**
 * This component set breadcrumbs in the view. The breadcrumbs are composed of:
 * - home : already set by default
 * - path : all parent pathes of this view except the home. it is an array with objects {"text": "name of the path", "link": the link for routerLink }
 * - currentPath: the name of the current page. it is not a link.
 */
@Component({
    selector: 'gn-cmr-graph',
    templateUrl: './graph.component.html'
})
export class GraphComponent implements OnInit{
    @ViewChild(BaseChartDirective) chart: BaseChartDirective;
    public chartType = "line";
    public chartData = [
      { data: [1,3,9], label: "Poids"}/*,
    { data: [25,26,32], label: "Taille"}*/]; // Default value, initialize with 10 values
    public chartLabels = [new Date("10-10-2018"),new Date("09-11-2020"),new Date("10-13-2020")];
    public chartColors = [{ // dark grey
        backgroundColor: 'rgba(0,0,0,0.0)',
      borderColor: 'rgba(77,83,96,1)'
    }/*,
    { // red
      backgroundColor: 'rgba(255,0,0,0)',
      borderColor: 'red',
    }*/];
    public chartOptions = {
      responsive: true,
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit:'day',
            displayFormats: {
                day: 'D/M/YYYY'
            }
          }
        }]
      }
    };

    @Input()
    public set options(value) {
        this.chartLabels = [];
        this.chartData = [];
        var dataItems = [];
        var data = value.data;
        // force sorting by date.
        data = data.sort(function(a,b) {
            return +new Date(b['x']) - +new Date(a['x']);
        });
        for (let d in data) {
            this.chartLabels.push(data[d]['x']);
            dataItems.push(data[d]['y']);
        }
        this.chartColors[0].borderColor = value.color;
        this.chartData = [{data: dataItems, label: value.label}];
    }

    constructor() {}
    
    ngOnInit() {
        
    }


}